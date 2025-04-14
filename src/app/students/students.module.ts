import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentsRoutingModule } from './students-routing.module';
import { ProfileComponent } from './components/profile/profile.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { StudentSessionsComponent } from './components/student-sessions/student-sessions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '../shared/shared.module';
import { DepartmentOrientationsComponent } from './components/department-orientations/department-orientations.component';
import { OrientationRegistrationComponent } from './components/orientation-registration/orientation-registration.component';

@NgModule({
  declarations: [
    ProfileComponent,
    SessionDetailsComponent,
    StudentDashboardComponent,
    StudentSessionsComponent,
    OrientationRegistrationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StudentsRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DepartmentOrientationsComponent,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentsModule {}
