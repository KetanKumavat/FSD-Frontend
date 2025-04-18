import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../core/models/student.model';
import { OrientationSession } from '../../core/models/orientation.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  getCurrentStudentProfile(): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/profile`);
  }

  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  getStudentOrientations(): Observable<OrientationSession[]> {
    return this.http.get<OrientationSession[]>(`${this.apiUrl}/orientations`);
  }

  getCurrentStudent(): Observable<Student> {
    return this.getCurrentStudentProfile();
  }
}
