export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}
