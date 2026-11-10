import React, { useEffect, useRef } from 'react';

interface AmbientShaderCanvasProps {
  tone?: 'brass' | 'silver';
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform float u_scroll;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform vec3 u_accent;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 ptr = (u_pointer - 0.5) * vec2(aspect, 1.0);

    // Dynamic scroll-shifted architectural light beams
    float scrollShift = u_scroll * 0.35;
    vec2 center1 = vec2(0.22 + sin(u_time * 0.35) * 0.16, 0.15 + cos(u_time * 0.25) * 0.12 - scrollShift) + ptr * 0.28;
    float spot1 = exp(-2.2 * length(p - center1));

    // Diagonal volumetric shaft
    float diag = (p.x * 0.65 + p.y * 0.75) - sin(u_time * 0.22 + u_scroll * 1.4) * 0.25 - ptr.x * 0.18;
    float beam2 = exp(-6.5 * abs(diag));

    // Secondary rim glow
    vec2 center3 = vec2(-0.45 + cos(u_time * 0.28) * 0.12, -0.22 + scrollShift * 0.6);
    float spot3 = exp(-2.8 * length(p - center3));

    vec3 col = u_accent * (spot1 * 0.34 + beam2 * 0.18 + spot3 * 0.16);

    // Subtle analog film grain
    float grain = (hash(uv * u_resolution + fract(u_time)) - 0.5) * 0.025;
    col += grain;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const AmbientShaderCanvas: React.FC<AmbientShaderCanvasProps> = ({
  tone = 'brass',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef(tone);
  toneRef.current = tone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uScroll = gl.getUniformLocation(program, 'u_scroll');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uPtr = gl.getUniformLocation(program, 'u_pointer');
    const uAccent = gl.getUniformLocation(program, 'u_accent');

    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let scrollNorm = 0;
    let targetScroll = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX / Math.max(window.innerWidth, 1);
      targetY = 1.0 - e.clientY / Math.max(window.innerHeight, 1);
    };

    const onScroll = () => {
      targetScroll = (window.scrollY || 0) / Math.max(window.innerHeight, 600);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let isVisible = true;
    const start = performance.now();

    const render = (now: number) => {
      rafId = 0;
      if (!document.hidden && isVisible) {
        const elapsed = reducedMotion ? 0 : (now - start) * 0.001;
        pointerX += (targetX - pointerX) * 0.06;
        pointerY += (targetY - pointerY) * 0.06;
        scrollNorm += (targetScroll - scrollNorm) * 0.08;

        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uScroll, scrollNorm);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uPtr, pointerX, pointerY);

        if (toneRef.current === 'brass') {
          gl.uniform3f(uAccent, 0.82, 0.68, 0.42);
        } else {
          gl.uniform3f(uAccent, 0.72, 0.75, 0.80);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      if (!reducedMotion && isVisible) {
        rafId = requestAnimationFrame(render);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
          if (isVisible && !rafId && !reducedMotion) {
            rafId = requestAnimationFrame(render);
          }
        });
      },
      { rootMargin: '100px 0px 100px 0px' }
    );
    io.observe(canvas);

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
