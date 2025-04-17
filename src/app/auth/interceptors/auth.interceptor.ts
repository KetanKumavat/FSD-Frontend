import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (
      request.url.includes('/auth/') ||
      request.url.includes('/public/') ||
      (request.url.endsWith('/orientations/departments') &&
        request.method === 'GET')
    ) {
      const cleanRequest = request.clone({
        headers: request.headers.delete('Authorization'),
      });
      console.log('Clean request without auth header sent to:', request.url);
      return next.handle(cleanRequest);
    }

    const token = localStorage.getItem('auth_token');
    console.log('URL being intercepted:', request.url);
    console.log('Token exists:', !!token);

    if (token && token !== 'null' && token !== 'undefined') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token invalid or expired
          console.error('Authentication failed:', request.url, error);

          // Clear auth data
          this.authService.logout();

          // Redirect to login
          this.router.navigate(['/auth/login'], {
            queryParams: {
              returnUrl: this.router.url,
              reason: 'session_expired',
            },
          });
        } else if (error.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Access denied for URL:', request.url);
          console.error('User lacks permission for this resource');

          // Get current user role for debugging
          const userData = localStorage.getItem('user_data');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              console.error('Current user role:', user.role);
            } catch (e) {
              console.error('Failed to parse user data');
            }
          }

          // Optional: Navigate to access denied page
          // this.router.navigate(['/access-denied']);
        }

        // Always propagate the error to the component for handling
        return throwError(() => error);
      })
    );
  }
}
