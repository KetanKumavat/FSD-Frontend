import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminsRoutingModule } from './admins-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminSessionsComponent } from './components/admin-sessions/admin-sessions.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { DepartmentsComponent } from './components/departments/departments.component';

// Material imports
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

// Standalone components
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { SessionDialogComponent } from './components/session-dialog/session-dialog.component';
import { DepartmentDialogComponent } from './components/department-dialog/department-dialog.component';
import { QrCodeGeneratorComponent } from './components/qr-code-generator/qr-code-generator.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminSessionsComponent,
    SessionDetailsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminsRoutingModule,
    // Material modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    // Standalone components
    AdminLayoutComponent,
    SessionDialogComponent,
    DepartmentDialogComponent,
    QrCodeGeneratorComponent,
    DepartmentsComponent,
  ],
})
export class AdminsModule {}
