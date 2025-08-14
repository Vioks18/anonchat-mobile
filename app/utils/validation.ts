// Validation utilities for chat messages

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export class InputValidator {
  static validateMessage(text: string): ValidationResult {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Сообщение не может быть пустым' };
    }

    if (text.length > 1000) {
      return { isValid: false, error: 'Сообщение слишком длинное (максимум 1000 символов)' };
    }

    // Проверка на спам
    if (this.checkForSpam(text)) {
      return { isValid: false, error: 'Обнаружен спам' };
    }

    return { isValid: true };
  }

  static checkForSpam(text: string): boolean {
    const spamPatterns = [
      /\b(spam|реклама|купить|продать)\b/i,
      /(http|www\.)/i,
      /[A-Z]{5,}/,
      /[!@#$%^&*()]{3,}/
    ];

    return spamPatterns.some(pattern => pattern.test(text));
  }

  static sanitizeText(text: string): string {
    // Удаляем лишние пробелы и переносы строк
    return text.trim().replace(/\s+/g, ' ');
  }

  static getUserFriendlyError(result: ValidationResult): string {
    return result.error || 'Неизвестная ошибка валидации';
  }

  static getUserFriendlyWarning(result: ValidationResult): string | null {
    return result.warning || null;
  }

  static validateSearchQuery(text: string): ValidationResult {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Поисковый запрос не может быть пустым' };
    }

    if (text.length > 100) {
      return { isValid: false, error: 'Поисковый запрос слишком длинный (максимум 100 символов)' };
    }

    return { isValid: true };
  }
}
