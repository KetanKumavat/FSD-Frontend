import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRole = route.data['role'] as UserRole;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== requiredRole) {
      if (currentUser?.role === UserRole.STUDENT) {
        this.router.navigate(['/students/dashboard']);
      } else if (currentUser?.role === UserRole.ADMIN) {
        this.router.navigate(['/admins/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }

    return true;
  }
}
