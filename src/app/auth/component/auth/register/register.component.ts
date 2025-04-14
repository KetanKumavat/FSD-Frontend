import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrientationService } from '../../../../admins/services/orientation.service';
import { Orientation } from '../../../../core/models/orientation.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false,
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  departments: Orientation[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  hidePassword: boolean = true;
  roles: string[] = ['student', 'admin'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orientationService: OrientationService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      role: ['student', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      departmentId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Add role-specific fields when role changes
    this.registrationForm.get('role')?.valueChanges.subscribe((role) => {
      this.updateFormFields(role);
    });
    this.orientationService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => console.error('Error loading departments', error),
    });

    // Set initial form fields based on default role (student)
    this.updateFormFields('student');
  }

  updateFormFields(role: string): void {
    let controlsToRemove;
    if (role.toLowerCase() === 'student') {
      controlsToRemove = ['fullName', 'designation'];
    } else {
      // admin role
      controlsToRemove = [
        'firstName',
        'lastName',
        'phoneNumber',
        'departmentId', // Remove departmentId for admin role
      ];
    }

    controlsToRemove.forEach((control) => {
      if (this.registrationForm.contains(control)) {
        this.registrationForm.removeControl(control);
      }
    });

    // Add fields based on selected role
    if (role.toLowerCase() === 'student') {
      this.registrationForm.addControl(
        'firstName',
        this.fb.control('', Validators.required)
      );
      this.registrationForm.addControl(
        'lastName',
        this.fb.control('', Validators.required)
      );
      this.registrationForm.addControl('phoneNumber', this.fb.control(''));
    } else if (role.toLowerCase() === 'admin') {
      this.registrationForm.addControl(
        'fullName',
        this.fb.control('', Validators.required)
      );
      this.registrationForm.addControl('designation', this.fb.control(''));
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;

    // Get form values
    const formData = this.registrationForm.value;

    this.authService.register(formData).subscribe({
      next: (response) => {
        // Store user data and token
        this.authService.storeUserData(response.token, response.role);
        this.loading = false;

        // Redirect based on role
        if (formData.role.toUpperCase() === 'ADMIN') {
          this.router.navigate(['/admins/dashboard']);
        } else {
          this.router.navigate(['/students/dashboard']);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }
}
