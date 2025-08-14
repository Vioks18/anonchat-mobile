// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type ProviderKind = 'email' | 'google' | 'phone' | 'guest';

export interface AuthUser {
  uid: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarColorIndex?: number;
  createdAt?: Date;
  avatarURL?: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
