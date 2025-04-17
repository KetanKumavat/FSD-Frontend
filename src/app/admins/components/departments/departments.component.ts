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
          class="add-button"
          (click)="openDepartmentDialog()"
        >
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner color="accent"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="departments-grid">
        <mat-card
          *ngFor="let dept of departments"
          class="department-card"
          (click)="viewSessions(dept)"
        >
          <div class="card-indicator"></div>
          <div class="card-content">
            <mat-card-header>
              <mat-card-title>{{ dept.departmentName }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="location">
                <mat-icon>location_on</mat-icon> {{ dept.location }}
              </p>
              <p class="sessions">
                <mat-icon>event</mat-icon> {{ getSessionCount(dept) }} Sessions
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-button
                class="view-btn"
                (click)="viewSessions(dept); $event.stopPropagation()"
              >
                <mat-icon>visibility</mat-icon> View
              </button>
              <button
                mat-button
                class="edit-btn"
                (click)="editDepartment(dept); $event.stopPropagation()"
              >
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button
                mat-button
                class="delete-btn"
                (click)="deleteDepartment(dept); $event.stopPropagation()"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </div>
        </mat-card>
      </div>

      <div *ngIf="!loading && departments.length === 0" class="empty-state">
        <div class="empty-icon">
          <mat-icon>school</mat-icon>
        </div>
        <h2>No Departments Found</h2>
        <p>Create your first department to get started</p>
        <button
          mat-raised-button
          class="add-button"
          (click)="openDepartmentDialog()"
        >
          Add Department
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --primary-orange: #ff6f00;
        --light-orange: #ffe0b2;
        --hover-orange: #ff9800;
        --card-bg: #ffffff;
        --text-primary: #333333;
        --text-secondary: #757575;
        --border-radius: 12px;
      }

      .departments-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      .header h1 {
        font-size: 28px;
        font-weight: 500;
        color: var(--text-primary);
        margin: 0;
      }

      .add-button {
        background-color: var(--primary-orange);
        color: white;
        border-radius: 30px;
        padding: 0 24px;
        height: 44px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-button:hover {
        background-color: var(--hover-orange);
        box-shadow: 0 4px 8px rgba(255, 111, 0, 0.3);
        transform: translateY(-2px);
      }

      .departments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }

      .department-card {
        position: relative;
        border-radius: var(--border-radius);
        border: none;
        overflow: hidden;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
        padding: 0;
        display: flex;
        background-color: var(--card-bg);
      }

      .card-indicator {
        width: 6px;
        background-color: var(--primary-orange);
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
      }

      .card-content {
        padding: 16px 16px 8px 24px;
        flex: 1;
      }

      .department-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 20px rgba(0, 0, 0, 0.1);
      }

      mat-card-header {
        padding: 0;
        margin-bottom: 12px;
      }

      mat-card-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      mat-card-content {
        padding: 0;
        margin-bottom: 16px;
      }

      mat-card-content p {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
        color: var(--text-secondary);
        font-size: 14px;
      }

      mat-card-content mat-icon {
        color: var(--primary-orange);
        font-size: 18px;
        height: 18px;
        width: 18px;
      }

      mat-card-actions {
        padding: 8px 0;
        display: flex;
        justify-content: flex-start;
        gap: 4px;
        border-top: 1px solid #f0f0f0;
        margin: 0;
      }

      mat-card-actions button {
        min-width: auto;
      }

      .view-btn {
        color: var(--primary-orange);
      }

      .edit-btn {
        color: rgb(0, 0, 0);
      }

      .delete-btn {
        color: #ea4335;
        min-width: 40px !important;
      }

      .empty-state {
        text-align: center;
        padding: 64px 0;
        color: var(--text-secondary);
        background-color: rgba(255, 240, 229, 0.3);
        border-radius: var(--border-radius);
        margin-top: 32px;
      }

      .empty-icon {
        background-color: var(--light-orange);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
      }

      .empty-state mat-icon {
        font-size: 40px;
        height: 40px;
        width: 40px;
        color: var(--primary-orange);
      }

      .empty-state h2 {
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .empty-state p {
        margin-bottom: 24px;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        margin: 64px 0;
      }

      /* Make spinner use orange color */
      ::ng-deep .mat-mdc-progress-spinner.mat-accent circle {
        stroke: var(--primary-orange) !important;
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
