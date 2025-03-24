import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PromoCode } from '../models/promo-code.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  private apiUrl = `${environment.apiUrl}/promo-codes`;

  constructor(private http: HttpClient) { }

  getAllPromoCodes(): Observable<PromoCode[]> {
    return this.http.get<PromoCode[]>(this.apiUrl);
  }

  getPromoCodeById(id: string): Observable<PromoCode> {
    return this.http.get<PromoCode>(`${this.apiUrl}/${id}`);
  }

  validatePromoCode(code: string, orderTotal: number): Observable<{ valid: boolean, discount: number, message?: string }> {
    return this.http.post<{ valid: boolean, discount: number, message?: string }>(`${this.apiUrl}/validate`, { code, orderTotal });
  }

  createPromoCode(promoCode: PromoCode): Observable<PromoCode> {
    return this.http.post<PromoCode>(this.apiUrl, promoCode);
  }

  updatePromoCode(id: string, promoCode: PromoCode): Observable<PromoCode> {
    return this.http.put<PromoCode>(`${this.apiUrl}/${id}`, promoCode);
  }

  deletePromoCode(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  togglePromoCodeStatus(id: string, isActive: boolean): Observable<PromoCode> {
    return this.http.patch<PromoCode>(`${this.apiUrl}/${id}/status`, { isActive });
  }
}
