// Универсальная система валидации
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class InputValidator {
  private static readonly DEFAULT_MAX_LENGTH = 1000;
  private static readonly DEFAULT_MIN_LENGTH = 1;
  
  // Валидация сообщений чата
  static validateMessage(text: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Сообщение не может быть пустым'
      },
      {
        type: 'minLength',
        value: 1,
        message: 'Сообщение должно содержать хотя бы 1 символ'
      },
      {
        type: 'maxLength',
        value: 1000,
        message: 'Сообщение слишком длинное (максимум 1000 символов)'
      },
      {
        type: 'pattern',
        value: /^[\s\S]*$/,
        message: 'Сообщение содержит недопустимые символы'
      },
      {
        type: 'custom',
        message: 'Сообщение содержит слишком много пробелов',
        validator: (value: string) => {
          const trimmed = value.trim();
          return trimmed.length > 0 && !/^\s+$/.test(value);
        }
      }
    ];

    return this.validate(text, rules);
  }

  // Валидация поискового запроса
  static validateSearchQuery(text: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        type: 'maxLength',
        value: 100,
        message: 'Поисковый запрос слишком длинный (максимум 100 символов)'
      },
      {
        type: 'pattern',
        value: /^[a-zA-Zа-яА-Я0-9\s\-_.,!?()]*$/,
        message: 'Поисковый запрос содержит недопустимые символы'
      },
      {
        type: 'custom',
        message: 'Поисковый запрос содержит только пробелы',
        validator: (value: string) => {
          return value.trim().length > 0;
        }
      }
    ];

    return this.validate(text, rules);
  }

  // Валидация имени пользователя
  static validateUsername(text: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Имя пользователя обязательно'
      },
      {
        type: 'minLength',
        value: 2,
        message: 'Имя пользователя должно содержать минимум 2 символа'
      },
      {
        type: 'maxLength',
        value: 30,
        message: 'Имя пользователя слишком длинное (максимум 30 символов)'
      },
      {
        type: 'pattern',
        value: /^[a-zA-Zа-яА-Я0-9_-]+$/,
        message: 'Имя пользователя содержит недопустимые символы'
      }
    ];

    return this.validate(text, rules);
  }

  // Валидация email
  static validateEmail(text: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        type: 'required',
        message: 'Email обязателен'
      },
      {
        type: 'pattern',
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Неверный формат email'
      },
      {
        type: 'maxLength',
        value: 254,
        message: 'Email слишком длинный'
      }
    ];

    return this.validate(text, rules);
  }

  // Универсальная валидация
  static validate(text: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверяем каждое правило
    rules.forEach(rule => {
      try {
        switch (rule.type) {
          case 'required':
            if (!text || text.trim().length === 0) {
              errors.push(rule.message);
            }
            break;

          case 'minLength':
            if (text.length < (rule.value || this.DEFAULT_MIN_LENGTH)) {
              errors.push(rule.message);
            }
            break;

          case 'maxLength':
            if (text.length > (rule.value || this.DEFAULT_MAX_LENGTH)) {
              errors.push(rule.message);
            }
            break;

          case 'pattern':
            if (rule.value && !rule.value.test(text)) {
              errors.push(rule.message);
            }
            break;

          case 'custom':
            if (rule.validator && !rule.validator(text)) {
              errors.push(rule.message);
            }
            break;
        }
      } catch (error) {
        console.error('Validation error:', error);
        warnings.push('Ошибка валидации');
      }
    });

    // Дополнительные проверки безопасности
    if (text.includes('<script>') || text.includes('javascript:')) {
      errors.push('Обнаружен потенциально опасный код');
    }

    // Проверка на XSS
    if (text.includes('<') && text.includes('>')) {
      warnings.push('Обнаружены HTML-теги');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Санитизация текста (очистка от опасных символов)
  static sanitizeText(text: string): string {
    try {
      return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } catch (error) {
      console.error('Sanitization error:', error);
      return text.trim();
    }
  }

  // Проверка на спам/флуд
  static checkForSpam(text: string, previousTexts: string[] = []): boolean {
    try {
      // Проверка на повторяющиеся символы
      const repeatedChars = /(.)\1{10,}/;
      if (repeatedChars.test(text)) {
        return true;
      }

      // Проверка на повторяющиеся сообщения
      const recentTexts = previousTexts.slice(-5);
      const duplicateCount = recentTexts.filter(t => t === text).length;
      if (duplicateCount >= 2) {
        return true;
      }

      // Проверка на слишком короткие сообщения
      if (text.length < 2 && text.trim().length > 0) {
        return false; // Разрешаем короткие сообщения
      }

      return false;
    } catch (error) {
      console.error('Spam check error:', error);
      return false;
    }
  }

  // Получить сообщение об ошибке для пользователя
  static getUserFriendlyError(validationResult: ValidationResult): string {
    if (validationResult.isValid) {
      return '';
    }

    // Возвращаем первую ошибку
    return validationResult.errors[0] || 'Неверный ввод';
  }

  // Получить предупреждение для пользователя
  static getUserFriendlyWarning(validationResult: ValidationResult): string {
    if (validationResult.warnings.length === 0) {
      return '';
    }

    return validationResult.warnings[0];
  }
}

// Default export для Expo Router
export default InputValidator;
