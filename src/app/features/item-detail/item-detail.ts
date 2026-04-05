import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { Item } from '../../models/item.model';
import { Category } from '../../models/category.model';
import { ItemsApiService } from '../../services/items-api.service';
import { CategoriesApiService } from '../../services/categories-api.service';
import { ItemEventsService } from '../../services/item-events.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { ErrorMessage } from '../../shared/error-message/error-message';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { ItemForm, ItemFormValue } from '../../shared/item-form/item-form';

@Component({
  selector: 'app-item-detail',
  imports: [
    CurrencyPipe,
    RouterLink,
    LoadingSpinner,
    StatusBadge,
    ErrorMessage,
    ConfirmModal,
    ItemForm,
  ],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.scss',
})
export class ItemDetail implements OnInit, OnDestroy {
  item = signal<Item | null>(null); //  Kada se inicijalizuje komponenta, prvo je item null dok se ne popuni sa getById
  categories = signal<Category[]>([]);
  categoryName = computed(() => {
    const item = this.item();
    if (!item) return '';
    const category = this.categories().find((c: Category) => c.id === item.categoryId);
    return category?.name ?? item.categoryId;
  });
  loading = signal(true);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null); //  Dve greske, prva je za ucitavanje, druga je za create/update/delete
  editMode = signal(false);
  saving = signal(false);
  showDeleteConfirm = signal(false);
  conflictWarning = signal(false);
  pendingExternalItem = signal<Item | null>(null);
  deletedByEvent = signal(false);
  updatedByEvent = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemsService = inject(ItemsApiService);
  private categoriesService = inject(CategoriesApiService);
  private eventsService = inject(ItemEventsService);
  private eventsSub = new Subscription();

  private id = this.route.snapshot.paramMap.get('id')!;

  ngOnInit(): void {
    this.loadItem();
    this.eventsSub = this.eventsService.events$.subscribe((event) => {
      console.log('[ItemDetail]', event);

      //  Sinhronizuj ItemsApiService sa eventom koji stigne dok smo na details komponenti
      if (event.type === 'ItemCreated' || event.type === 'ItemUpdated') {
        this.itemsService.registerFromEvent(event.item);
      } else if (event.type === 'ItemDeleted') {
        this.itemsService.removeFromEvent(event.itemId);
      }

      if (event.type === 'ItemUpdated' && event.item.id === this.id) {
        if (this.editMode()) {
          //  Obavesti korisnika u edit modu da je event emiter editovao bas ovaj item
          this.pendingExternalItem.set(event.item);
          this.conflictWarning.set(true);
        } else {
          //  Posto nije u edit modu, promeni detalje itema
          this.item.set(event.item);
          this.updatedByEvent.set(true);
        }
      } else if (event.type === 'ItemDeleted' && event.itemId === this.id) {
        //  Ako korisnik edituje item koji je bas u tom trenutku obrisan od strane event emitera, vrati ga na details sa obavestenjem
        this.editMode.set(false);
        this.conflictWarning.set(false);
        this.deletedByEvent.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSub.unsubscribe();
  }

  loadItem(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      //  Pararelno dohvatanje podataka
      item: this.itemsService.getById(this.id),
      categories: this.categoriesService.getAll(),
    }).subscribe({
      next: ({ item, categories }) => {
        this.item.set(item);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.status === 404 ? 'Item not found.' : 'Failed to load details.');
        this.loading.set(false);
      },
    });
  }

  enterEditMode(): void {
    this.saveError.set(null);
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.saveError.set(null);
    this.conflictWarning.set(false);
    this.pendingExternalItem.set(null);
    this.editMode.set(false);
  }

  resolveConflictDiscard(): void {
    this.item.set(this.pendingExternalItem()!);
    this.conflictWarning.set(false);
    this.pendingExternalItem.set(null);
    this.editMode.set(false);
  }

  resolveConflictKeep(): void {
    this.conflictWarning.set(false);
    this.pendingExternalItem.set(null);
  }

  onSave(value: ItemFormValue): void {
    this.saveError.set(null);
    this.saving.set(true);
    this.itemsService.update(this.id, value).subscribe({
      next: (updated) => {
        this.item.set(updated);
        this.editMode.set(false);
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('Failed to save changes.');
        this.saving.set(false);
      },
    });
  }

  onDeleteResult(confirmed: boolean): void {
    this.showDeleteConfirm.set(false);
    if (!confirmed) return;
    this.saving.set(true);
    this.itemsService.delete(this.id).subscribe({
      next: () => this.router.navigate(['/items']),
      error: () => {
        this.saveError.set('Failed to delete item.');
        this.saving.set(false);
      },
    });
  }
}
