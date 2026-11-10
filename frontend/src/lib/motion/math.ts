export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 when element top reaches viewport bottom, 1 when element bottom leaves viewport top */
export const viewProgress = (top: number, height: number, vh: number) =>
  clamp((vh - top) / Math.max(vh + height, 1));

/** -1.25..+1.25. 0 when element centre == viewport centre (drives per-element parallax) */
export const centerOffset = (top: number, height: number, vh: number) =>
  clamp((top + height / 2 - vh / 2) / Math.max(vh / 2, 1), -1.25, 1.25);

/** 0 while element top is at/below viewport top, 1 once fully scrolled past (hero exit) */
export const exitProgress = (top: number, height: number) =>
  clamp(-top / Math.max(height, 1));

/** Pinned scene: 0 when scene top hits viewport top, 1 when scene bottom hits viewport bottom */
export const sceneProgress = (top: number, height: number, vh: number) =>
  clamp(-top / Math.max(height - vh, 1));
