import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, Address } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createUser(user: User): Observable<User> {
    return this.http.post<any>(this.apiUrl, user).pipe(
      map(response => response.data)
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user).pipe(
      map(response => response.data)
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/profile`, userData).pipe(
      map(response => response.data)
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updatepassword`, {
      currentPassword,
      newPassword
    });
  }

  addAddress(address: Address): Observable<Address[]> {
    return this.http.post<any>(`${this.apiUrl}/address`, address).pipe(
      map(response => response.data)
    );
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address[]> {
    return this.http.put<any>(`${this.apiUrl}/address/${id}`, address).pipe(
      map(response => response.data)
    );
  }

  deleteAddress(id: string): Observable<Address[]> {
    return this.http.delete<any>(`${this.apiUrl}/address/${id}`).pipe(
      map(response => response.data)
    );
  }
}
