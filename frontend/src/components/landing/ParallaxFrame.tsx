import React, { useEffect, useRef, useState } from 'react';
import { useScrollItem } from '../motion/Motion';

interface ParallaxFrameProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  imgClassName?: string;
  enableTilt?: boolean;
  curtainReveal?: boolean;
  children?: React.ReactNode;
}

export const ParallaxFrame: React.FC<ParallaxFrameProps> = ({
  src,
  alt,
  speed = 0.22,
  className = '',
  imgClassName = '',
  enableTilt = true,
  curtainReveal = false,
  children,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  useScrollItem(frameRef, 'center');

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!enableTilt || !el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (document.documentElement.dataset.motion === 'lite') return;

    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
    const rx = (0.5 - ny) * 6.5;
    const ry = (nx - 0.5) * 6.5;

    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(nx * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(ny * 100).toFixed(1)}%`);
    el.style.setProperty('--glare-o', '1');
    el.style.transition = 'transform 0.12s ease-out';
  };

  const handlePointerLeave = () => {
    const el = frameRef.current;
    if (!enableTilt || !el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare-o', '0');
    el.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          '--speed': speed,
          '--rx': '0deg',
          '--ry': '0deg',
          '--gx': '50%',
          '--gy': '50%',
          '--glare-o': 0,
        } as React.CSSProperties
      }
      className={`parallax-frame relative overflow-hidden select-none ${
        enableTilt ? 'parallax-frame--tilt' : ''
      } ${curtainReveal ? 'curtain-reveal' : ''} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`parallax-frame__img absolute inset-0 w-full h-full object-cover will-change-transform transition-opacity duration-500 ${imgClassName}`}
      />

      {/* Interactive Pointer Spotlight Glare */}
      {enableTilt && (
        <div
          className="parallax-frame__glare absolute inset-0 pointer-events-none transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
};

export const RevealBlock: React.FC<{
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}> = ({ children, delayMs = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`reveal-on-scroll ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
