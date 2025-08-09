
export interface GestureEvent {
  t: number;
  type: 'press' | 'doubleTap' | 'longPress' | 'scrollBegin' | 'scrollEnd' | 'keyboardShow' | 'openReaction' | 'closeReaction';
  msgId?: string;
  x?: number;
  y?: number;
}

class GestureProbeClass {
  private buffer: GestureEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;

  log(event: GestureEvent) {
    if (!__DEV__) return;

    this.buffer.push(event);
    
    // Ограничиваем размер буфера
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      this.buffer = this.buffer.slice(-this.MAX_BUFFER_SIZE);
    }

    // Автоматический сброс при достижении лимита
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      this.dump();
    }
  }

  async dump(): Promise<string> {
    if (!__DEV__) return '[]';

    const data = JSON.stringify(this.buffer, null, 2);
    this.buffer = []; // Очищаем буфер после сброса

    try {
      // Пытаемся использовать Expo FileSystem если доступен
      const FileSystem = await import('expo-file-system');
      const reportPath = `${FileSystem.default.documentDirectory}gesture-report.json`;
      await FileSystem.default.writeAsStringAsync(reportPath, data);
      if (__DEV__) console.log('[GestureProbe] Report saved to:', reportPath);
    } catch (error) {
      // Fallback: сохраняем в globalThis
      (globalThis as any).GESTURE_LOG = data;
      if (__DEV__) console.log('[GestureProbe] Report saved to globalThis.GESTURE_LOG');
    }

    return data;
  }

  getBuffer(): GestureEvent[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

const gestureProbeInstance = new GestureProbeClass();

// Экспортируем методы для удобства
export const GestureProbe = {
  log: (event: GestureEvent) => gestureProbeInstance.log(event),
  dump: () => gestureProbeInstance.dump(),
  getBuffer: () => gestureProbeInstance.getBuffer(),
  clear: () => gestureProbeInstance.clear(),
};
