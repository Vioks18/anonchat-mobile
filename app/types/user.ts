export interface User {
  uid: string;
  email?: string;
  username?: string; // @handle format
  displayName?: string;
  avatarURL?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface AuthState {
  user: User | null;
  initializing: boolean;
  error: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string; // without @
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UsernameValidation {
  isValid: boolean;
  error?: 'too_short' | 'too_long' | 'invalid_chars' | 'reserved' | 'empty';
}

export interface UsernameAvailability {
  available: boolean;
  checking: boolean;
}
