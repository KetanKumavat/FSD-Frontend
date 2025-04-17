import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrientationService } from '../../services/orientation.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

interface SessionDetails {
  id: number;
  title: string;
  department?: {
    id: number;
    name: string;
  };
  startTime: string;
  location?: string;
  capacity: number;
  description?: string;
  active: boolean;
  faculty?: string;
}

interface Attendee {
  id: number;
  name: string;
  email: string;
  checkInTime: string;
}

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatTooltipModule,
  ],
})
export class SessionDetailsComponent implements OnInit {
  sessionId: number | null = null;
  sessionDetails: SessionDetails | null = null;
  loading = true;
  error: string | null = null;
  attendees: Attendee[] = [];
  qrCodeUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orientationService: OrientationService
  ) {}

  ngOnInit(): void {
    console.log('SessionDetailsComponent initialized');
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('Route param id:', id);
      if (id) {
        this.sessionId = +id;
        this.loadSessionDetails();
        this.loadAttendees();
      } else {
        this.error = 'Session ID not found in URL';
        this.loading = false;
      }
    });
  }

  loadSessionDetails(): void {
    if (!this.sessionId) return;

    console.log('Loading session details for ID:', this.sessionId);
    this.orientationService
      .getSessionById(this.sessionId)
      .pipe(
        catchError((err) => {
          console.error('Error loading session details:', err);
          this.error = `Failed to load session details: ${err.message}`;
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        console.log('Received session data:', data);
        if (data) {
          this.sessionDetails = data;
          this.generateQrCode();
        }
        this.loading = false;
      });
  }

  generateQrCode(): void {
    if (!this.sessionId) return;

    const checkInUrl = `${window.location.origin}/student/check-in/${this.sessionId}`;

    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      checkInUrl
    )}`;
    console.log(
      'Generated QR code URL for student self check-in:',
      this.qrCodeUrl
    );
  }

  loadAttendees(): void {
    if (!this.sessionId) return;

    console.log('Loading attendees for session ID:', this.sessionId);
    this.orientationService
      .getSessionAttendees(this.sessionId)
      .pipe(
        catchError((err) => {
          console.error('Failed to load attendees:', err);
          return of([]);
        })
      )
      .subscribe((attendees) => {
        console.log('Received attendees:', attendees);
        this.attendees = attendees;
      });
  }

  downloadQrCode(): void {
    if (this.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = this.qrCodeUrl;
      link.download = `session-${this.sessionId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  navigateToQrScanner(): void {
    if (this.sessionId) {
      this.router.navigate(['/admin/qr-scanner', this.sessionId]);
    }
  }

  // Add this method to the SessionDetailsComponent class

  downloadAttendanceExcel(): void {
    if (!this.sessionId) return;

    this.orientationService.exportAttendees(this.sessionId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${this.sessionId}-attendees.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error downloading attendance Excel:', err);
        alert('Failed to download attendance data. Please try again.');
      },
    });
  }
}
