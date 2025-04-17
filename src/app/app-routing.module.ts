import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { StudentCheckInComponent } from './students/components/student-check-in/student-check-in.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admins',
    loadChildren: () =>
      import('./admins/admins.module').then((m) => m.AdminsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admins/admins.module').then((m) => m.AdminsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'students',
    loadChildren: () =>
      import('./students/students.module').then((m) => m.StudentsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./students/students.module').then((m) => m.StudentsModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'check-in/:id',
    component: StudentCheckInComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
