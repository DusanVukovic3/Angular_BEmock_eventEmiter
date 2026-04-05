import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { ErrorMessage } from '../../shared/error-message/error-message';
import { CreateItem } from '../create-item/create-item';
import { FloatingNotification } from '../../shared/floating-notification/floating-notification';
import { Subscription, forkJoin } from 'rxjs';
import { Item } from '../../models/item.model';
import { Category } from '../../models/category.model';
import { ItemsApiService } from '../../services/items-api.service';
import { CategoriesApiService } from '../../services/categories-api.service';
import { ItemEventsService } from '../../services/item-events.service';

@Component({
  selector: 'app-item-list',
  imports: [CurrencyPipe, RouterLink, LoadingSpinner, StatusBadge, ErrorMessage, CreateItem, FloatingNotification],
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss',
})
export class ItemList implements OnInit, OnDestroy {
  items = signal<Item[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showModal = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'info' | 'warning'>('info');

  nameFilter = signal('');
  statusFilter = signal('');
  sortColumn = signal<'name' | 'price' | 'warrantyMonths' | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  filteredItems = computed(() => {
    const name = this.nameFilter().toLowerCase();
    const status = this.statusFilter();
    const col = this.sortColumn();
    const dir = this.sortDir();

    const filtered = this.items().filter(
      (item) =>
        (!name || item.name.toLowerCase().includes(name)) && (!status || item.status === status),
    );

    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[col] ?? -Infinity;
      const bVal = b[col] ?? -Infinity;
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  sort(col: 'name' | 'price' | 'warrantyMonths'): void {
    if (this.sortColumn() !== col) {
      this.sortColumn.set(col);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortColumn.set(null); //  Default sortiranje
    }
  }

  private itemsService = inject(ItemsApiService);
  private categoriesService = inject(CategoriesApiService);
  private eventsService = inject(ItemEventsService);
  private eventsSub = new Subscription();

  ngOnInit(): void {
    this.loadItems();
    this.eventsSub = this.eventsService.events$.subscribe((event) => {
      //  Testiranje da vidimo da l se dobija event i koji
      console.log('[ItemEvents]', event);
      //  Uzimamo event iz ItemEventsService i zavisno kakav je signal, dodajemo, update ili brisemo item iz liste
      if (event.type === 'ItemCreated') {
        //  Takodje obavesti items[] clone pool u servisu za novi/update/obrisani item, kako bismo mogli te nove da vidimo/editujemo/brisemo
        this.itemsService.registerFromEvent(event.item);
        this.items.update((items) => [...items, event.item]);
        this.toastType.set('success');
        this.toastMessage.set(`Item "${event.item.name}" was created.`);
      } else if (event.type === 'ItemUpdated') {
        this.itemsService.registerFromEvent(event.item);
        this.items.update((items) => items.map((i) => (i.id === event.item.id ? event.item : i)));
        this.toastType.set('info');
        this.toastMessage.set(`Item "${event.item.name}" was updated.`);
      } else if (event.type === 'ItemDeleted') {
        this.itemsService.removeFromEvent(event.itemId);
        this.items.update((items) => items.filter((i) => i.id !== event.itemId));
        this.toastType.set('warning');
        this.toastMessage.set(`An item was deleted.`);
      }
    });
  }

  //  OnDestroy kako bismo sklonili subskripciju od ItemEventService ako smo na nekoj drugoj komponenti
  ngOnDestroy(): void {
    this.eventsSub.unsubscribe();
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      //  Nemoj cekati prvi api call za items da se zavrsi vec pokreni oba odjednom
      items: this.itemsService.getAll(),
      categories: this.categoriesService.getAll(),
    }).subscribe({
      next: ({ items, categories }) => {
        this.items.set(items);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load items. Please try again.');
        this.loading.set(false);
      },
    });
  }

  getCategoryName(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
  }

  onItemCreated(newItem: Item): void {
    this.items.update((items) => [...items, newItem]);
    this.showModal.set(false);
  }
}
