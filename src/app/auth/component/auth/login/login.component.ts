import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        // Check if there's a redirect URL from a QR code scan
        const redirectUrl = this.authService.getRedirectUrl();
        if (redirectUrl) {
          // Clear the saved URL first
          this.authService.clearRedirectUrl();
          // Navigate to the saved URL (from QR code)
          this.router.navigateByUrl(redirectUrl);
        } else {
          // Default role-based navigation if no redirect URL
          this.redirectBasedOnRole();
        }
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to login';
        this.loading = false;
      },
    });
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']); // Change from /admins/dashboard
    } else {
      this.router.navigate(['/student/dashboard']); // Change from /students/dashboard
    }

    // Add debugging to verify role and navigation
    console.log('Redirecting user with role:', user?.role);
    console.log('Current user data:', user);
  }
}
