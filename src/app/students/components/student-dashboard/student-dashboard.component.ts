import { Component, OnInit } from '@angular/core';
import { OrientationService } from '../../../admins/services/orientation.service';
import { StudentService } from '../../services/student.service';
import {
  Orientation,
  OrientationSession,
} from '../../../core/models/orientation.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: false,
})
export class StudentDashboardComponent implements OnInit {
  departments: Orientation[] = [];
  currentStudent: Student | null = null;
  loading = false;
  registeredSessions: OrientationSession[] = [];
  error = '';
  displayedColumns: string[] = ['title', 'date', 'time', 'location', 'actions'];

  constructor(
    private orientationService: OrientationService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadStudentProfile();
    this.loadDepartments();
    this.loadRegisteredSessions();
  }

  loadStudentProfile(): void {
    this.studentService.getCurrentStudentProfile().subscribe({
      next: (student) => {
        this.currentStudent = student;
      },
      error: (err) => {
        this.error = 'Failed to load student profile';
        console.error(err);
      },
    });
  }

  loadDepartments(): void {
    this.loading = true;
    this.orientationService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load departments';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadRegisteredSessions(): void {
    this.studentService.getStudentOrientations().subscribe({
      next: (sessions) => {
        this.registeredSessions = sessions || [];
      },
      error: (err) => {
        console.error('Failed to load registered sessions', err);
        this.registeredSessions = [];
      },
    });
  }

  // Add this missing method
  unregisterFromSession(sessionId: number): void {
    if (this.currentStudent && this.currentStudent.studentID) {
      if (confirm('Are you sure you want to unregister from this session?')) {
        this.orientationService
          .removeStudentFromSession(sessionId, this.currentStudent.studentID)
          .subscribe({
            next: () => {
              this.loadRegisteredSessions();
            },
            error: (err) => {
              console.error('Failed to unregister from session', err);
              alert('Failed to unregister');
            },
          });
      }
    }
  }

  // Add these helper methods to your component class
  getDepartmentName(): string {
    if (!this.departments || !this.currentStudent) return 'Not Assigned';

    const dept = this.departments.find(
      (d) => d.departmentID === this.currentStudent?.departmentId
    );
    return dept?.departmentName || 'Not Assigned';
  }

  getDepartmentLocation(): string {
    if (!this.departments || !this.currentStudent)
      return 'Information not available';

    const dept = this.departments.find(
      (d) => d.departmentID === this.currentStudent?.departmentId
    );
    return dept?.location || 'Information not available';
  }
}
