import { Student } from './student.model';

export interface Orientation {
  departmentID: number;
  departmentName: string;
  location: string;
  sessions?: OrientationSession[];
}

export interface OrientationSession {
  title: string;
  orientationID: number;
  department?: Orientation;
  departmentID?: number;
  time: string;
  facultyName: string;
  attendees?: Student[];
  capacity: number;
}
