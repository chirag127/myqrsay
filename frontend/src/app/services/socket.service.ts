import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(
    private socket: Socket,
    private authService: AuthService
  ) { }

  connect(): void {
    const token = this.authService.getToken();
    if (token) {
      this.socket.ioSocket.auth = { token };
      this.socket.connect();
    }
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  joinRoom(room: string): void {
    this.socket.emit('joinRoom', room);
  }

  leaveRoom(room: string): void {
    this.socket.emit('leaveRoom', room);
  }

  joinOrderRoom(orderId: string): void {
    this.socket.emit('joinOrder', orderId);
  }

  leaveOrderRoom(orderId: string): void {
    this.socket.emit('leaveOrder', orderId);
  }

  onNewOrder(): Observable<any> {
    return this.socket.fromEvent<any>('newOrder');
  }

  onOrderStatusUpdate(): Observable<any> {
    return this.socket.fromEvent<any>('orderStatusUpdate');
  }

  onPaymentUpdate(): Observable<any> {
    return this.socket.fromEvent<any>('paymentUpdate');
  }

  onOrderCancelled(): Observable<any> {
    return this.socket.fromEvent<any>('orderCancelled');
  }
}
