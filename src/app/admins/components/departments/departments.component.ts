import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OrientationService } from '../../services/orientation.service';
import { Orientation } from '../../../core/models/orientation.model';
import { DepartmentDialogComponent } from '../department-dialog/department-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-departments',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="departments-container">
      <div class="header">
        <h1>Department Management</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="openDepartmentDialog()"
        >
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading" class="departments-grid">
        <mat-card
          *ngFor="let dept of departments"
          class="department-card"
          (click)="viewSessions(dept)"
        >
          <mat-card-header>
            <mat-card-title>{{ dept.departmentName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><mat-icon>location_on</mat-icon> {{ dept.location }}</p>
            <p>
              <mat-icon>event</mat-icon> {{ getSessionCount(dept) }} Sessions
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-button
              color="primary"
              (click)="viewSessions(dept); $event.stopPropagation()"
            >
              <mat-icon>visibility</mat-icon> View Sessions
            </button>
            <button
              mat-button
              color="accent"
              (click)="editDepartment(dept); $event.stopPropagation()"
            >
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button
              mat-button
              color="warn"
              (click)="deleteDepartment(dept); $event.stopPropagation()"
            >
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!loading && departments.length === 0" class="empty-state">
        <mat-icon>school</mat-icon>
        <h2>No Departments Found</h2>
        <p>Create your first department to get started</p>
        <button
          mat-raised-button
          color="primary"
          (click)="openDepartmentDialog()"
        >
          Add Department
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .departments-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .departments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
      .department-card {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .department-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      mat-card-content p {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }
      .empty-state {
        text-align: center;
        padding: 48px 0;
        color: #757575;
      }
      .empty-state mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }
      .loading-container {
        display: flex;
        justify-content: center;
        margin: 48px 0;
      }
    `,
  ],
})
export class DepartmentsComponent implements OnInit {
  departments: Orientation[] = [];
  loading = true;

  constructor(
    private orientationService: OrientationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.orientationService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load departments', error);
        this.loading = false;
      },
    });
  }

  getSessionCount(department: Orientation): number {
    return department.sessions?.length || 0;
  }

  viewSessions(department: Orientation): void {
    this.router.navigate([
      '/admin/departments',
      department.departmentID,
      'sessions',
    ]);
  }

  openDepartmentDialog(department?: Orientation): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '500px',
      data: department || {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (department) {
          this.updateDepartment(department.departmentID, result);
        } else {
          this.createDepartment(result);
        }
      }
    });
  }

  editDepartment(department: Orientation): void {
    this.openDepartmentDialog(department);
  }

  createDepartment(data: Partial<Orientation>): void {
    this.orientationService.createDepartment(data).subscribe({
      next: (newDepartment) => {
        this.departments.push(newDepartment);
        alert('Department created successfully');
      },
      error: (error) => {
        console.error('Failed to create department', error);
        alert('Failed to create department');
      },
    });
  }

  updateDepartment(id: number, data: Partial<Orientation>): void {
    this.orientationService.updateDepartment(id, data).subscribe({
      next: (updatedDepartment) => {
        const index = this.departments.findIndex((d) => d.departmentID === id);
        if (index !== -1) {
          this.departments[index] = updatedDepartment;
        }
        alert('Department updated successfully');
      },
      error: (error) => {
        console.error('Failed to update department', error);
        alert('Failed to update department');
      },
    });
  }

  deleteDepartment(department: Orientation): void {
    if (
      confirm(`Are you sure you want to delete ${department.departmentName}?`)
    ) {
      this.orientationService
        .deleteDepartment(department.departmentID)
        .subscribe({
          next: () => {
            this.departments = this.departments.filter(
              (d) => d.departmentID !== department.departmentID
            );
            alert('Department deleted successfully');
          },
          error: (error) => {
            console.error('Failed to delete department', error);
            alert('Failed to delete department');
          },
        });
    }
  }
}
