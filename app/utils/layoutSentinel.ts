// Layout sentinel for AnonChat (DEV only)

interface BubbleReport {
  id: string;
  isMy: boolean;
  bubbleW: number;
  textW: number;
  metaW: number;
}

interface MetaHitReport {
  id: string;
  hit: boolean;
}

interface LayoutReport {
  deadZoneCount: number;
  metaOutOfBoundsCount: number;
  totalBubbles: number;
  avgDeadZone: number;
  timestamp: string;
}

const bubbleReports: BubbleReport[] = [];
const metaHitReports: MetaHitReport[] = [];
let deadZoneWarnings = 0;
let metaOutOfBoundsWarnings = 0;

export const LayoutSentinel = {
  reportBubble: (report: BubbleReport) => {
    if (!__DEV__) return;
    
    bubbleReports.push(report);
    
    const deadZone = report.bubbleW - report.metaW - report.textW;
    if (deadZone > 12) {
      deadZoneWarnings++;
      if (__DEV__) console.warn(`⚠️ LayoutSentinel: Dead zone ${deadZone}px for bubble ${report.id}`);
    }
  },

  reportMetaHit: (report: MetaHitReport) => {
    if (!__DEV__) return;
    
    metaHitReports.push(report);
    
    if (report.hit) {
      metaOutOfBoundsWarnings++;
      if (__DEV__) console.warn(`⚠️ LayoutSentinel: Meta out of bounds for ${report.id}`);
    }
  },

  dump: () => {
    if (!__DEV__) return;
    
    const totalBubbles = bubbleReports.length;
    const avgDeadZone = totalBubbles > 0 
      ? bubbleReports.reduce((sum, r) => sum + (r.bubbleW - r.metaW - r.textW), 0) / totalBubbles
      : 0;

    const report: LayoutReport = {
      deadZoneCount: deadZoneWarnings,
      metaOutOfBoundsCount: metaOutOfBoundsWarnings,
      totalBubbles,
      avgDeadZone: Math.round(avgDeadZone),
      timestamp: new Date().toISOString(),
    };

    // Try to write to file system, fallback to console
    try {
      if (typeof global !== 'undefined' && (global as any).RNFS) {
        const RNFS = (global as any).RNFS;
        RNFS.writeFile(
          RNFS.DocumentDirectoryPath + '/layout-report.json',
          JSON.stringify(report, null, 2),
          'utf8'
        );
      } else {
        if (__DEV__) console.log('📊 LayoutSentinel Report:', report);
      }
    } catch (error) {
      if (__DEV__) console.log('📊 LayoutSentinel Report:', report);
    }
  },

  reset: () => {
    bubbleReports.length = 0;
    metaHitReports.length = 0;
    deadZoneWarnings = 0;
    metaOutOfBoundsWarnings = 0;
  },
};
