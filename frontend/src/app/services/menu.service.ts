import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Category, MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) { }

  // Category methods
  getCategories(restaurantId: string): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}/categories?restaurantId=${restaurantId}`).pipe(
      map(response => response.data)
    );
  }

  getAdminCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}/categories/admin`).pipe(
      map(response => response.data)
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<any>(`${this.apiUrl}/categories/${id}`).pipe(
      map(response => response.data)
    );
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<any>(`${this.apiUrl}/categories`, category).pipe(
      map(response => response.data)
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, category).pipe(
      map(response => response.data)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`);
  }

  // Menu item methods
  getMenuItems(restaurantId: string, categoryId?: string): Observable<MenuItem[]> {
    let url = `${this.apiUrl}/items?restaurantId=${restaurantId}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    return this.http.get<any>(url).pipe(
      map(response => response.data)
    );
  }

  getAdminMenuItems(categoryId?: string): Observable<MenuItem[]> {
    let url = `${this.apiUrl}/items/admin`;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return this.http.get<any>(url).pipe(
      map(response => response.data)
    );
  }

  getMenuItem(id: string): Observable<MenuItem> {
    return this.http.get<any>(`${this.apiUrl}/items/${id}`).pipe(
      map(response => response.data)
    );
  }

  createMenuItem(menuItem: MenuItem): Observable<MenuItem> {
    return this.http.post<any>(`${this.apiUrl}/items`, menuItem).pipe(
      map(response => response.data)
    );
  }

  updateMenuItem(id: string, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.put<any>(`${this.apiUrl}/items/${id}`, menuItem).pipe(
      map(response => response.data)
    );
  }

  deleteMenuItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${id}`);
  }
}
