import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Orientation,
  OrientationSession,
} from '../../core/models/orientation.model';

@Injectable({
  providedIn: 'root',
})
export class OrientationService {
  private apiUrl = 'http://localhost:8080/orientations';

  constructor(private http: HttpClient) {}

  // Department methods
  getAllDepartments(): Observable<Orientation[]> {
    return this.http.get<Orientation[]>(`${this.apiUrl}/departments`);
  }

  getDepartmentById(id: number): Observable<Orientation> {
    return this.http.get<Orientation>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(department: Partial<Orientation>): Observable<Orientation> {
    return this.http.post<Orientation>(
      `${this.apiUrl}/departments`,
      department
    );
  }

  updateDepartment(
    id: number,
    department: Partial<Orientation>
  ): Observable<Orientation> {
    return this.http.put<Orientation>(
      `${this.apiUrl}/departments/${id}`,
      department
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
  }

  // Session methods
  getAllSessions(): Observable<OrientationSession[]> {
    return this.http.get<OrientationSession[]>(`${this.apiUrl}/sessions`);
  }

  getSessionById(id: number): Observable<OrientationSession> {
    return this.http.get<OrientationSession>(`${this.apiUrl}/sessions/${id}`);
  }

  getSessionsByDepartment(
    departmentId: number
  ): Observable<OrientationSession[]> {
    return this.http.get<OrientationSession[]>(
      `${this.apiUrl}/departments/${departmentId}/sessions`
    );
  }

  updateSession(id: number, session: any): Observable<OrientationSession> {
    return this.http.put<OrientationSession>(
      `${this.apiUrl}/sessions/${id}`,
      session
    );
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${id}`);
  }

  // Attendance methods
  registerStudentForSession(
    sessionId: number,
    studentId: number
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/sessions/${sessionId}/register/${studentId}`,
      {}
    );
  }

  removeStudentFromSession(
    sessionId: number,
    studentId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/sessions/${sessionId}/register/${studentId}`
    );
  }

  // Admin methods
  getDepartmentSessions(departmentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/departments/${departmentId}/sessions`
    );
  }

  createSession(departmentId: number, sessionData: any): Observable<any> {
    const payload = {
      departmentID: departmentId,
      time: sessionData.time, // Make sure this is just HH:MM:SS
      facultyName: sessionData.facultyName,
      capacity: sessionData.capacity,
      title: sessionData.title,
      location: sessionData.location,
    };
    return this.http.post<any>(
      `${this.apiUrl}/departments/${departmentId}/sessions`,
      payload
    );
  }

  // Student methods
  registerForSession(sessionId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/sessions/${sessionId}/register`,
      {}
    );
  }

  unregisterFromSession(sessionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/sessions/${sessionId}/register`
    );
  }

  // Shared methods
  getSessionAttendees(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/sessions/${sessionId}/attendees`
    );
  }

  // Export functionality
  exportAttendees(sessionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sessions/${sessionId}/export`, {
      responseType: 'blob',
    });
  }

  getStudentOrientations(): Observable<OrientationSession[]> {
    return this.http.get<OrientationSession[]>(
      `${this.apiUrl}/sessions/registered`
    );
  }

  getSessionQrCode(sessionId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sessions/${sessionId}/qr`);
  }

  checkInStudent(sessionId: number, studentEmail: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/sessions/${sessionId}/check-in`,
      { email: studentEmail }
    );
  }

  getDashboardStats(): Observable<any> {
    // This could be a real endpoint or a mock
    return of({
      departments: 5,
      totalSessions: 12,
      upcomingSessions: 8,
      fullSessions: 3,
      registrations: 156,
      totalCapacity: 240,
    });
  }

  getRecentSessions(): Observable<any[]> {
    return this.getAllSessions();
  }
}
