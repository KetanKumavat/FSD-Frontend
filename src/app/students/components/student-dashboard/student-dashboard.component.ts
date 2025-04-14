import { Component, OnInit } from '@angular/core';
import { OrientationService } from '../../../admins/services/orientation.service';
import { StudentService } from '../../services/student.service';
import {
  Orientation,
  OrientationSession,
} from '../../../core/models/orientation.model';
import { Student } from '../../../core/models/student.model';
import { MatTableDataSource } from '@angular/material/table';

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
  error = '';

  // Add these missing properties
  registeredSessions: OrientationSession[] = [];
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

  // Add this missing method
  loadRegisteredSessions(): void {
    this.studentService.getStudentOrientations().subscribe({
      next: (sessions) => {
        this.registeredSessions = sessions;
      },
      error: (err) => {
        console.error('Failed to load registered sessions', err);
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
}
