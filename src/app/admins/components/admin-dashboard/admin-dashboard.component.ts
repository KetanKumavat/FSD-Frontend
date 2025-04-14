import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionService } from '../../../auth/services/session.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
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
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load current user
    this.currentUser = this.authService.getCurrentUser();

    // Use mock stats for now
    this.sessionService.getMockDashboardStats().subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats', error);
        this.loading = false;
      },
    });

    // Mock sessions data if needed
    this.sessions = [
      {
        id: 1,
        title: 'Computer Science Orientation',
        date: new Date(),
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        location: 'Building A, Room 101',
        capacity: 30,
        registeredCount: 25,
      },
      // Add more mock sessions as needed
    ];
  }
}
