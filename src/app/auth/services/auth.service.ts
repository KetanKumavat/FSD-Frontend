import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole, AuthResponse } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    } catch (error) {
      console.error('Error loading user data from storage', error);
      this.currentUserSubject.next(null);
    }
  }

  register(userData: any): Observable<any> {
    // Ensure role is uppercase as expected by backend
    const requestData = {
      ...userData,
      role: userData.role.toUpperCase(),
    };

    return this.http.post<any>(`${this.apiUrl}/register`, requestData).pipe(
      tap((response) => {
        this.storeUserData(response.token, response.role);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          this.storeUserData(response.token, response.role);
        }),
        catchError(this.handleError)
      );
  }

  storeUserData(token: string, role: string): void {
    localStorage.setItem('auth_token', token); // Changed from 'token'

    // Create a basic user object
    const user: User = {
      id: 0,
      email: this.extractEmailFromToken(token),
      role: role as UserRole,
    };

    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === UserRole.ADMIN;
  }

  isStudent(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === UserRole.STUDENT;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('auth_token', authResult.token);

    // Create a basic user object
    const user: User = {
      id: 0,
      email: this.extractEmailFromToken(authResult.token),
      role: authResult.role as UserRole,
    };

    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role.toUpperCase();
  }

  private extractEmailFromToken(token: string): string {
    // Basic JWT token parsing
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || '';
    } catch (e) {
      return '';
    }
  }
}
