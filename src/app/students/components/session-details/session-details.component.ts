import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SessionService,
  OrientationAttendee,
} from '../../../auth/services/session.service';
import { OrientationSession } from '../../../core/models/orientation.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css'],
  standalone: false,
})
export class SessionDetailsComponent implements OnInit {
  sessionId!: number;
  session: OrientationSession | any;
  attendees: any[] = [];
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

  // Add these methods to your component

  loadAttendees(): void {
    this.sessionService.getSessionAttendees(this.sessionId).subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        // If student view, check registration status
        if (this.isStudent) {
          this.checkRegistrationStatusFromAttendees();
        }
      },
      error: (error) => {
        console.error('Error loading attendees:', error);
        this.snackBar.open('Error loading attendee information', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  checkRegistrationStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isRegistered = false;
      return;
    }

    this.sessionService.getRegisteredSessions(currentUser.id).subscribe({
      next: (sessions) => {
        // Check if any returned session matches our current session ID
        this.isRegistered = sessions.some(
          (s) =>
            // Check different ID formats from API
            s.id === this.sessionId || s.orientationID === this.sessionId
        );
      },
      error: (error) => {
        console.error('Error checking registration status:', error);
        this.isRegistered = false;
      },
    });
  }

  loadSessionDetails(): void {
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;

        // Calculate registeredCount from attendees if needed
        if (session.attendees && !session.registeredCount) {
          this.session.registeredCount = session.attendees.length;
        }

        // Set default capacity if not provided
        if (!session.capacity) {
          this.session.capacity = 30; // Default capacity
        }

        // Check for attendees in the response
        if (session.attendees) {
          this.attendees = session.attendees;
          this.checkRegistrationStatusFromAttendees();
        } else if (this.isAdmin) {
          this.loadAttendees();
        } else if (this.isStudent) {
          this.checkRegistrationStatus();
        }

        this.loading = false;
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

  // New method to check if current user is in the attendees list
  checkRegistrationStatusFromAttendees(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.attendees && this.attendees.length > 0) {
      // Check if the current user's email matches any attendee's email
      this.isRegistered = this.attendees.some(
        (attendee) =>
          (attendee.user && attendee.user.email === currentUser.email) ||
          attendee.userEmail === currentUser.email
      );
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

  // In session-details.component.ts
  getDepartmentName(): string {
    if (!this.session) return 'Unknown Department';

    // Handle different response structures
    if (
      this.session.attendees &&
      this.session.attendees.length > 0 &&
      this.session.attendees[0].department
    ) {
      if (typeof this.session.attendees[0].department === 'object') {
        return (
          this.session.attendees[0].department.departmentName ||
          'Unknown Department'
        );
      }
    }

    return (
      this.session.department?.name ||
      this.session.department?.departmentName ||
      'Unknown Department'
    );
  }

  getFacultyName(): string {
    if (!this.session) return 'TBA';
    return this.session.faculty || this.session.facultyName || 'TBA';
  }
}
