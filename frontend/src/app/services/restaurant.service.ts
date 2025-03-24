import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.apiUrl}/restaurants`;

  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.post<any>(this.apiUrl, restaurant).pipe(
      map(response => response.data)
    );
  }

  updateRestaurant(id: string, restaurant: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, restaurant).pipe(
      map(response => response.data)
    );
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addStaff(restaurantId: string, userId: string, role: string, permissions: string[]): Observable<Restaurant> {
    return this.http.post<any>(`${this.apiUrl}/${restaurantId}/staff`, {
      userId,
      role,
      permissions
    }).pipe(
      map(response => response.data)
    );
  }

  removeStaff(restaurantId: string, userId: string): Observable<Restaurant> {
    return this.http.delete<any>(`${this.apiUrl}/${restaurantId}/staff/${userId}`).pipe(
      map(response => response.data)
    );
  }
}
