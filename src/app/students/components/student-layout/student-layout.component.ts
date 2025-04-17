import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentNavbarComponent } from '../student-navbar/student-navbar.component';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, StudentNavbarComponent],
})
export class StudentLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
