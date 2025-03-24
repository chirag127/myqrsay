import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PromoCode } from '../models/promo.model';

@Injectable({
  providedIn: 'root'
})
export class PromoService {
  private apiUrl = `${environment.apiUrl}/promos`;

  constructor(private http: HttpClient) { }

  getPromoCodes(): Observable<PromoCode[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getPromoCode(id: string): Observable<PromoCode> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createPromoCode(promoCode: PromoCode): Observable<PromoCode> {
    return this.http.post<any>(this.apiUrl, promoCode).pipe(
      map(response => response.data)
    );
  }

  updatePromoCode(id: string, promoCode: Partial<PromoCode>): Observable<PromoCode> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, promoCode).pipe(
      map(response => response.data)
    );
  }

  deletePromoCode(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  validatePromoCode(code: string, restaurantId: string, orderType: string, subtotal: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate`, {
      code,
      restaurantId,
      orderType,
      subtotal
    }).pipe(
      map(response => response.data)
    );
  }
}
