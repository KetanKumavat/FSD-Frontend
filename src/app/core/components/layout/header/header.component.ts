import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  @Input()
  applicationName: string = 'Event Management';
  isLoggedIn: boolean = false;
  userRole: string = '';

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  toggleMenu() {
    const menu = document.querySelector('.navbar ul');
    menu?.classList.toggle('show');
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;

        this.isLoggedIn = Date.now() < expiryTime;

        // Extract role from token if it exists
        if (payload.role) {
          this.userRole = payload.role;
        }

        if (!this.isLoggedIn) {
          localStorage.removeItem('auth_token');
          this.userRole = '';
        }
      } catch (e) {
        localStorage.removeItem('auth_token');
        this.isLoggedIn = false;
        this.userRole = '';
      }
    } else {
      this.isLoggedIn = false;
      this.userRole = '';
    }
  }

  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.isLoggedIn = false;
    this.userRole = '';

    window.location.href = '/auth/login';
  }
}
