// department-orientations.component.ts
import { Component, OnInit } from '@angular/core';
import { OrientationService } from '../../../admins/services/orientation.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-department-orientations',
  templateUrl: './department-orientations.component.html',
  styleUrls: ['./department-orientations.component.css'],
})
export class DepartmentOrientationsComponent implements OnInit {
  sessions: any[] = [];
  studentInfo: any;
  registeredSessions: Set<number> = new Set();

  constructor(
    private orientationService: OrientationService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadStudentInfo();
  }

  loadStudentInfo(): void {
    this.studentService.getCurrentStudent().subscribe({
      next: (student) => {
        this.studentInfo = student;
        if (student && student.departmentId) {
          this.loadDepartmentSessions(student.departmentId);
        }
        this.loadRegisteredSessions();
      },
      error: (error) => console.error('Error loading student info', error),
    });
  }

  loadDepartmentSessions(departmentId: number): void {
    this.orientationService.getDepartmentSessions(departmentId).subscribe({
      next: (sessions) => (this.sessions = sessions),
      error: (error) => console.error('Error loading sessions', error),
    });
  }

  loadRegisteredSessions(): void {
    this.orientationService.getStudentOrientations().subscribe({
      next: (registeredSessions) => {
        this.registeredSessions = new Set(
          registeredSessions.map((session: any) => session.orientationID)
        );
      },
      error: (error) =>
        console.error('Error loading registered sessions', error),
    });
  }

  isRegistered(sessionId: number): boolean {
    return this.registeredSessions.has(sessionId);
  }

  register(sessionId: number): void {
    this.orientationService.registerForSession(sessionId).subscribe({
      next: () => {
        this.registeredSessions.add(sessionId);
      },
      error: (error) => console.error('Error registering for session', error),
    });
  }

  unregister(sessionId: number): void {
    this.orientationService.unregisterFromSession(sessionId).subscribe({
      next: () => {
        this.registeredSessions.delete(sessionId);
      },
      error: (error) =>
        console.error('Error unregistering from session', error),
    });
  }
}
