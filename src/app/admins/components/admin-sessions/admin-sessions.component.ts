import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrientationService } from '../../services/orientation.service';
import {
  OrientationSession,
  Orientation,
} from '../../../core/models/orientation.model';
import { Student } from '../../../core/models/student.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../session-dialog/session-dialog.component';

@Component({
  selector: 'app-admin-sessions',
  templateUrl: './admin-sessions.component.html',
  styleUrls: ['./admin-sessions.component.css'],
  standalone: false,
})
export class AdminSessionsComponent implements OnInit {
  departmentId: number;
  department: Orientation | null = null;
  sessions: OrientationSession[] = [];
  loading = false;
  error = '';

  dataSource = new MatTableDataSource<OrientationSession>([]);
  displayedColumns: string[] = [
    'id',
    'facultyName',
    'time',
    'location',
    'attendees',
    'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private orientationService: OrientationService,
    private dialog: MatDialog
  ) {
    this.departmentId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadDepartment();
    this.loadSessions();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadDepartment(): void {
    this.orientationService.getDepartmentById(this.departmentId).subscribe({
      next: (department) => {
        this.department = department;
      },
      error: (err) => {
        this.error = 'Failed to load department';
        console.error(err);
      },
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.orientationService
      .getSessionsByDepartment(this.departmentId)
      .subscribe({
        next: (sessions) => {
          this.sessions = sessions;
          this.dataSource = new MatTableDataSource<OrientationSession>(
            this.sessions
          );
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load sessions';
          this.loading = false;
          console.error(err);
        },
      });
  }

  openSessionDialog(session?: OrientationSession): void {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      width: '600px',
      data: {
        session: session,
        departmentId: this.departmentId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return; // User cancelled

      if (session) {
        // Update existing session
        this.orientationService
          .updateSession(session.orientationID, result)
          .subscribe({
            next: (updatedSession) => {
              // Find and update the session in the local array
              const index = this.sessions.findIndex(
                (s) => s.orientationID === session.orientationID
              );
              if (index !== -1) {
                this.sessions[index] = updatedSession;
                this.dataSource.data = [...this.sessions];
              }
              alert('Session updated successfully');
            },
            error: (err) => {
              console.error('Failed to update session', err);
              alert('Failed to update session');
            },
          });
      } else {
        // Create new session
        this.orientationService
          .createSession(this.departmentId, result)
          .subscribe({
            next: (newSession) => {
              this.sessions.push(newSession);
              this.dataSource.data = [...this.sessions];
              alert('Session created successfully');
            },
            error: (err) => {
              console.error('Failed to create session', err);
              alert('Failed to create session');
            },
          });
      }
    });
  }

  viewAttendees(sessionId: number): void {
    this.orientationService.getSessionAttendees(sessionId).subscribe({
      next: (students: Student[]) => {
        // Display attendees in a dialog or other UI component
        console.log('Session attendees:', students);
      },
      error: (err) => {
        console.error('Failed to load attendees', err);
      },
    });
  }

  deleteSession(sessionId: number): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.orientationService.deleteSession(sessionId).subscribe({
        next: () => {
          this.sessions = this.sessions.filter(
            (s) => s.orientationID !== sessionId
          );
          this.dataSource.data = this.sessions;
          alert('Session deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete session', err);
          alert('Failed to delete session');
        },
      });
    }
  }
}
