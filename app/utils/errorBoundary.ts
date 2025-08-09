import { Alert } from 'react-native';

// Типы ошибок
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorInfo {
  message: string;
  severity: ErrorSeverity;
  component: string;
  timestamp: number;
  stack?: string;
  userAction?: string;
}

// Система мониторинга ошибок
class ErrorMonitor {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;
  private criticalErrorCount = 0;
  private readonly MAX_CRITICAL_ERRORS = 3;

  // Добавить ошибку
  addError(error: Error, component: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM, userAction?: string) {
    const errorInfo: ErrorInfo = {
      message: error.message,
      severity,
      component,
      timestamp: Date.now(),
      stack: error.stack,
      userAction
    };

    this.errors.push(errorInfo);

    // Ограничиваем количество ошибок
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Отслеживаем критические ошибки
    if (severity === ErrorSeverity.CRITICAL) {
      this.criticalErrorCount++;
      
      if (this.criticalErrorCount >= this.MAX_CRITICAL_ERRORS) {
        this.handleCriticalErrorThreshold();
      }
    }

    // Логируем ошибку
    this.logError(errorInfo);
  }

  // Обработка превышения лимита критических ошибок
  private handleCriticalErrorThreshold() {
    if (__DEV__) console.error('ErrorMonitor: Превышен лимит критических ошибок');
    
    Alert.alert(
      'Критическая ошибка',
      'Приложение работает нестабильно. Рекомендуется перезапуск.',
      [
        { text: 'Продолжить', style: 'cancel' },
        { text: 'Перезапустить', onPress: () => this.restartApp() }
      ]
    );
  }

  // Перезапуск приложения
  private restartApp() {
    // Здесь можно добавить логику перезапуска
    if (__DEV__) console.log('ErrorMonitor: Перезапуск приложения...');
  }

  // Логирование ошибки
  private logError(errorInfo: ErrorInfo) {
    const logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.component}: ${errorInfo.message}`;
    
    switch (errorInfo.severity) {
      case ErrorSeverity.LOW:
        if (__DEV__) console.log(logMessage);
        break;
      case ErrorSeverity.MEDIUM:
        if (__DEV__) console.warn(logMessage);
        break;
      case ErrorSeverity.HIGH:
        if (__DEV__) console.error(logMessage);
        break;
      case ErrorSeverity.CRITICAL:
        if (__DEV__) console.error(`🚨 ${logMessage}`);
        break;
    }
  }

  // Получить статистику ошибок
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      critical: this.errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      high: this.errors.filter(e => e.severity === ErrorSeverity.HIGH).length,
      medium: this.errors.filter(e => e.severity === ErrorSeverity.MEDIUM).length,
      low: this.errors.filter(e => e.severity === ErrorSeverity.LOW).length,
      recent: this.errors.filter(e => Date.now() - e.timestamp < 60000).length // Последняя минута
    };

    return stats;
  }

  // Очистить ошибки
  clearErrors() {
    this.errors = [];
    this.criticalErrorCount = 0;
  }

  // Получить последние ошибки
  getRecentErrors(count: number = 10) {
    return this.errors.slice(-count);
  }

  // Проверить стабильность приложения
  isAppStable(): boolean {
    const stats = this.getErrorStats();
    return stats.critical === 0 && stats.recent < 5;
  }
}

// Глобальный экземпляр монитора ошибок
export const errorMonitor = new ErrorMonitor();

// Утилиты для работы с ошибками
export const errorUtils = {
  // Создать ошибку с контекстом
  createError(message: string, component: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM): Error {
    const error = new Error(message);
    error.name = `${component}Error`;
    return error;
  },

  // Безопасное выполнение функции
  safeExecute<T>(fn: () => T, component: string, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      errorMonitor.addError(
        error instanceof Error ? error : new Error(String(error)),
        component,
        ErrorSeverity.MEDIUM
      );
      return fallback;
    }
  },

  // Безопасное выполнение асинхронной функции
  async safeExecuteAsync<T>(
    fn: () => Promise<T>, 
    component: string, 
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      errorMonitor.addError(
        error instanceof Error ? error : new Error(String(error)),
        component,
        ErrorSeverity.MEDIUM
      );
      return fallback;
    }
  },

  // Проверить критическую ошибку
  isCriticalError(error: Error): boolean {
    const criticalKeywords = [
      'critical',
      'fatal',
      'unrecoverable',
      'crash',
      'memory',
      'null pointer',
      'undefined'
    ];

    return criticalKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }
};

// Хук для использования монитора ошибок в компонентах
export const useErrorMonitor = () => {
  const addError = (error: Error, component: string, severity?: ErrorSeverity) => {
    errorMonitor.addError(error, component, severity || ErrorSeverity.MEDIUM);
  };

  const getStats = () => errorMonitor.getErrorStats();
  const isStable = () => errorMonitor.isAppStable();

  return { addError, getStats, isStable };
};

// Default export для Expo Router
export default errorMonitor;
