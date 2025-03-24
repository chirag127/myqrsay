import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {}

  connect(): void {
    if (!this.socket) {
      this.socket = io(environment.socketUrl, {
        auth: {
          token: this.authService.getToken()
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onEvent<T>(event: string): Observable<T> {
    this.connect();

    return new Observable<T>(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      this.socket.on(event, (data: T) => {
        observer.next(data);
      });

      return () => {
        if (this.socket) {
          this.socket.off(event);
        }
      };
    });
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  }
}
