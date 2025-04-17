import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OrientationService } from '../../../admins/services/orientation.service';

@Component({
  selector: 'app-student-check-in',
  templateUrl: './student-check-in.component.html',
  styleUrls: ['./student-check-in.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class StudentCheckInComponent implements OnInit {
  sessionId: number | null = null;
  sessionDetails: any = null;
  loading = true;
  submitting = false;
  error: string | null = null;
  success = false;
  successMessage = '';

  // Form fields
  email: string = '';
  password: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private orientationService: OrientationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.sessionId = +id;
        this.loadSessionDetails();
      } else {
        this.error = 'Session ID not found in URL';
        this.loading = false;
      }
    });
  }

  loadSessionDetails(): void {
    if (!this.sessionId) return;

    this.orientationService.getSessionById(this.sessionId).subscribe({
      next: (data) => {
        this.sessionDetails = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading session details:', err);
        this.error = `Failed to load session details: ${
          err.message || 'Unknown error'
        }`;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    this.submitting = true;
    this.error = null;

    // Validate inputs
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      this.submitting = false;
      return;
    }

    const apiUrl = `https://orientation-app.onrender.com/orientations/public/sessions/${this.sessionId}/student-check-in`;

    this.http
      .post(apiUrl, {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response: any) => {
          this.success = true;
          this.successMessage = response.message || 'Check-in successful!';
          this.submitting = false;

          // Reset form
          this.email = '';
          this.password = '';
        },
        error: (err) => {
          console.error('Check-in failed:', err);
          this.error =
            err.error?.message || 'Check-in failed. Please try again.';
          this.submitting = false;
        },
      });
  }
}
