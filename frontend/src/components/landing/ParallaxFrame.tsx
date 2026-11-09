import React, { useEffect, useRef, useState } from 'react';

interface ParallaxFrameProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  imgClassName?: string;
  enableTilt?: boolean;
  children?: React.ReactNode;
}

export const ParallaxFrame: React.FC<ParallaxFrameProps> = ({
  src,
  alt,
  speed = 0.22,
  className = '',
  imgClassName = '',
  enableTilt = true,
  children,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovered: false });

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let rafId = 0;

    const updateParallax = () => {
      if (!frame || !img) return;
      const rect = frame.getBoundingClientRect();
      const vh = Math.max(window.innerHeight, 1);

      // Progress from -1 (below screen) to +1 (above screen)
      const centerOffset = (rect.top + rect.height * 0.5 - vh * 0.5) / (vh * 0.5);
      const clamped = Math.max(-1.25, Math.min(1.25, centerOffset));
      const translateY = clamped * -speed * 130;

      img.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(1.22)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, src]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
    setTilt({
      rx: (0.5 - ny) * 7,
      ry: (nx - 0.5) * 7,
      gx: nx * 100,
      gy: ny * 100,
      hovered: true,
    });
  };

  const handlePointerLeave = () => {
    if (!enableTilt) return;
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hovered: false });
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        enableTilt
          ? {
              transform: `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
              transition: tilt.hovered
                ? 'transform 0.12s ease-out'
                : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            }
          : undefined
      }
      className={`relative overflow-hidden select-none ${className}`}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover will-change-transform transition-opacity duration-500 ${imgClassName}`}
        style={{ transform: 'translate3d(0, 0px, 0) scale(1.22)' }}
      />

      {/* Interactive Pointer Spotlight Glare */}
      {enableTilt && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: tilt.hovered ? 1 : 0,
            background: `radial-gradient(420px circle at ${tilt.gx}% ${tilt.gy}%, rgba(201,169,106,0.22), transparent 65%)`,
          }}
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
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
