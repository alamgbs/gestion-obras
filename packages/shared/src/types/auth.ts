import type { Role } from '../constants/roles.js';

export interface UserProfile {
  id: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: Role;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: Role;
  is_active?: boolean;
}
