import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionService } from '../../../auth/services/session.service';
import { OrientationService } from '../../services/orientation.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  currentUser: any = null;
  stats: {
    totalSessions: number;
    upcomingSessions: number;
    fullSessions: number;
    totalRegistered: number;
    totalCapacity: number;
  } = {
    totalSessions: 0,
    upcomingSessions: 0,
    fullSessions: 0,
    totalRegistered: 0,
    totalCapacity: 0,
  };

  sessions: any[] = [];

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private orientationService: OrientationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load current user
    this.currentUser = this.authService.getCurrentUser();

    // Use real stats from API now
    this.orientationService.getDashboardStats().subscribe({
      next: (data: any) => {
        this.stats = {
          totalSessions: data.totalSessions || 0,
          upcomingSessions: data.upcomingSessions || 0,
          fullSessions: data.fullSessions || 0,
          totalRegistered: data.totalRegistered || 0,
          totalCapacity: data.totalCapacity || 0,
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats', error);
        this.loading = false;
      },
    });

    // Load recent sessions
    this.orientationService.getRecentSessions().subscribe({
      next: (sessions: any[]) => {
        this.sessions = sessions || [];
      },
      error: (error) => {
        console.error('Error loading recent sessions', error);
        this.sessions = [];
      },
    });
  }
}
