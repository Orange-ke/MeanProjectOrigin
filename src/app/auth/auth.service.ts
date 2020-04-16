
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';

import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BASE_URL = environment.apiUrl + 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) { }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(BASE_URL + '/signup', authData)
      .subscribe(response => {
        this.router.navigate(['/login']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{token: string, userId: string, expiresIn: number}>(BASE_URL + '/login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expriresInDuration = response.expiresIn;
          this.setAuthTimer(expriresInDuration * 1000);
          this.isAuthenticated = true;
          this.userId = response.userId;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expriresInDuration * 1000);
          this.authStatusListener.next(true);
          this.saveAuthData(token, this.userId, expirationDate);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  autoAuth() {
    const authInfo = this.getAuthData();
    if (authInfo) {
      const now = new Date();
      const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.token = authInfo.token;
        this.userId = authInfo.userId;
        this.isAuthenticated = true;
        this.setAuthTimer(expiresIn);
        this.authStatusListener.next(true);
      }
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = true;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private saveAuthData(token: string, userId: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token,
      userId,
      expirationDate: new Date(expirationDate)
    };
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }
}
