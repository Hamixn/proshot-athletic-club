import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import {
  registerItem,
  ScrollKind,
  startEngine,
  subscribeTick,
  wake,
} from '../../lib/motion/scrollEngine';
import { clamp } from '../../lib/motion/math';

export function useScrollItem(
  ref: React.RefObject<HTMLElement | null>,
  kind: ScrollKind
): void {
  useEffect(() => {
    if (!ref.current) return;
    return registerItem(ref.current, kind);
  }, [ref, kind]);
}

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Any element drifts vertically at its own speed without React re-renders.
 * speed = px of travel at the viewport edge (positive = moves up faster).
 */
export const Parallax: React.FC<ParallaxProps> = ({
  speed = 0,
  className = '',
  style,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollItem(ref, 'center');

  return (
    <div
      ref={ref}
      className={`px-layer ${className}`}
      style={{ '--speed': speed, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Architectural Scroll Scene. Descendants read --p (0..1) and --open (0..1) as the section enters the viewport,
 * with zero extra empty scroll runway below it.
 */
export const ScrollScene: React.FC<{
  heightVh?: number;
  className?: string;
  stickyClassName?: string;
  children: React.ReactNode;
}> = ({ className = '', stickyClassName = '', children }) => {
  const ref = useRef<HTMLElement>(null);
  useScrollItem(ref, 'scene');

  return (
    <section ref={ref} className={`scroll-scene ${className}`}>
      <div className={`scroll-scene__sticky ${stickyClassName}`}>{children}</div>
    </section>
  );
};

export interface SplitWordToken {
  t: string;
  accent?: boolean;
  br?: boolean;
}

/**
 * Word-level masked rise. Persian-safe: splits on whitespace only so cursive joining
 * and ZWNJ (نیم‌فاصله) remain 100% intact.
 */
export const SplitReveal: React.FC<{
  words: SplitWordToken[];
  fullText: string;
  className?: string;
  staggerMs?: number;
}> = ({ words, fullText, className = '', staggerMs = 70 }) => {
  return (
    <h1 className={className} aria-label={fullText}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="split-mask" aria-hidden="true">
            <span
              className={`split-word ${w.accent ? 'text-[#C9A96A]' : ''}`}
              style={{ animationDelay: `${i * staggerMs}ms` }}
            >
              {w.t}
            </span>
          </span>
          {w.br ? <br /> : ' '}
        </React.Fragment>
      ))}
    </h1>
  );
};

/**
 * Cursor-pull on CTAs, fine-pointer desktop only, writes --tx/--ty directly to DOM.
 */
export const Magnetic: React.FC<{
  strength?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ strength = 8, className = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width / 2, 1);
    const ny = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height / 2, 1);
    el.style.transform = `translate3d(${(nx * strength).toFixed(1)}px, ${(ny * strength).toFixed(1)}px, 0)`;
    el.style.transition = 'transform 0.1s ease-out';
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate3d(0, 0, 0)';
    el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`inline-flex ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Velocity-reactive marquee ribbon using the Web Animations API.
 * Accelerates when scrolling fast and reverses direction when scrolling up.
 */
export const VelocityMarquee: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof el.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const anim = el.animate(
      [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(-50%, 0, 0)' }],
      { duration: 30000, iterations: Infinity, easing: 'linear' }
    );

    let dir = 1;
    const unsub = subscribeTick((v) => {
      if (Math.abs(v) > 0.35) {
        dir = v >= 0 ? 1 : -1;
      }
      const boost = 1 + clamp(Math.abs(v) / 22, 0, 3.2);
      try {
        anim.updatePlaybackRate(dir * boost);
      } catch {
        // Fallback for browsers without updatePlaybackRate
      }
    });

    return () => {
      unsub();
      anim.cancel();
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className={`flex w-max items-center gap-8 sm:gap-12 whitespace-nowrap will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Root wrapper for LandingPage: starts the unified rAF scroll engine and desktop Lenis.
 */
export const MotionRoot: React.FC<{
  smooth?: boolean;
  children: React.ReactNode;
}> = ({ smooth = true, children }) => {
  useEffect(() => {
    const stopEngine = startEngine();

    const isDesktopFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (smooth && isDesktopFinePointer) {
      document.documentElement.classList.add('lenis');
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const onLenisScroll = () => wake();
      lenis.on('scroll', onLenisScroll);

      const rafLoop = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(rafLoop);
      };
      rafId = requestAnimationFrame(rafLoop);
    }

    // Safe anchor smooth scroll for #clubs, #disciplines, #portal, #contact, #top
    const onDocClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      if (!/^#[A-Za-z][\w-]*$/.test(href)) return;
      const section = document.querySelector(href) as HTMLElement | null;
      if (!section) return;
      e.preventDefault();
      if (lenis) {
        try {
          lenis.scrollTo(section, { offset: -76 });
        } catch {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    };

    document.addEventListener('click', onDocClick);

    return () => {
      document.removeEventListener('click', onDocClick);
      cancelAnimationFrame(rafId);
      if (lenis) {
        lenis.destroy();
        document.documentElement.classList.remove('lenis');
      }
      stopEngine();
    };
  }, [smooth]);

  return <>{children}</>;
};
