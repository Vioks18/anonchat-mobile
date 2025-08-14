export const ENABLE_GRAVATAR = false;      // can be toggled later
export const AVATAR_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const PREFETCH_FIRST_N = 24;        // number of list avatars to prefetch

// Time in ms to wait for image load before degrading to initials
export const AVATAR_LOAD_TIMEOUT_MS = 1200;

// How many consecutive failures before we stop automatic retries for a user (still render initials)
export const AVATAR_MAX_FAILS = 3;

// Retry triggers
export const RETRY_ON_APP_FOCUS = true;     // bump retry when app becomes active
export const RETRY_ON_PULL_REFRESH = true;  // bump retry when user pulls to refresh

// Placeholder styling
export const AVATAR_PLACEHOLDER_SCALE = 0.96; // slightly inset inside circle
export const AVATAR_PLACEHOLDER_PULSE_MIN = 0.75;
export const AVATAR_PLACEHOLDER_PULSE_MAX = 1.0;
export const AVATAR_PLACEHOLDER_PULSE_MS = 900;

// Theme transition
export const THEME_FADE_MS = 120;

// List update batching
export const LIST_LAYOUT_ANIM_MS = 120;
export const LIST_BIG_DIFF_DISABLE_ANIM_THRESHOLD = 120; // if changed items > threshold, skip LayoutAnimation

// Progressive image
export const AVATAR_THUMB_MAX_BYTES = 1200; // inline base64 threshold
export const AVATAR_THUMB_BLUR_RADIUS = 12; // soft blur for tiny preview

// Unread highlight
export const UNREAD_HIGHLIGHT_MS = 300;      // duration
export const UNREAD_HIGHLIGHT_COLOR_ALPHA = 0.08; // overlay alpha

// Incremental mount
export const LIST_INITIAL_RENDER = 18;
export const LIST_INCREMENT_STEP = 24;
export const LIST_INCREMENT_EVERY_MS = 60;
export const BATCH_HIGHLIGHT_DEBOUNCE_MS = 200; // group unread changes
