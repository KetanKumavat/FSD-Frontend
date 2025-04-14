import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { OrientationSession } from '../../../core/models/orientation.model';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-dialog',
  templateUrl: './session-dialog.component.html',
  styleUrls: ['./session-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class SessionDialogComponent implements OnInit {
  sessionForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      session?: OrientationSession;
      departmentId: number;
    }
  ) {}

  ngOnInit(): void {
    const session = this.data.session;
    this.isEditMode = !!session;

    // Extract date and time from the session.time string if in edit mode
    let sessionDate = null;
    let sessionTime = '';

    if (session && session.time) {
      const dateTime = new Date(session.time);
      sessionDate = dateTime;
      sessionTime = dateTime.toTimeString().substring(0, 5); // Format HH:MM
    }

    this.sessionForm = this.fb.group({
      facultyName: [session?.facultyName || '', [Validators.required]],
      time: [sessionTime || '', [Validators.required]],
      date: [sessionDate, [Validators.required]],
      capacity: [
        session?.capacity || 30,
        [Validators.required, Validators.min(1), Validators.max(500)],
      ],
      location: [session?.department?.location || '', [Validators.required]],
      title: [session?.title || '', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.sessionForm.valid) {
      const formData = this.sessionForm.value;
      const date = formData.date;

      // Combine date and time into ISO string format
      const timeString = formData.time;

      // Create an object that matches what the backend expects
      const sessionData = {
        orientationID: this.data.session?.orientationID,
        departmentID: this.data.departmentId,
        time: timeString,
        facultyName: formData.facultyName,
        capacity: formData.capacity,
        title: formData.title,
        location: formData.location,
      };

      this.dialogRef.close(sessionData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
