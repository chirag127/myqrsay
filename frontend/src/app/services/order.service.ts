import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  createOrder(cart: Cart): Observable<Order> {
    return this.http.post<any>(this.apiUrl, {
      restaurantId: cart.restaurantId,
      items: cart.items.map(item => ({
        menuItem: typeof item.menuItem === 'string' ? item.menuItem : item.menuItem._id,
        quantity: item.quantity,
        variant: typeof item.variant === 'string' ? item.variant : item.variant?._id,
        addons: item.addons?.map(addon => ({
          addon: addon.addon,
          option: typeof addon.option === 'string' ? addon.option : addon.option._id
        })),
        specialInstructions: item.specialInstructions
      })),
      orderType: cart.orderType,
      orderDetails: cart.orderDetails,
      promoCode: cart.promoCode,
      payment: {
        method: 'cash', // Default to cash, will be updated during checkout
        status: 'pending'
      },
      specialInstructions: cart.specialInstructions
    }).pipe(
      map(response => response.data)
    );
  }

  getRestaurantOrders(status?: string, startDate?: string, endDate?: string, orderType?: string): Observable<Order[]> {
    let url = `${this.apiUrl}/restaurant`;
    const params: string[] = [];

    if (status) params.push(`status=${status}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (orderType) params.push(`orderType=${orderType}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<any>(url).pipe(
      map(response => response.data)
    );
  }

  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/customer`).pipe(
      map(response => response.data)
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateOrderStatus(id: string, status: string, note?: string): Observable<Order> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status, note }).pipe(
      map(response => response.data)
    );
  }

  updatePaymentStatus(id: string, status: string, transactionId: string, paidAmount: number): Observable<Order> {
    return this.http.put<any>(`${this.apiUrl}/${id}/payment`, {
      status,
      transactionId,
      paidAmount
    }).pipe(
      map(response => response.data)
    );
  }

  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
      map(response => response.data)
    );
  }
}
