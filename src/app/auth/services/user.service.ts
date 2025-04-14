import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole, User } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Hardcoded users for demo
  private users: User[] = [
    {
      id: 1,
      userId: 1,
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    },
    {
      id: 2,
      userId: 2,
      username: 'student',
      name: 'Student User',
      email: 'student@example.com',
      role: UserRole.STUDENT,
    },
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCurrentUser(): Observable<User | null> {
    const user = this.authService.getCurrentUser();
    return of(user);
  }

  getUserById(id: number): Observable<User | undefined> {
    return of(this.users.find((u) => u.id === id));
  }

  getAllUsers(): Observable<User[]> {
    return of(this.users);
  }

  updateUserProfile(
    userId: number,
    userData: Partial<User>
  ): Observable<User | undefined> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };

      // Update local storage if this is the current user
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('user_data', JSON.stringify(this.users[index]));
      }

      return of(this.users[index]);
    }
    return of(undefined);
  }
}
