import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Item } from '../models/item.model';
import { SEED_ITEMS } from '../data/seed-items';

@Injectable({ providedIn: 'root' })
export class ItemsApiService {
  private items: Item[] = structuredClone(SEED_ITEMS);
  private nextId = 11;

  private readonly SIMULATED_DELAY = 300;
  private readonly ERROR_RATE = 0.1;

  private simulateResponse<T>(data: T): Observable<T> {
    return of(null).pipe(
      delay(this.SIMULATED_DELAY),
      switchMap(() => {
        if (Math.random() < this.ERROR_RATE) {
          return throwError(() => ({
            status: 500,
            message: 'Internal Server Error',
          }));
        }
        return of(data);
      }),
    );
  }

  //  Dodate dve metode u servis kako bi obavestili ovaj structuredClone niz da se desila neka promena kada se event emituje.
  //  Zbog ovoga, moj getById ce raditi u item-list (bez ovoga se samo items[] signal u item-list update-uje)
  //  Takodje, bez ovoga, cim promenim stranicu na FE na details pa se vratim na list, svi moji itemi kreirani preko event se brisu, posto se samo signal na FE menjao pre ovoga
  registerFromEvent(item: Item): void {
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index === -1) {
      this.items.push(structuredClone(item));
    } else {
      this.items[index] = structuredClone(item);
    }
  }

  //  Kada se skloni item preko random eventa, skloni ga iz items, kako ne bi slucajno moglo da se pristupi preko URL
  removeFromEvent(id: string): void {
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) this.items.splice(index, 1);
  }

  getAll(): Observable<Item[]> {
    return this.simulateResponse(structuredClone(this.items));
  }

  getById(id: string): Observable<Item> {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      return of(null).pipe(
        delay(this.SIMULATED_DELAY),
        switchMap(() => throwError(() => ({ status: 404, message: 'Item not found' }))),
      );
    }
    return this.simulateResponse(structuredClone(item));
  }

  create(item: Omit<Item, 'id'>): Observable<Item> {
    const newItem: Item = { ...item, id: `item-${this.nextId++}` };
    this.items.push(newItem);
    return this.simulateResponse(structuredClone(newItem));
  }

  update(id: string, changes: Partial<Item>): Observable<Item> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      return of(null).pipe(
        delay(this.SIMULATED_DELAY),
        switchMap(() => throwError(() => ({ status: 404, message: 'Item not found' }))),
      );
    }
    this.items[index] = { ...this.items[index], ...changes, id };
    return this.simulateResponse(structuredClone(this.items[index]));
  }

  delete(id: string): Observable<void> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      return of(null).pipe(
        delay(this.SIMULATED_DELAY),
        switchMap(() => throwError(() => ({ status: 404, message: 'Item not found' }))),
      );
    }
    this.items.splice(index, 1);
    return this.simulateResponse(undefined as void);
  }
}
