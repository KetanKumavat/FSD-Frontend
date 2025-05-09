import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminSessionsComponent } from './components/admin-sessions/admin-sessions.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'departments', component: DepartmentsComponent },
      { path: 'departments/:id/sessions', component: AdminSessionsComponent },
      { path: 'sessions', component: DepartmentsComponent },
      { path: 'sessions/:id', component: SessionDetailsComponent },
      {
        path: 'sessions/:id',
        component: SessionDetailsComponent,
      },
      {
        path: 'qr-scanner/:id',
        component: QrScannerComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminsRoutingModule {}
