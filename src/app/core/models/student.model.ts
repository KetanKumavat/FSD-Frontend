import { User } from './user.model';
import { OrientationSession } from './orientation.model';

export interface Student {
  studentID?: number;
  user?: User;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  departmentId?: number;
  createdAt?: string;
  updatedAt?: string;
  orientationSessions?: OrientationSession[];
  department?: {
    departmentID: number;
    departmentName: string;
    location: string;
    sessions?: OrientationSession[];
  };
}
