import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface OrientationSession {
  id: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registeredCount: number;
}

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
  // Hardcoded data for demo
  private sessions: OrientationSession[] = [
    {
      id: 1,
      title: 'Welcome to Computer Science',
      description:
        'Introduction to the Computer Science department and curriculum.',
      date: new Date('2025-03-15'),
      startTime: '09:00',
      endTime: '11:00',
      location: 'CS Building, Room 101',
      capacity: 30,
      registeredCount: 15,
    },
    {
      id: 2,
      title: 'Engineering Orientation',
      description: 'Overview of the Engineering programs and facilities.',
      date: new Date('2025-03-16'),
      startTime: '10:00',
      endTime: '12:00',
      location: 'Engineering Hall, Room 201',
      capacity: 40,
      registeredCount: 25,
    },
    {
      id: 3,
      title: 'Business School Introduction',
      description: 'Learn about the Business School and its opportunities.',
      date: new Date('2025-03-17'),
      startTime: '13:00',
      endTime: '15:00',
      location: 'Business Building, Auditorium',
      capacity: 50,
      registeredCount: 30,
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

  getSessionById(id: number): Observable<OrientationSession | undefined> {
    const session = this.sessions.find((s) => s.id === id);
    return of(session);
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

    return of(this.sessions.filter((s) => userAttendeeIds.includes(s.id)));
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

    // Check if session has capacity
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session || session.registeredCount >= session.capacity) {
      throw new Error('Session is full or does not exist');
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
