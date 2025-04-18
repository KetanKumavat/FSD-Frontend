import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Orientation,
  OrientationSession,
} from '../../core/models/orientation.model';
import { AuthService } from '../../auth/services/auth.service';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrientationService {
  private apiUrl = `${environment.apiUrl}/orientations`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  // Department methods
  // Department methods
  getAllDepartments(): Observable<Orientation[]> {
    return this.http.get<Orientation[]>(`${this.apiUrl}/departments`);
  }

  getDepartmentById(id: number): Observable<Orientation> {
    return this.http.get<Orientation>(`${this.apiUrl}/departments/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createDepartment(department: Partial<Orientation>): Observable<Orientation> {
    return this.http.post<Orientation>(
      `${this.apiUrl}/departments`,
      department,
      { headers: this.getAuthHeaders() }
    );
  }

  updateDepartment(
    id: number,
    department: Partial<Orientation>
  ): Observable<Orientation> {
    return this.http.put<Orientation>(
      `${this.apiUrl}/departments/${id}`,
      department,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
  // Session methods
  // Session methods
  getAllSessions(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/sessions`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => this.normalizeSessionsResponse(response)),
        catchError((error) => {
          console.error('Error loading sessions:', error);
          return of([]);
        })
      );
  }

  getSessionsByDepartment(
    departmentId: number
  ): Observable<OrientationSession[]> {
    return this.http.get<OrientationSession[]>(
      `${this.apiUrl}/departments/${departmentId}/sessions`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateSession(
    id: number,
    sessionData: Partial<OrientationSession>
  ): Observable<OrientationSession> {
    return this.http.put<OrientationSession>(
      `${this.apiUrl}/sessions/${id}`,
      sessionData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Fixed createSession method
  createSession(departmentId: number, sessionData: any): Observable<any> {
    const payload = {
      departmentID: departmentId,
      time: sessionData.time,
      facultyName: sessionData.facultyName,
      capacity: sessionData.capacity,
      title: sessionData.title,
      location: sessionData.location,
    };
    return this.http.post<any>(
      `${this.apiUrl}/departments/${departmentId}/sessions`,
      payload,
      { headers: this.getAuthHeaders() }
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

  private normalizeSessionsResponse(response: any[]): any[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .filter((item) => typeof item === 'object' && item !== null)
      .map((session) => this.normalizeSessionData(session));
  }

  // Helper method to normalize individual session data
  private normalizeSessionData(session: any): any {
    if (!session || typeof session !== 'object') {
      return null;
    }

    // Convert time string to a full date (today + time)
    const timeString = session.time || '00:00:00';
    const today = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    today.setHours(hours, minutes, 0);

    // Create a properly structured session object
    return {
      id: session.orientationID,
      title: `Orientation Session ${session.orientationID}`,
      department: session.department
        ? {
            id: session.department.departmentID,
            name: session.department.departmentName,
          }
        : null,
      startTime: today.toISOString(),
      location: session.location || session.department?.location || 'TBD',
      capacity: 30, // Default capacity
      description: `Faculty: ${session.facultyName || 'TBD'}`,
      active: true,
      registeredCount: Array.isArray(session.attendees)
        ? session.attendees.length
        : 0,
      date: today,
      faculty: session.facultyName,
      // Format for table display
      time: timeString,
      endTime: this.calculateEndTime(timeString),
    };
  }

  private calculateEndTime(startTime: string): string {
    if (!startTime) return '00:00:00';

    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    date.setTime(date.getTime() + 90 * 60 * 1000); // Add 90 minutes

    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}:00`;
  }

  // Shared methods
  getSessionAttendees(sessionId: number): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/sessions/${sessionId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((session) => {
          if (!session || !Array.isArray(session.attendees)) {
            return [];
          }
          return session.attendees.map((attendee: any) => ({
            id: attendee.studentID,
            name: `${attendee.firstName} ${attendee.lastName}`,
            email: attendee.user?.email || 'N/A',
            checkInTime: attendee.checkInTime || new Date().toISOString(),
          }));
        }),
        catchError(() => of([]))
      );
  }

  exportAttendees(sessionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sessions/${sessionId}/export`, {
      responseType: 'blob',
      headers: this.getAuthHeaders(),
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
    return this.http
      .get<any>(`${this.apiUrl}/stats`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching dashboard stats:', error);
          // Fallback to mock data if API call fails
          return of({
            totalSessions: 12,
            upcomingSessions: 8,
            fullSessions: 3,
            totalRegistered: 156,
            totalCapacity: 240,
            departments: 5,
          });
        })
      );
  }

  getRecentSessions(): Observable<any[]> {
    return this.getAllSessions().pipe(map((sessions) => sessions.slice(0, 5)));
  }

  getSessionById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/sessions/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((session) => this.normalizeSessionData(session)),
        catchError((error) => {
          console.error(`Error loading session ${id}:`, error);
          return of(null);
        })
      );
  }

  // Remove or keep getMockDashboardStats as a fallback
  getMockDashboardStats(): Observable<any> {
    return of({
      totalSessions: 12,
      upcomingSessions: 8,
      fullSessions: 3,
      totalRegistered: 156,
      totalCapacity: 240,
      departments: 5,
    });
  }
}
