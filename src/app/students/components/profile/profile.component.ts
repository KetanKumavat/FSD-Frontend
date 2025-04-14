import { Component, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../auth/services/user.service';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false,
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  loading = true;
  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading profile: ' + error.message, 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    this.saving = true;
    const updatedData = this.profileForm.value;

    this.userService
      .updateUserProfile(this.currentUser.id, updatedData)
      .subscribe({
        next: (updatedUser) => {
          if (updatedUser) {
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 3000,
            });
            this.currentUser = updatedUser;
          } else {
            this.snackBar.open('Failed to update profile', 'Close', {
              duration: 3000,
            });
          }
          this.saving = false;
        },
        error: (error) => {
          this.snackBar.open(
            'Error updating profile: ' + error.message,
            'Close',
            { duration: 3000 }
          );
          this.saving = false;
        },
      });
  }
}
