export type UsernameValidationError = 
  | 'too_short'
  | 'too_long'
  | 'invalid_chars'
  | 'starts_with_underscore'
  | 'reserved_name'
  | 'empty';

export type UsernameAvailability = 
  | { available: true }
  | { available: false; reason: 'taken' | 'reserved' };

export type UsernameClaimResult = 
  | { success: true; username: string; display: string }
  | { success: false; reason: 'taken' | 'invalid' | 'reserved' | 'network_error' };

export interface UsernameData {
  uid: string;
  display: string;
  createdAt: any; // Firestore timestamp
}

export interface UserProfile {
  uid: string;
  username?: string;
  username_lc?: string;
  loading: boolean;
}
