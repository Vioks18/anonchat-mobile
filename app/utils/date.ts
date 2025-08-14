import dayjs from 'dayjs';

export const fmtTime = (ts?: number) => ts ? dayjs(ts).format('HH:mm') : '';
export const fmtShort = (ts?: number) => ts ? dayjs(ts).format('D MMM') : '';
