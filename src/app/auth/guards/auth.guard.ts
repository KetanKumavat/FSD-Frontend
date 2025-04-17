import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('AuthGuard: Checking if user is logged in');

    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is logged in, allowing access');
      return true;
    }

    console.log('AuthGuard: User is not logged in, saving URL:', state.url);
    this.authService.setRedirectUrl(state.url);

    console.log('AuthGuard: Redirecting to login page');
    this.router.navigate(['/auth/login']);
    return false;
  }
}
