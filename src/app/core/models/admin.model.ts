import { User } from './user.model';

export interface Admin {
  adminID?: number;
  user?: User;
  fullName: string;
  designation?: string;
  createdAt?: string;
  updatedAt?: string;
}
