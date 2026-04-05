import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Item } from '../../models/item.model';
import { Category } from '../../models/category.model';


export interface ItemFormValue {
  name: string;
  price: number;
  categoryId: string;
  status: string;
  warrantyMonths?: number;
  weight?: number;
  dimensions?: string;
}

@Component({
  selector: 'app-item-form',
  imports: [ReactiveFormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss',
})
export class ItemForm implements OnInit {
  categories = input.required<Category[]>();
  item = input<Item | null>(null);
  saving = input<boolean>(false);
  submitted = output<ItemFormValue>();
  cancelled = output<void>();

  isEditMode = computed(() => this.item() !== null);
  selectedCategoryId = signal('');
  showWarranty = computed(() => this.selectedCategoryId() === this.categories().find((c) => c.name === 'Electronics')?.id);
  showFurniture = computed(() => this.selectedCategoryId() === this.categories().find((c) => c.name === 'Furniture')?.id);
  noChangesError = signal(false);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl('', Validators.required),
    status: new FormControl('active', Validators.required),
    warrantyMonths: new FormControl<number | null>(null),
    weight: new FormControl<number | null>(null),
    width: new FormControl<number | null>(null),
    height: new FormControl<number | null>(null),
    depth: new FormControl<number | null>(null),
  });

  private initialSnapshot = '';

  ngOnInit(): void {
    this.form.controls.categoryId.valueChanges.subscribe((id) => {
      this.selectedCategoryId.set(id ?? '');
      this.updateDynamicValidators(id ?? '');
    });

    const item = this.item();
    if (item) {
      this.selectedCategoryId.set(item.categoryId);
      this.updateDynamicValidators(item.categoryId);
      this.form.setValue({
        name: item.name,
        price: item.price,
        categoryId: item.categoryId,
        status: item.status,
        warrantyMonths: item.warrantyMonths ?? null,
        weight: item.weight ?? null,
        width: item.dimensions ? +item.dimensions.split('x')[0] : null,
        height: item.dimensions ? +item.dimensions.split('x')[1] : null,
        depth: item.dimensions ? +item.dimensions.split('x')[2].replace(' cm', '') : null,
      });
      this.initialSnapshot = JSON.stringify(this.form.value);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isEditMode() && JSON.stringify(this.form.value) === this.initialSnapshot) {
      this.noChangesError.set(true);
      return;
    }
    this.noChangesError.set(false);
    const v = this.form.value;
    this.submitted.emit({
      name: v.name!,
      price: v.price!,
      categoryId: v.categoryId!,
      status: v.status!,
      ...(this.showWarranty() && v.warrantyMonths != null ? { warrantyMonths: v.warrantyMonths } : {}),
      ...(this.showFurniture() && v.weight != null ? { weight: v.weight } : {}),
      ...(this.showFurniture() && v.width && v.height && v.depth
        ? { dimensions: `${v.width}x${v.height}x${v.depth} cm` }
        : {}),
    });
  }

  private updateDynamicValidators(categoryId: string): void {
    const { warrantyMonths, weight, width, height, depth } = this.form.controls;

    warrantyMonths.clearValidators();
    weight.clearValidators();
    width.clearValidators();
    height.clearValidators();
    depth.clearValidators();

    const electronicsId = this.categories().find((c) => c.name === 'Electronics')?.id;
    const furnitureId = this.categories().find((c) => c.name === 'Furniture')?.id;

    if (categoryId === electronicsId) {
      warrantyMonths.setValidators([Validators.required, Validators.min(1)]);
    } else if (categoryId === furnitureId) {
      weight.setValidators([Validators.required, Validators.min(0)]);
      width.setValidators([Validators.required, Validators.min(1)]);
      height.setValidators([Validators.required, Validators.min(1)]);
      depth.setValidators([Validators.required, Validators.min(1)]);
    }

    warrantyMonths.updateValueAndValidity();
    weight.updateValueAndValidity();
    width.updateValueAndValidity();
    height.updateValueAndValidity();
    depth.updateValueAndValidity();
  }
}
