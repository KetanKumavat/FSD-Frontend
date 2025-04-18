import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SessionService } from '../../../auth/services/session.service';
import { AuthService } from '../../../auth/services/auth.service';
import { StudentService } from '../../services/student.service';
import { OrientationSession } from '../../../core/models/orientation.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-check-in',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './student-check-in.component.html',
  styleUrls: ['./student-check-in.component.css'],
})
export class StudentCheckInComponent implements OnInit {
  sessionId: number = 0;
  session: OrientationSession | null = null;
  loading: boolean = true;
  errorOccurred: boolean = false;
  errorTitle: string = '';
  errorMessage: string = '';

  checkInForm: FormGroup;
  submitting: boolean = false;
  checkInComplete: boolean = false;
  success: boolean = false;
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private studentService: StudentService,
    private fb: FormBuilder
  ) {
    this.checkInForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      studentId: ['', Validators.required],
    });
  }

  handleError(title: string, message: string): void {
    this.errorOccurred = true;
    this.errorTitle = title;
    this.errorMessage = message;
    this.loading = false;
    this.submitting = false;
  }

  onSubmit() {
    if (this.checkInForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorOccurred = false;
    this.errorTitle = '';
    this.errorMessage = '';

    this.sessionService
      .checkInToSession(
        this.sessionId,
        this.checkInForm.value.studentId,
        `${this.checkInForm.value.firstName} ${this.checkInForm.value.lastName}`,
        this.checkInForm.value.email
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.success = true;
          this.successMessage = 'Successfully checked in to the session!';
        },
        error: (error) => {
          this.loading = false;

          let errorMsg = 'Failed to check in to the session';
          if (error.error && typeof error.error === 'object') {
            errorMsg = error.error.message || errorMsg;
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.message) {
            errorMsg = error.message;
          }

          this.handleError('Check-in Failed', errorMsg);
          console.error('Check-in error:', error);
        },
      });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['sessionId']) {
        this.sessionId = +params['sessionId'];
        this.loadSessionDetails();
        this.loadUserInfo();
      } else {
        this.handleError('Invalid Session', 'No session ID provided.');
      }
    });
  }

  loadSessionDetails(): void {
    this.loading = true;
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (sessionData) => {
        this.session = {
          ...sessionData,
          title:
            sessionData.title ||
            `Orientation Session ${sessionData.orientationID}`,
          startTime: sessionData.time,
          date: new Date(),
          location: sessionData.location || 'Campus Main Hall',
          endTime: this.calculateEndTime(sessionData.time),
          attendees: sessionData.attendees || [],
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load session:', err);
        this.handleError(
          'Session Not Found',
          'Unable to load the session details. The session may not exist or has been cancelled.'
        );
      },
    });
  }

  private calculateEndTime(startTime: string): string {
    if (!startTime) return '';

    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      let endHour = hours + 1;

      if (endHour >= 24) {
        endHour -= 24;
      }

      return `${endHour.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  }

  loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.studentService.getCurrentStudentProfile().subscribe({
        next: (profile: any) => {
          // Pre-fill the form with user info
          this.checkInForm.patchValue({
            firstName: profile.firstName || (user as any).firstName || '',
            lastName: profile.lastName || (user as any).lastName || '',
            email: profile.email || (user as any).email || '',
            studentId: profile.studentID || user.id || '',
          });
        },
        error: () => {
          // Just use what we have from current user
          if (user.name) {
            const nameParts = user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts[1] : '';

            this.checkInForm.patchValue({
              firstName,
              lastName,
              email: (user as any).email || '',
              studentId: user.id || '',
            });
          }
        },
      });
    }
  }

  submitCheckIn(): void {
    if (this.checkInForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorOccurred = false;
    const formData = this.checkInForm.value;

    this.sessionService
      .checkInToSession(
        this.sessionId,
        formData.studentId,
        `${formData.firstName} ${formData.lastName}`,
        formData.email
      )
      .subscribe({
        next: () => {
          this.checkInComplete = true;
          this.submitting = false;
        },
        error: (err) => {
          console.error('Check-in failed:', err);

          let errorMsg =
            'Unable to complete check-in. Please try again or contact support.';
          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }

          this.handleError('Check-in Failed', errorMsg);
        },
      });
  }
}
