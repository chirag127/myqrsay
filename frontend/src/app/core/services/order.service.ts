import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updatePaymentStatus(id: string, paymentStatus: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/payment`, { paymentStatus });
  }

  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  generateBill(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/bill`, { responseType: 'blob' });
  }

  generateKOT(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/kot`, { responseType: 'blob' });
  }
}
