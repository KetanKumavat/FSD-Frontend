import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { StudentSessionsComponent } from './components/student-sessions/student-sessions.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'sessions', component: StudentSessionsComponent },
  { path: 'sessions/:id', component: StudentSessionsComponent },
  { path: 'sessions/details/:id', component: SessionDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsRoutingModule {}
