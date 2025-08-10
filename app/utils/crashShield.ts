// Runtime crash shield for AnonChat (no external deps)

interface CrashShieldConfig {
  dev: boolean;
}

interface RenderCounter {
  id: string;
  count: number;
  lastReset: number;
}

interface FPSMonitor {
  frames: number[];
  lastTime: number;
  onLowFps?: (fps: number) => void;
}

const renderCounters = new Map<string, RenderCounter>();
const fpsMonitor: FPSMonitor = {
  frames: [],
  lastTime: Date.now(),
};

let globalErrorHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

export const CrashShield = {
  init: (config: CrashShieldConfig) => {
    if (config.dev) {
      // Set global error handler
      if (typeof ErrorUtils !== 'undefined') {
        const handler = (error: Error, isFatal?: boolean) => {
          if (__DEV__) console.error('🔥 CrashShield caught error:', error.message, { isFatal });
          // Fallback to error boundary if available
          if (typeof global !== 'undefined' && (global as any).UIErrorBoundary) {
            (global as any).UIErrorBoundary.showError(error);
          }
        };
        globalErrorHandler = handler;
        ErrorUtils.setGlobalHandler(handler);
      }
      
      // Start FPS monitoring
      CrashShield.fpsMonitor.start();
    }
  },

  createRenderCounter: (id: string) => {
    return () => {
      const now = Date.now();
      const counter = renderCounters.get(id) || { id, count: 0, lastReset: now };
      
      // Reset counter every 2 seconds
      if (now - counter.lastReset > 2000) {
        counter.count = 0;
        counter.lastReset = now;
      }
      
      counter.count++;
      renderCounters.set(id, counter);
      
      // Warn if too many renders
      if (counter.count > 30) {
        if (__DEV__) console.warn(`⚠️ RenderCounter: ${id} rendered ${counter.count} times in 2s`);
      }
    };
  },

  fpsMonitor: {
    start: () => {
      const checkFPS = () => {
        const now = Date.now();
        fpsMonitor.frames.push(now);
        
        // Keep only last 30 frames
        if (fpsMonitor.frames.length > 30) {
          fpsMonitor.frames.shift();
        }
        
        // Calculate FPS
        if (fpsMonitor.frames.length >= 30) {
          const timeSpan = fpsMonitor.frames[fpsMonitor.frames.length - 1] - fpsMonitor.frames[0];
          const fps = Math.round((fpsMonitor.frames.length - 1) * 1000 / timeSpan);
          
          if (fps < 30 && fpsMonitor.onLowFps) {
            fpsMonitor.onLowFps(fps);
          }
        }
        
        requestAnimationFrame(checkFPS);
      };
      
      requestAnimationFrame(checkFPS);
    },

    onLowFps: (callback: (fps: number) => void) => {
      fpsMonitor.onLowFps = callback;
    },
  },

  createGate: (ms: number) => {
    let lastCall = 0;
    return (fn: () => void) => {
      const now = Date.now();
      if (now - lastCall >= ms) {
        lastCall = now;
        fn();
      }
    };
  },
};
