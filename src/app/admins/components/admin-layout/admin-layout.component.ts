import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <div class="admin-container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="drawer.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>Orientation Portal Admin</span>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item>
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer mode="side" opened class="sidenav">
          <mat-nav-list>
            <a
              mat-list-item
              routerLink="/admin/dashboard"
              routerLinkActive="active-link"
            >
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/departments"
              routerLinkActive="active-link"
            >
              <mat-icon>account_balance</mat-icon>
              <span>Departments</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/sessions"
              routerLinkActive="active-link"
            >
              <mat-icon>event</mat-icon>
              <span>Sessions</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/students"
              routerLinkActive="active-link"
            >
              <mat-icon>people</mat-icon>
              <span>Students</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/reports"
              routerLinkActive="active-link"
            >
              <mat-icon>assessment</mat-icon>
              <span>Reports</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
      .admin-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .toolbar {
        position: fixed;
        top: 0;
        z-index: 2;
      }
      .sidenav-container {
        flex: 1;
        margin-top: 64px;
      }
      .sidenav {
        width: 250px;
        padding-top: 16px;
      }
      .content {
        padding: 20px;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .active-link {
        background-color: rgba(0, 0, 0, 0.04);
        color: #3f51b5;
        border-left: 4px solid #3f51b5;
      }
      mat-icon {
        margin-right: 12px;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
