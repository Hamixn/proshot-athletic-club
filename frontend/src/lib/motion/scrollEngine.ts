import { centerOffset, clamp, exitProgress, lerp, sceneProgress, viewProgress } from './math';

export type ScrollKind = 'center' | 'view' | 'exit' | 'scene';

interface Item {
  el: HTMLElement;
  kind: ScrollKind;
  visible: boolean;
}

const items = new Set<Item>();
const subscribers = new Set<(velocity: number) => void>();

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let raf = 0;
let started = false;
let isLiteTouch = false;
let lastY = 0;
let velocity = 0;
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
let io: IntersectionObserver | null = null;

function frame() {
  raf = 0;
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const vh = Math.max(window.innerHeight, 1);
  const y = window.scrollY || root.scrollTop || 0;
  velocity = lerp(velocity, y - lastY, 0.22);
  lastY = y;

  // On touch/mobile devices, skip per-frame getBoundingClientRect() layout reads on scroll
  // so native mobile scrolling stays locked at 60/120fps with zero jank.
  if (!isLiteTouch) {
    // READ phase (visible items only)
    const reads: Array<[Item, DOMRect]> = [];
    items.forEach((it) => {
      if (it.visible) {
        reads.push([it, it.el.getBoundingClientRect()]);
      }
    });

    // WRITE phase
    for (const [it, r] of reads) {
      switch (it.kind) {
        case 'center':
          it.el.style.setProperty('--py', centerOffset(r.top, r.height, vh).toFixed(4));
          break;
        case 'view':
          it.el.style.setProperty('--p', viewProgress(r.top, r.height, vh).toFixed(4));
          break;
        case 'exit':
          it.el.style.setProperty('--p', exitProgress(r.top, r.height).toFixed(4));
          break;
        case 'scene':
          it.el.style.setProperty('--p', sceneProgress(r.top, r.height, vh).toFixed(4));
          break;
      }
    }
  }

  const max = Math.max(root.scrollHeight - vh, 1);
  root.style.setProperty('--page-p', clamp(y / max).toFixed(4));

  if (!isLiteTouch) {
    root.style.setProperty('--scroll-v', velocity.toFixed(2));
    ptr.x = lerp(ptr.x, ptr.tx, 0.08);
    ptr.y = lerp(ptr.y, ptr.ty, 0.08);
    root.style.setProperty('--mx', ptr.x.toFixed(4));
    root.style.setProperty('--my', ptr.y.toFixed(4));
    subscribers.forEach((cb) => cb(velocity));
  }

  const settled = isLiteTouch
    ? true
    : Math.abs(velocity) < 0.05 &&
      Math.abs(ptr.tx - ptr.x) < 0.001 &&
      Math.abs(ptr.ty - ptr.y) < 0.001;

  if (!settled) {
    raf = requestAnimationFrame(frame);
  }
}

export const wake = () => {
  if (!raf && started) {
    raf = requestAnimationFrame(frame);
  }
};

export function startEngine(): () => void {
  if (typeof window === 'undefined' || started || reduced()) return () => {};
  started = true;
  const root = document.documentElement;
  lastY = window.scrollY || 0;

  const lowCpu =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  isLiteTouch = !finePointer() || lowCpu;
  if (isLiteTouch) {
    root.dataset.motion = 'lite';
  } else {
    delete root.dataset.motion;
  }

  if (!isLiteTouch) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          items.forEach((it) => {
            if (it.el === e.target) {
              it.visible = e.isIntersecting;
            }
          });
        });
        wake();
      },
      { rootMargin: '25% 0px 25% 0px' }
    );

    items.forEach((it) => io?.observe(it.el));
  }

  const onPointer = (e: PointerEvent) => {
    if (isLiteTouch) return;
    ptr.tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    ptr.ty = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    wake();
  };

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake, { passive: true });
  if (!isLiteTouch) {
    window.addEventListener('pointermove', onPointer, { passive: true });
  }
  wake();

  return () => {
    started = false;
    cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    window.removeEventListener('scroll', wake);
    window.removeEventListener('resize', wake);
    window.removeEventListener('pointermove', onPointer);
    ['--page-p', '--scroll-v', '--mx', '--my'].forEach((v) => root.style.removeProperty(v));
  };
}

export function registerItem(el: HTMLElement, kind: ScrollKind): () => void {
  const it: Item = { el, kind, visible: true };
  items.add(it);
  if (started && io) {
    io.observe(el);
    wake();
  }
  return () => {
    items.delete(it);
    if (io) io.unobserve(el);
  };
}

export const subscribeTick = (cb: (v: number) => void): (() => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};
