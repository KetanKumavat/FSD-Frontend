import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentLayoutComponent } from './components/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { StudentSessionsComponent } from './components/student-sessions/student-sessions.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DepartmentOrientationsComponent } from './components/department-orientations/department-orientations.component';
import { OrientationRegistrationComponent } from './components/orientation-registration/orientation-registration.component';
import { StudentCheckInComponent } from './components/student-check-in/student-check-in.component';

const routes: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'sessions', component: StudentSessionsComponent },
      { path: 'sessions/details/:id', component: SessionDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'departments', component: DepartmentOrientationsComponent },
      { path: 'register', component: OrientationRegistrationComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'check-in/:sessionId', component: StudentCheckInComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsRoutingModule {}
