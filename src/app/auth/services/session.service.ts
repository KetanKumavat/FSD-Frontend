import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OrientationSession } from '../../core/models/orientation.model';
import { map } from 'rxjs/operators';

export interface OrientationAttendee {
  id: number;
  sessionId: number;
  userId: number;
  registrationDate: Date;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiUrl = 'https://orientation-app.onrender.com/orientations';

  private sessions: OrientationSession[] = [
    {
      id: 1,
      orientationID: 1,
      title: 'Welcome Session',
      location: 'Main Hall',
      time: '10:00 AM',
      date: '2025-04-20',
      facultyName: 'Dr. Smith',
      capacity: 50,
      registeredCount: 12,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      description: 'Introduction to campus resources',
      active: true,
    },
  ];

  private attendees: OrientationAttendee[] = [
    {
      id: 1,
      sessionId: 1,
      userId: 2,
      registrationDate: new Date('2025-02-20'),
      userName: 'Student User',
      userEmail: 'student@example.com',
    },
  ];

  constructor(private http: HttpClient) {}

  // Admin methods
  getAllSessions(): Observable<OrientationSession[]> {
    return of(this.sessions);
  }

  getSessionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sessions/${id}`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  createSession(
    session: Omit<OrientationSession, 'id' | 'registeredCount'>
  ): Observable<OrientationSession> {
    const newSession: OrientationSession = {
      ...session,
      id: this.sessions.length + 1,
      registeredCount: 0,
    };
    this.sessions.push(newSession);
    return of(newSession);
  }

  updateSession(
    id: number,
    session: Partial<OrientationSession>
  ): Observable<OrientationSession | undefined> {
    const index = this.sessions.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...session };
      return of(this.sessions[index]);
    }
    return of(undefined);
  }

  deleteSession(id: number): Observable<boolean> {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.id !== id);
    // Also remove attendees for this session
    this.attendees = this.attendees.filter((a) => a.sessionId !== id);
    return of(this.sessions.length < initialLength);
  }

  // Student methods
  getAvailableSessions(): Observable<OrientationSession[]> {
    return of(this.sessions.filter((s) => s.registeredCount < s.capacity));
  }

  getRegisteredSessions(userId: number): Observable<OrientationSession[]> {
    const userAttendeeIds = this.attendees
      .filter((a) => a.userId === userId)
      .map((a) => a.sessionId);

    return of(
      this.sessions.filter(
        (s) => typeof s.id === 'number' && userAttendeeIds.includes(s.id)
      )
    );
  }

  registerForSession(
    sessionId: number,
    userId: number,
    userName: string,
    userEmail: string
  ): Observable<OrientationAttendee> {
    // Check if already registered
    const existingRegistration = this.attendees.find(
      (a) => a.sessionId === sessionId && a.userId === userId
    );
    if (existingRegistration) {
      return of(existingRegistration);
    }

    // Create new registration
    const newAttendee: OrientationAttendee = {
      id: this.attendees.length + 1,
      sessionId,
      userId,
      registrationDate: new Date(),
      userName,
      userEmail,
    };

    this.attendees.push(newAttendee);

    // Update session count
    const sessionIndex = this.sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      this.sessions[sessionIndex].registeredCount++;
    }

    return of(newAttendee);
  }

  checkInToSession(
    sessionId: number,
    studentId: string,
    name: string,
    email: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/check-in`, {
      studentId,
      name,
      email,
    });
  }

  unregisterFromSession(
    sessionId: number,
    userId: number
  ): Observable<boolean> {
    const initialLength = this.attendees.length;
    this.attendees = this.attendees.filter(
      (a) => !(a.sessionId === sessionId && a.userId === userId)
    );

    // Update session count if unregistered
    if (initialLength > this.attendees.length) {
      const sessionIndex = this.sessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        this.sessions[sessionIndex].registeredCount--;
      }
      return of(true);
    }

    return of(false);
  }

  // Get attendees for a session (admin only)
  getSessionAttendees(sessionId: number): Observable<OrientationAttendee[]> {
    return of(this.attendees.filter((a) => a.sessionId === sessionId));
  }

  getMockDashboardStats(): Observable<any> {
    return of({
      totalSessions: 24,
      upcomingSessions: 12,
      fullSessions: 5,
      totalRegistered: 120,
      totalCapacity: 240,
    });
  }
}
