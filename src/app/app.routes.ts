import { Routes } from '@angular/router';
import { ItemList } from './features/item-list/item-list';
import { ItemDetail } from './features/item-detail/item-detail';

export const routes: Routes = [
  { path: 'items', component: ItemList },
  { path: 'items/:id', component: ItemDetail },
  { path: '', redirectTo: 'items', pathMatch: 'full' },
];
