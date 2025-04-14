import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Orientation } from '../../../core/models/orientation.model';

@Component({
  selector: 'app-department-dialog',
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class DepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Orientation>
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.departmentID;

    this.departmentForm = this.fb.group({
      departmentName: [this.data.departmentName || '', Validators.required],
      location: [this.data.location || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      const formData = this.departmentForm.value;

      this.dialogRef.close({
        ...this.data,
        ...formData,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
