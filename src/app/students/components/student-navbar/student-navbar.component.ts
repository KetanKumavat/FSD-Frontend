import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-navbar',
  templateUrl: './student-navbar.component.html',
  styleUrls: ['./student-navbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
  ],
})
export class StudentNavbarComponent implements OnInit {
  isMenuActive = false;
  currentStudentName: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadStudentInfo();
  }

  loadStudentInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentStudentName = user.name || 'Student';

      // For more detailed student info, fetch from the student service
      this.studentService.getCurrentStudentProfile().subscribe({
        next: (student) => {
          if (student) {
            this.currentStudentName = `${student.firstName} ${student.lastName}`;
          }
        },
        error: (err) => {
          console.error('Error loading student info:', err);
        },
      });
    }
  }

  toggleMenu(): void {
    this.isMenuActive = !this.isMenuActive;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
