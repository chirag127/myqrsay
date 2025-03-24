import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  createPayment(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, { orderId }).pipe(
      map(response => response.data)
    );
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify`, paymentData).pipe(
      map(response => response.data)
    );
  }

  getPaymentDetails(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`).pipe(
      map(response => response.data)
    );
  }

  // Method to initialize Razorpay
  initRazorpay(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.success', (response: any) => resolve(response));
      rzp.on('payment.error', (error: any) => reject(error));
      rzp.open();
    });
  }
}
