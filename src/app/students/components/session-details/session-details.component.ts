import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SessionService,
  OrientationSession,
  OrientationAttendee,
} from '../../../auth/services/session.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css'],
  standalone: false,
})
export class SessionDetailsComponent implements OnInit {
  sessionId!: number;
  session: OrientationSession | undefined;
  attendees: OrientationAttendee[] = [];
  loading = true;
  isAdmin = false;
  isStudent = false;
  isRegistered = false;
  displayedColumns: string[] = ['name', 'email', 'registrationDate'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isStudent = this.authService.isStudent();

    this.route.params.subscribe((params) => {
      this.sessionId = +params['id'];
      this.loadSessionDetails();
    });
  }

  loadSessionDetails(): void {
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;

        // If admin, load attendees
        if (this.isAdmin) {
          this.loadAttendees();
        } else if (this.isStudent) {
          this.checkRegistrationStatus();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.snackBar.open(
          'Error loading session details: ' + error.message,
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
      },
    });
  }

  loadAttendees(): void {
    this.sessionService.getSessionAttendees(this.sessionId).subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(
          'Error loading attendees: ' + error.message,
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
      },
    });
  }

  checkRegistrationStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.sessionService.getRegisteredSessions(currentUser.id).subscribe({
        next: (sessions) => {
          this.isRegistered = sessions.some((s) => s.id === this.sessionId);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  registerForSession(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('You must be logged in to register', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.sessionService
      .registerForSession(
        this.sessionId,
        currentUser.id,
        currentUser.name || 'Unknown User',
        currentUser.email || 'Unknown Email'
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Successfully registered for session', 'Close', {
            duration: 3000,
          });
          this.isRegistered = true;
          this.loadSessionDetails(); // Refresh to update counts
        },
        error: (error) => {
          this.snackBar.open('Error registering: ' + error.message, 'Close', {
            duration: 3000,
          });
        },
      });
  }

  unregisterFromSession(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('You must be logged in to unregister', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (confirm('Are you sure you want to unregister from this session?')) {
      this.sessionService
        .unregisterFromSession(this.sessionId, currentUser.id)
        .subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open(
                'Successfully unregistered from session',
                'Close',
                { duration: 3000 }
              );
              this.isRegistered = false;
              this.loadSessionDetails(); // Refresh to update counts
            } else {
              this.snackBar.open('Failed to unregister from session', 'Close', {
                duration: 3000,
              });
            }
          },
          error: (error) => {
            this.snackBar.open(
              'Error unregistering: ' + error.message,
              'Close',
              { duration: 3000 }
            );
          },
        });
    }
  }

  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/sessions']);
    } else if (this.isStudent) {
      this.router.navigate(['/student/sessions']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
