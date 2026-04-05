import { Component, inject, input, output, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { Item } from '../../models/item.model';
import { ItemsApiService } from '../../services/items-api.service';
import { ItemForm, ItemFormValue } from '../../shared/item-form/item-form';

@Component({
  selector: 'app-create-item',
  imports: [ItemForm],
  templateUrl: './create-item.html',
  styleUrl: './create-item.scss',
})
export class CreateItem {
  categories = input.required<Category[]>();
  saved = output<Item>();
  closed = output<void>(); //  Kada se klikne x ili pored modala

  saveError = signal<string | null>(null);
  saving = signal(false);

  private itemsService = inject(ItemsApiService);

  onSubmit(value: ItemFormValue): void {
    this.saving.set(true);
    this.saveError.set(null);
    this.itemsService.create(value).subscribe({
      next: (newItem) => {
        this.saving.set(false);
        this.saved.emit(newItem);
      },
      error: () => {
        this.saveError.set('Failed to create item. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
