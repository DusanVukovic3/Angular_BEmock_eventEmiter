import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { ItemEvent } from '../models/item-event.model';
import { Item } from '../models/item.model';
import { CATEGORIES } from '../data/seed-items';

@Injectable({ providedIn: 'root' })
export class ItemEventsService implements OnDestroy {
  private readonly eventsSubject = new Subject<ItemEvent>();
  private readonly subscription: Subscription;
  private internalItems: Item[] = [];
  private nextId = 1000;

  readonly events$: Observable<ItemEvent> = this.eventsSubject.asObservable();

  constructor() {
    this.subscription = interval(3_000).subscribe(() => this.emitRandomEvent());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.eventsSubject.complete();
  }

  private emitRandomEvent(): void {
    const roll = Math.random();

    if (roll < 0.4 || this.internalItems.length === 0) {
      this.emitCreate();
    } else if (roll < 0.75) {
      this.emitUpdate();
    } else {
      this.emitDelete();
    }
  }

  private emitCreate(): void {
    const item = this.generateRandomItem();
    this.internalItems.push(item);
    this.eventsSubject.next({
      type: 'ItemCreated',
      item: structuredClone(item),
    });
  }

  private emitUpdate(): void {
    const item = this.pickRandom(this.internalItems);
    item.price = +(item.price * (0.8 + Math.random() * 0.4)).toFixed(2);
    item.status = this.pickRandom(['active', 'inactive', 'discontinued']);
    this.eventsSubject.next({
      type: 'ItemUpdated',
      item: structuredClone(item),
    });
  }

  private emitDelete(): void {
    const index = Math.floor(Math.random() * this.internalItems.length);
    const [removed] = this.internalItems.splice(index, 1);
    this.eventsSubject.next({ type: 'ItemDeleted', itemId: removed.id });
  }

  private generateRandomItem(): Item {
    const names = [
      'Smart Watch',
      'Bookshelf',
      'Denim Jacket',
      'Cookbook',
      'Tennis Racket',
      'Monitor 27"',
      'Sofa',
      'Sneakers',
      'Novel',
      'Dumbbells',
    ];

    const category = this.pickRandom(CATEGORIES);

    const item: Item = {
      id: `evt-item-${this.nextId++}`,
      name: this.pickRandom(names),
      categoryId: category.id,
      status: this.pickRandom(['active', 'inactive']), //  Taman ne moramo nista dodatno da dodajemo u dropdown search, ostaje 3 opcije
      price: +(10 + Math.random() * 500).toFixed(2),
    };

    if (category.name === 'Electronics') {
      item.warrantyMonths = this.pickRandom([6, 12, 24, 36]);
    } else if (category.name === 'Furniture') {
      item.weight = +(5 + Math.random() * 50).toFixed(1);
      item.dimensions = `${Math.floor(50 + Math.random() * 150)}x${Math.floor(30 + Math.random() * 100)}x${Math.floor(30 + Math.random() * 120)} cm`;
    }

    return item;
  }

  private pickRandom<T>(arr: T[] | readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
