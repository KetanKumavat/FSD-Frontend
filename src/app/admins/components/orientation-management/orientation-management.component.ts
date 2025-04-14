// orientation-management.component.ts
import { Component, OnInit } from '@angular/core';
import { OrientationService } from '../../services/orientation.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-orientation-management',
  templateUrl: './orientation-management.component.html',
  styleUrls: ['./orientation-management.component.css'],
})
export class OrientationManagementComponent implements OnInit {
  sessions: any[] = [];
  departments: any[] = [];
  selectedDepartmentId: number | null = null;

  constructor(
    private orientationService: OrientationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.orientationService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        if (departments.length > 0) {
          this.selectedDepartmentId = departments[0].departmentID;
          this.loadSessions();
        }
      },
      error: (error) => console.error('Error loading departments', error),
    });
  }

  loadSessions(): void {
    if (!this.selectedDepartmentId) return;

    this.orientationService
      .getDepartmentSessions(this.selectedDepartmentId)
      .subscribe({
        next: (sessions) => (this.sessions = sessions),
        error: (error) => console.error('Error loading sessions', error),
      });
  }

  createSession(sessionData: any): void {
    if (!this.selectedDepartmentId) return;

    this.orientationService
      .createSession(this.selectedDepartmentId, sessionData)
      .subscribe({
        next: () => this.loadSessions(),
        error: (error) => console.error('Error creating session', error),
      });
  }

  updateSession(sessionId: number, sessionData: any): void {
    this.orientationService.updateSession(sessionId, sessionData).subscribe({
      next: () => this.loadSessions(),
      error: (error) => console.error('Error updating session', error),
    });
  }

  deleteSession(sessionId: number): void {
    this.orientationService.deleteSession(sessionId).subscribe({
      next: () => this.loadSessions(),
      error: (error) => console.error('Error deleting session', error),
    });
  }

  exportAttendees(sessionId: number, sessionName: string): void {
    this.orientationService.exportAttendees(sessionId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sessionName}_attendees.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => console.error('Error exporting attendees', error),
    });
  }
}
