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
    console.log('Login: Attempting login for', email);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login: Successfully logged in');

        // Important: Retrieve the redirect URL immediately
        const redirectUrl = this.authService.getRedirectUrl();
        console.log('Login: Saved redirect URL is:', redirectUrl);

        if (redirectUrl && redirectUrl.trim() !== '') {
          console.log('Login: Redirecting to saved URL:', redirectUrl);
          // Clear the redirect URL before navigation to prevent loops
          this.authService.clearRedirectUrl();
          // Use timeout to ensure route change happens after auth processing
          setTimeout(() => {
            this.router.navigateByUrl(redirectUrl);
          }, 100);
        } else {
          console.log(
            'Login: No redirect URL found, using role-based navigation'
          );
          this.redirectBasedOnRole();
        }
      },
      error: (error) => {
        console.error('Login: Error during login:', error);
        this.errorMessage = error.error?.message || 'Failed to login';
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
