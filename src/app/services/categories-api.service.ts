import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { CATEGORIES } from '../data/seed-items';

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly SIMULATED_DELAY = 200;
  private readonly ERROR_RATE = 0.05;

  getAll(): Observable<Category[]> {
    return of(null).pipe(
      delay(this.SIMULATED_DELAY),
      switchMap(() => {
        if (Math.random() < this.ERROR_RATE) {
          return throwError(() => ({
            status: 500,
            message: 'Internal Server Error',
          }));
        }
        return of(structuredClone(CATEGORIES));
      }),
    );
  }
}
