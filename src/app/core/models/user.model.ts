export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface User {
  userId?: number;
  id: number;
  email: string;
  passwordHash?: string;
  role: UserRole;
  username?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  message: string;
}
