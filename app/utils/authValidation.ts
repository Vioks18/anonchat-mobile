// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

import { ValidationResult } from '../types/auth';

export function isValidEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return { isValid: false, error: 'Email обязателен' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Введите корректный email адрес' };
  }
  return { isValid: true };
}

export function isStrongPassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' };
  }
  return { isValid: true };
}

export function isValidUsername(username: string): ValidationResult {
  // Remove @ if present and validate
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  
  if (!cleanUsername) {
    return { isValid: false, error: 'Username обязателен' };
  }
  
  if (cleanUsername.length < 3) {
    return { isValid: false, error: 'Username должен содержать минимум 3 символа' };
  }
  
  if (cleanUsername.length > 20) {
    return { isValid: false, error: 'Username должен содержать максимум 20 символов' };
  }
  
  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(cleanUsername)) {
    return { isValid: false, error: 'Username может содержать только буквы, цифры и подчеркивания' };
  }
  
  return { isValid: true };
}

export function normalizeUsername(username: string): string {
  // Remove @ and convert to lowercase
  return username.startsWith('@') ? username.slice(1).toLowerCase() : username.toLowerCase();
}
