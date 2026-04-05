import { Item } from '../models/item.model';
import { Category } from '../models/category.model';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Furniture' },

  { id: 'cat-3', name: 'Clothing' },  //  ostalo
  { id: 'cat-4', name: 'Books' },
  { id: 'cat-5', name: 'Sports' },
];

export const SEED_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: 'Laptop Pro 15',
    categoryId: 'cat-1',
    status: 'active',
    price: 1299.99,
    warrantyMonths: 24,
  },
  {
    id: 'item-2',
    name: 'Wireless Mouse',
    categoryId: 'cat-1',
    status: 'active',
    price: 49.99,
    warrantyMonths: 12,
  },
  {
    id: 'item-3',
    name: 'Standing Desk',
    categoryId: 'cat-2',
    status: 'active',
    price: 599.0,
    weight: 35,
    dimensions: '150x75x120 cm',
  },
  {
    id: 'item-4',
    name: 'Office Chair',
    categoryId: 'cat-2',
    status: 'inactive',
    price: 349.99,
    weight: 18,
    dimensions: '65x65x110 cm',
  },
  {
    id: 'item-5',
    name: 'Winter Jacket',
    categoryId: 'cat-3',
    status: 'active',
    price: 189.99,
  },
  {
    id: 'item-6',
    name: 'Running Shoes',
    categoryId: 'cat-3',
    status: 'discontinued',
    price: 129.99,
  },
  {
    id: 'item-7',
    name: 'TypeScript Handbook',
    categoryId: 'cat-4',
    status: 'active',
    price: 39.99,
  },
  {
    id: 'item-8',
    name: 'Angular in Action',
    categoryId: 'cat-4',
    status: 'active',
    price: 44.99,
  },
  {
    id: 'item-9',
    name: 'Yoga Mat',
    categoryId: 'cat-5',
    status: 'active',
    price: 29.99,
  },
  {
    id: 'item-10',
    name: 'Bluetooth Headphones',
    categoryId: 'cat-1',
    status: 'inactive',
    price: 199.99,
    warrantyMonths: 18,
  },
];
