import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dish } from '../models/dish.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = `${environment.apiUrl}/dishes`;

  constructor(private http: HttpClient) { }

  getAllDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(this.apiUrl);
  }

  getDishById(id: string): Observable<Dish> {
    return this.http.get<Dish>(`${this.apiUrl}/${id}`);
  }

  getDishByCategory(category: string): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.apiUrl}/category/${category}`);
  }

  createDish(dish: Dish, image?: File): Observable<Dish> {
    const formData = new FormData();
    formData.append('dish', JSON.stringify(dish));

    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Dish>(this.apiUrl, formData);
  }

  updateDish(id: string, dish: Dish, image?: File): Observable<Dish> {
    const formData = new FormData();
    formData.append('dish', JSON.stringify(dish));

    if (image) {
      formData.append('image', image);
    }

    return this.http.put<Dish>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDish(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateDishAvailability(id: string, isAvailable: boolean): Observable<Dish> {
    return this.http.patch<Dish>(`${this.apiUrl}/${id}/availability`, { isAvailable });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}
