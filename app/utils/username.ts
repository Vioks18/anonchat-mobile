import { debounce } from 'lodash';
import { UsernameValidation } from '../types/user';

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  'admin', 'support', 'help', 'moderator', 'system', 'anon', 
  'me', 'you', 'null', 'root', 'owner', 'test', 'demo'
];

// Validation regex: letters, numbers, underscores, 3-20 chars, no leading underscore
const USERNAME_REGEX = /^[a-z0-9][a-z0-9_]{2,19}$/;

/**
 * Normalizes a username input into lowercase handle
 * @param raw - Raw username input (may include @)
 * @returns Normalized lowercase handle
 */
export const normalizeHandle = (raw: string): string => {
  // Remove leading @ and trim
  const trimmed = raw.trim().replace(/^@+/, '');
  
  // Convert to lowercase for uniqueness
  return trimmed.toLowerCase();
};

/**
 * Validates a username input
 * @param raw - Raw username input
 * @returns Validation result
 */
export const validateUsername = (raw: string): UsernameValidation => {
  if (!raw || raw.trim().length === 0) {
    return { isValid: false, error: 'empty' };
  }

  const handle = normalizeHandle(raw);
  
  // Check length
  if (handle.length < 3) {
    return { isValid: false, error: 'too_short' };
  }
  
  if (handle.length > 20) {
    return { isValid: false, error: 'too_long' };
  }
  
  // Check regex (includes no leading underscore check)
  if (!USERNAME_REGEX.test(handle)) {
    return { isValid: false, error: 'invalid_chars' };
  }
  
  // Check reserved names
  if (RESERVED_USERNAMES.includes(handle)) {
    return { isValid: false, error: 'reserved' };
  }
  
  return { isValid: true };
};

/**
 * Debounced function for username availability check
 */
export const debouncedAvailabilityCheck = debounce(
  (checkFn: (handle: string) => Promise<boolean>, handle: string) => checkFn(handle),
  300
);

/**
 * Gets validation error message
 */
export const getValidationMessage = (error?: string): string => {
  switch (error) {
    case 'empty':
      return 'Username cannot be empty';
    case 'too_short':
      return 'Username must be at least 3 characters';
    case 'too_long':
      return 'Username must be 20 characters or less';
    case 'invalid_chars':
      return 'Username can only contain letters, numbers, and underscores';
    case 'reserved':
      return 'This username is reserved';
    default:
      return '';
  }
};
