import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { OrientationService } from '../../../admins/services/orientation.service';
import { OrientationSession } from '../../../core/models/orientation.model';
import { Student } from '../../../core/models/student.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-student-sessions',
  templateUrl: './student-sessions.component.html',
  styleUrls: ['./student-sessions.component.css'],
  standalone: false,
})
export class StudentSessionsComponent implements OnInit {
  departmentId: number | null = null;
  sessions: OrientationSession[] = [];
  myOrientations: OrientationSession[] = [];
  currentStudent: Student | null = null;
  loading = false;
  error = '';
  searchText: string = '';
  availableSessions: OrientationSession[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private orientationService: OrientationService
  ) {
    // We'll initialize departmentId after loading the student profile
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.departmentId = +paramId;
    }
  }

  ngOnInit(): void {
    // Load student profile first, then use their department ID
    const token = localStorage.getItem('auth_token');
    console.log('Current token exists:', !!token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    this.loadStudentProfile();
  }

  applyFilter(): void {
    console.log('Filtering sessions with:', this.searchText);
    // The actual filtering is done by the pipe in the template
  }

  loadStudentProfile(): void {
    this.loading = true;
    this.studentService.getCurrentStudentProfile().subscribe({
      next: (student) => {
        console.log('Loaded student profile:', student);
        this.currentStudent = student;

        // Use the student's department ID if not specified in the route
        if (
          student &&
          student.departmentId &&
          (this.departmentId === null || this.departmentId === 0)
        ) {
          this.departmentId = student.departmentId;
          console.log('Using student department ID:', this.departmentId);

          // Update URL to reflect correct department (optional)
          this.router.navigate(['/students/sessions', this.departmentId], {
            replaceUrl: true,
            skipLocationChange: false,
          });
        }

        // Now load sessions with the correct department ID
        this.loadSessions();
        this.loadMyOrientations();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load student profile';
        console.error(err);
        this.loading = false;
      },
    });
  }

  loadSessions(): void {
    if (!this.departmentId) {
      console.error('No department ID available to load sessions');
      this.error = 'No department assigned. Please contact administrator.';
      return;
    }

    this.loading = true;
    console.log('Loading sessions for department:', this.departmentId);

    this.orientationService
      .getSessionsByDepartment(this.departmentId)
      .subscribe({
        next: (sessions) => {
          console.log('Sessions loaded:', sessions);
          this.sessions = sessions;
          this.availableSessions = sessions;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load sessions';
          this.loading = false;
          console.error('Error loading sessions:', err);
        },
      });
  }

  loadMyOrientations(): void {
    this.studentService.getStudentOrientations().subscribe({
      next: (orientations) => {
        console.log('My orientations loaded:', orientations);
        this.myOrientations = orientations;
      },
      error: (err) => {
        console.error('Error loading orientations:', err);
      },
    });
  }

  // Modify the registerForSession method to accept orientationID directly
  registerForSession(sessionId: number): void {
    if (this.currentStudent) {
      this.orientationService
        .registerStudentForSession(sessionId, this.currentStudent.studentID!)
        .subscribe({
          next: () => {
            alert('Successfully registered for session');
            this.loadMyOrientations();
            // Reload the sessions to update the attendees count
            this.loadSessions();
          },
          error: (err) => {
            console.error('Failed to register for session', err);
            alert('Failed to register for session');
          },
        });
    }
  }

  // Simplify the isRegistered check for the current data structure
  isRegistered(sessionId: number): boolean {
    return this.myOrientations.some(
      (session) => session.orientationID === sessionId
    );
  }

  cancelRegistration(sessionId: number): void {
    if (this.currentStudent) {
      this.orientationService
        .removeStudentFromSession(sessionId, this.currentStudent.studentID!)
        .subscribe({
          next: () => {
            alert('Registration canceled');
            this.loadMyOrientations();
          },
          error: (err) => {
            console.error('Failed to cancel registration', err);
            alert('Failed to cancel registration');
          },
        });
    }
  }
}
