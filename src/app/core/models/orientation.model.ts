import { Student } from './student.model';

export interface Orientation {
  departmentID: number;
  departmentName: string;
  location: string;
  sessions?: OrientationSession[];
}

export interface OrientationSession {
  id?: number;
  orientationID: number;
  title: string;
  location: string;
  department?: {
    id: number;
    name: string;
    departmentName?: string;
    location?: string;
  };
  departmentID?: number;
  time: string;
  date: string;
  facultyName: string;
  faculty?: string;
  attendees?: Student[];
  capacity: number;
  registeredCount: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  active?: boolean;
}
