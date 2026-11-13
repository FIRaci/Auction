import React, { useEffect, useRef } from 'react';

const HUBS = [
  { name: 'Geneva', lat: 46.2, lon: 6.14 },
  { name: 'Paris', lat: 48.85, lon: 2.35 },
  { name: 'New York', lat: 40.71, lon: -74.0 },
  { name: 'Tokyo', lat: 35.67, lon: 139.65 },
  { name: 'Hà Nội', lat: 21.02, lon: 105.83 },
  { name: 'TP.HCM', lat: 10.82, lon: 106.63 },
];

const ARCS = [
  [0, 4],
  [1, 5],
  [2, 0],
  [3, 4],
  [4, 5],
];

function degToRad(d) {
  return (d * Math.PI) / 180;
}

/**
 * Interactive dotted 3D globe canvas inspired by Serko.ai's hero WebGL globe.
 * Renders Fibonacci sphere lattice dots + luminous live auction hub arcs.
 */
export function SerkoGlobeCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animId = null;
    let rotation = 0.85;
    let isInView = true;
    let isTabVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let width = 0;
    let height = 0;

    // Precompute Fibonacci sphere dots (adaptive for mobile vs desktop)
    const dotCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 160 : 300;
    const dots = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < dotCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotCount);
      dots.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      });
    }

    const tilt = -0.24;
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    const DOT_FILL_BUCKETS = [
      'rgba(0, 28, 56, 0.14)',
      'rgba(0, 28, 56, 0.26)',
      'rgba(0, 28, 56, 0.38)',
    ];

    function project(lat, lon, rot, radius, cx, cy) {
      const phi = degToRad(90 - lat);
      const theta = degToRad(lon) + rot;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      const yTilt = y * cosTilt - z * sinTilt;
      const zTilt = y * sinTilt + z * cosTilt;

      return {
        sx: cx + x * radius,
        sy: cy - yTilt * radius,
        z: zTilt,
      };
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let tick = 0;
    function render() {
      if (!isInView || !isTabVisible) {
        animId = null;
        return;
      }

      const w = width || canvas.clientWidth;
      const h = height || canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const radius = Math.min(w * 0.44, h * 0.62, 340);
      const cx = w / 2;
      const cy = h * 0.58;
      rotation += 0.0022;
      tick += 0.015;

      const cosRot = Math.cos(rotation);
      const sinRot = Math.sin(rotation);

      // Subtle atmospheric halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.15);
      halo.addColorStop(0, 'rgba(27, 152, 242, 0.06)');
      halo.addColorStop(0.6, 'rgba(207, 105, 224, 0.04)');
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Batch sphere dots into 3 opacity buckets (3 fill calls instead of 300+)
      const bucket0 = [];
      const bucket1 = [];
      const bucket2 = [];

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const rx = d.x * cosRot - d.z * sinRot;
        const rz = d.x * sinRot + d.z * cosRot;
        const ry = d.y * cosTilt - rz * sinTilt;
        const fz = d.y * sinTilt + rz * cosTilt;

        if (fz > -0.25) {
          const sx = cx + rx * radius;
          const sy = cy - ry * radius;
          if (fz > 0.45) {
            bucket2.push(sx, sy);
          } else if (fz > 0.08) {
            bucket1.push(sx, sy);
          } else {
            bucket0.push(sx, sy);
          }
        }
      }

      const buckets = [bucket0, bucket1, bucket2];
      const radii = [1.0, 1.25, 1.5];
      for (let b = 0; b < 3; b++) {
        const pts = buckets[b];
        if (pts.length === 0) continue;
        const r = radii[b];
        ctx.fillStyle = DOT_FILL_BUCKETS[b];
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 2) {
          const px = pts[k];
          const py = pts[k + 1];
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Render auction hub arcs
      const projectedHubs = HUBS.map((hub) => ({
        ...hub,
        ...project(hub.lat, hub.lon, rotation, radius, cx, cy),
      }));

      for (let idx = 0; idx < ARCS.length; idx++) {
        const [fromIdx, toIdx] = ARCS[idx];
        const a = projectedHubs[fromIdx];
        const b = projectedHubs[toIdx];
        if (a.z < -0.1 && b.z < -0.1) continue;

        const midX = (a.sx + b.sx) / 2;
        const midY = (a.sy + b.sy) / 2 - radius * 0.26;

        const grad = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy);
        grad.addColorStop(0, 'rgba(27, 152, 242, 0.45)');
        grad.addColorStop(0.5, 'rgba(245, 98, 147, 0.55)');
        grad.addColorStop(1, 'rgba(255, 140, 81, 0.45)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.quadraticCurveTo(midX, midY, b.sx, b.sy);
        ctx.stroke();

        // Moving pulse dot along curve
        const t = (tick + idx * 0.24) % 1;
        const inv = 1 - t;
        const px = inv * inv * a.sx + 2 * inv * t * midX + t * t * b.sx;
        const py = inv * inv * a.sy + 2 * inv * t * midY + t * t * b.sy;
        ctx.fillStyle = '#1b98f2';
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render visible hubs
      for (let i = 0; i < projectedHubs.length; i++) {
        const hub = projectedHubs[i];
        if (hub.z > 0.05) {
          ctx.fillStyle = '#17181c';
          ctx.beginPath();
          ctx.arc(hub.sx, hub.sy, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(27, 158, 82, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hub.sx, hub.sy, 6.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    }

    function ensureAnimating() {
      if (isInView && isTabVisible && animId === null) {
        animId = requestAnimationFrame(render);
      }
    }

    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInView = entry.isIntersecting;
          if (isInView) {
            ensureAnimating();
          } else if (animId !== null) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(canvas);
    }

    function handleVisibility() {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        ensureAnimating();
      } else if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    ensureAnimating();

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}

export default SerkoGlobeCanvas;

