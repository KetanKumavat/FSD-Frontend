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
  error: boolean = false;
  errorTitle: string = '';
  errorMessage: string = '';

  checkInForm: FormGroup;
  submitting: boolean = false;
  checkInComplete: boolean = false;

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

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.sessionId = +params['id'];
        this.loadSessionDetails();
        this.loadUserInfo();
      } else {
        this.handleError('Invalid Session', 'No session ID provided.');
      }
    });
  }

  // In the loadSessionDetails method:
  loadSessionDetails(): void {
    this.loading = true;
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (sessionData) => {
        // Fix type assignment with non-null assertion or conditional
        this.session = sessionData || null;
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

  // Replace getStudentProfile with getCurrentStudentProfile
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
            studentId: profile.studentId || user.id || '',
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
          this.submitting = false;
          this.handleError(
            'Check-in Failed',
            err.error?.message ||
              'Unable to complete check-in. Please try again or contact support.'
          );
        },
      });
  }

  handleError(title: string, message: string): void {
    this.error = true;
    this.errorTitle = title;
    this.errorMessage = message;
    this.loading = false;
  }
}
