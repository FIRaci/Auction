import React, { useEffect, useRef } from 'react';

const HUBS = [
  { name: 'Geneva', lat: 46.2, lon: 6.14 },
  { name: 'Dubai', lat: 25.2, lon: 55.27 },
  { name: 'Hà Nội', lat: 21.02, lon: 105.83 },
  { name: 'Tokyo', lat: 35.67, lon: 139.65 },
  { name: 'Sydney', lat: -33.87, lon: 151.21 },
  { name: 'San Francisco', lat: 37.77, lon: -122.42 },
  { name: 'New York', lat: 40.71, lon: -74.0 },
  { name: 'São Paulo', lat: -23.55, lon: -46.63 },
];

const ARCS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
  [6, 0],
  [6, 7],
  [0, 2],
];

const ARC_SEGMENTS = 28;
const LATITUDE_PARALLELS = [-30, 0, 30];
const PARALLEL_SEGMENTS = 72;
const DOT_FILL_BUCKETS = [
  'rgba(100, 116, 139, 0.22)',
  'rgba(96, 165, 250, 0.30)',
  'rgba(129, 140, 248, 0.36)',
];

function degToRad(d) {
  return (d * Math.PI) / 180;
}

/**
 * Convert geographic latitude and longitude into a 3D unit vector on the sphere.
 */
function latLonToUnitVector(lat, lon) {
  const phi = degToRad(90 - lat);
  const theta = degToRad(lon);
  return {
    ux: Math.sin(phi) * Math.cos(theta),
    uy: Math.cos(phi),
    uz: Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * Precompute 3D spherical great-circle SLERP samples raised smoothly above the globe.
 */
function buildSlerpArc(unitA, unitB) {
  const dot = Math.max(-1, Math.min(1, unitA.ux * unitB.ux + unitA.uy * unitB.uy + unitA.uz * unitB.uz));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  const points = [];

  for (let i = 0; i <= ARC_SEGMENTS; i += 1) {
    const t = i / ARC_SEGMENTS;
    let kx;
    let ky;
    let kz;

    if (sinOmega < 1e-4) {
      kx = unitA.ux * (1 - t) + unitB.ux * t;
      ky = unitA.uy * (1 - t) + unitB.uy * t;
      kz = unitA.uz * (1 - t) + unitB.uz * t;
      const invLen = 1 / (Math.hypot(kx, ky, kz) || 1);
      kx *= invLen;
      ky *= invLen;
      kz *= invLen;
    } else {
      const kA = Math.sin((1 - t) * omega) / sinOmega;
      const kB = Math.sin(t * omega) / sinOmega;
      kx = kA * unitA.ux + kB * unitB.ux;
      ky = kA * unitA.uy + kB * unitB.uy;
      kz = kA * unitA.uz + kB * unitB.uz;
    }

    const altitude = 1 + Math.sin(Math.PI * t) * 0.14;
    points.push({
      ux: kx * altitude,
      uy: ky * altitude,
      uz: kz * altitude,
      t,
    });
  }

  return points;
}

/**
 * Precompute 3D unit vectors for subtle latitude parallels.
 */
function buildLatitudeRings() {
  return LATITUDE_PARALLELS.map((lat) => {
    const ring = [];
    for (let i = 0; i <= PARALLEL_SEGMENTS; i += 1) {
      const lon = -180 + (i / PARALLEL_SEGMENTS) * 360;
      ring.push(latLonToUnitVector(lat, lon));
    }
    return ring;
  });
}

const HUB_VECTORS = HUBS.map((h) => ({
  ...h,
  ...latLonToUnitVector(h.lat, h.lon),
}));

const PRECOMPUTED_ARCS = ARCS.map(([fromIdx, toIdx], idx) => ({
  fromIdx,
  toIdx,
  phaseOffset: idx * 0.19,
  points: buildSlerpArc(HUB_VECTORS[fromIdx], HUB_VECTORS[toIdx]),
}));

const LATITUDE_RINGS = buildLatitudeRings();

/**
 * Interactive dotted 3D globe canvas inspired by Serko.ai's hero WebGL globe.
 * Renders Fibonacci sphere lattice dots, latitude parallels, 3D SLERP great-circle arcs,
 * and luminous auction hub beacons with strict front-hemisphere visibility.
 */
export function SerkoGlobeCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let animId = null;
    let isInView = true;
    let isTabVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rotation = 0.65;
    let lastTime = performance.now();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dotCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 160 : 300;
    const dots = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < dotCount; i += 1) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      dots.push({
        ux: Math.cos(theta) * r,
        uy: y,
        uz: Math.sin(theta) * r,
        bucket: i % DOT_FILL_BUCKETS.length,
        size: i % 5 === 0 ? 1.55 : 1.15,
      });
    }

    const bucketArrays = DOT_FILL_BUCKETS.map(() => []);

    const project = (ux, uy, uz, cx, cy, radius, sinRot, cosRot, sinTilt, cosTilt) => {
      const rx = ux * cosRot - uz * sinRot;
      const rz = ux * sinRot + uz * cosRot;
      const ry = uy * cosTilt - rz * sinTilt;
      const fz = uy * sinTilt + rz * cosTilt;
      return {
        sx: cx + rx * radius,
        sy: cy - ry * radius,
        z: fz,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const renderFrame = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!prefersReducedMotion) {
        rotation += dt * 0.14;
      }

      if (width > 0 && height > 0) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const cx = width * 0.5;
        const cy = height * 0.62;
        const radius = Math.min(width * 0.34, height * 0.66, 330);

        const tilt = -0.24;
        const sinRot = Math.sin(rotation);
        const cosRot = Math.cos(rotation);
        const sinTilt = Math.sin(tilt);
        const cosTilt = Math.cos(tilt);

        // Subtle atmospheric horizon halo & sphere limb outline
        const halo = ctx.createRadialGradient(cx, cy, radius * 0.18, cx, cy, radius * 1.12);
        halo.addColorStop(0, 'rgba(139, 179, 255, 0.15)');
        halo.addColorStop(0.65, 'rgba(139, 179, 255, 0.05)');
        halo.addColorStop(1, 'rgba(139, 179, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Latitude parallels (-30°, 0°, 30°) on the front hemisphere
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
        ctx.lineWidth = 0.85;
        for (let rIdx = 0; rIdx < LATITUDE_RINGS.length; rIdx += 1) {
          const ring = LATITUDE_RINGS[rIdx];
          let drawing = false;
          ctx.beginPath();
          for (let pIdx = 0; pIdx < ring.length; pIdx += 1) {
            const pt = ring[pIdx];
            const p = project(pt.ux, pt.uy, pt.uz, cx, cy, radius, sinRot, cosRot, sinTilt, cosTilt);
            if (p.z > 0.02) {
              if (!drawing) {
                ctx.moveTo(p.sx, p.sy);
                drawing = true;
              } else {
                ctx.lineTo(p.sx, p.sy);
              }
            } else {
              drawing = false;
            }
          }
          ctx.stroke();
        }

        // Batch Fibonacci lattice dots by color bucket
        for (let b = 0; b < bucketArrays.length; b += 1) {
          bucketArrays[b].length = 0;
        }
        for (let i = 0; i < dots.length; i += 1) {
          const dot = dots[i];
          const p = project(dot.ux, dot.uy, dot.uz, cx, cy, radius, sinRot, cosRot, sinTilt, cosTilt);
          if (p.z > -0.1) {
            bucketArrays[dot.bucket].push({
              sx: p.sx,
              sy: p.sy,
              size: dot.size * (0.7 + (p.z + 0.1) * 0.35),
            });
          }
        }
        for (let b = 0; b < bucketArrays.length; b += 1) {
          const bucket = bucketArrays[b];
          if (bucket.length === 0) continue;
          ctx.fillStyle = DOT_FILL_BUCKETS[b];
          ctx.beginPath();
          for (let j = 0; j < bucket.length; j += 1) {
            const item = bucket[j];
            ctx.moveTo(item.sx + item.size, item.sy);
            ctx.arc(item.sx, item.sy, item.size, 0, Math.PI * 2);
          }
          ctx.fill();
        }

        // Project all 8 hubs cleanly
        const projectedHubs = HUB_VECTORS.map((hub) => ({
          ...hub,
          ...project(hub.ux, hub.uy, hub.uz, cx, cy, radius, sinRot, cosRot, sinTilt, cosTilt),
        }));

        // Render 3D SLERP arcs ONLY when BOTH endpoints are strictly on the front hemisphere
        const timeSec = now * 0.00045;
        for (let aIdx = 0; aIdx < PRECOMPUTED_ARCS.length; aIdx += 1) {
          const arc = PRECOMPUTED_ARCS[aIdx];
          const hubA = projectedHubs[arc.fromIdx];
          const hubB = projectedHubs[arc.toIdx];

          if (hubA.z <= 0.08 || hubB.z <= 0.08) continue;

          const arcAlpha = Math.min(1, (hubA.z - 0.08) * 3.2, (hubB.z - 0.08) * 3.2);
          const projectedArcPoints = [];

          for (let pIdx = 0; pIdx < arc.points.length; pIdx += 1) {
            const sp = arc.points[pIdx];
            const proj = project(sp.ux, sp.uy, sp.uz, cx, cy, radius, sinRot, cosRot, sinTilt, cosTilt);
            projectedArcPoints.push({ ...proj, t: sp.t });
          }

          // Base arc spline
          const firstPt = projectedArcPoints[0];
          const lastPt = projectedArcPoints[projectedArcPoints.length - 1];
          const arcGrad = ctx.createLinearGradient(firstPt.sx, firstPt.sy, lastPt.sx, lastPt.sy);
          arcGrad.addColorStop(0, `rgba(249, 134, 96, ${0.42 * arcAlpha})`);
          arcGrad.addColorStop(0.5, `rgba(222, 108, 179, ${0.38 * arcAlpha})`);
          arcGrad.addColorStop(1, `rgba(59, 146, 255, ${0.46 * arcAlpha})`);

          ctx.beginPath();
          let started = false;
          for (let pIdx = 0; pIdx < projectedArcPoints.length; pIdx += 1) {
            const pt = projectedArcPoints[pIdx];
            if (pt.z <= 0.0) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(pt.sx, pt.sy);
              started = true;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          }
          ctx.strokeStyle = arcGrad;
          ctx.lineWidth = 1.35;
          ctx.stroke();

          // Luminous comet pulse & destination arrival wave
          const pulseT = (timeSec + arc.phaseOffset) % 1;
          const tailT = Math.max(0, pulseT - 0.12);
          const tailPoints = projectedArcPoints.filter(
            (pt) => pt.z > 0.02 && pt.t >= tailT && pt.t <= pulseT
          );

          if (tailPoints.length >= 2) {
            const tStart = tailPoints[0];
            const tEnd = tailPoints[tailPoints.length - 1];
            const cometGrad = ctx.createLinearGradient(tStart.sx, tStart.sy, tEnd.sx, tEnd.sy);
            cometGrad.addColorStop(0, 'rgba(59, 146, 255, 0)');
            cometGrad.addColorStop(0.65, `rgba(129, 140, 248, ${0.75 * arcAlpha})`);
            cometGrad.addColorStop(1, `rgba(59, 146, 255, ${0.95 * arcAlpha})`);

            ctx.beginPath();
            ctx.moveTo(tStart.sx, tStart.sy);
            for (let k = 1; k < tailPoints.length; k += 1) {
              ctx.lineTo(tailPoints[k].sx, tailPoints[k].sy);
            }
            ctx.strokeStyle = cometGrad;
            ctx.lineWidth = 2.4;
            ctx.stroke();

            // Glowing head dot
            ctx.beginPath();
            ctx.arc(tEnd.sx, tEnd.sy, 2.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(96, 165, 250, ${0.95 * arcAlpha})`;
            ctx.fill();
          }

          if (pulseT > 0.85) {
            const arriveProgress = (pulseT - 0.85) / 0.15;
            const ringRadius = 4 + arriveProgress * 9;
            const ringAlpha = (1 - arriveProgress) * 0.55 * arcAlpha;
            ctx.beginPath();
            ctx.arc(hubB.sx, hubB.sy, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 146, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.15;
            ctx.stroke();
          }
        }

        // Render soft luminous hub beacons strictly on front hemisphere (no harsh dark circles)
        for (let i = 0; i < projectedHubs.length; i += 1) {
          const hub = projectedHubs[i];
          if (hub.z <= 0.08) continue;

          const hubAlpha = Math.min(1, (hub.z - 0.08) * 3.2);
          const isCoral = i % 2 === 0;
          const haloColor = isCoral
            ? `rgba(249, 134, 96, ${0.24 * hubAlpha})`
            : `rgba(59, 146, 255, ${0.26 * hubAlpha})`;
          const ringColor = isCoral
            ? `rgba(249, 134, 96, ${0.42 * hubAlpha})`
            : `rgba(59, 146, 255, ${0.46 * hubAlpha})`;
          const coreColor = isCoral
            ? `rgba(244, 114, 182, ${0.92 * hubAlpha})`
            : `rgba(59, 130, 246, ${0.95 * hubAlpha})`;

          // Outer ambient bloom
          ctx.beginPath();
          ctx.arc(hub.sx, hub.sy, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = haloColor;
          ctx.fill();

          // Delicate halo ring
          ctx.beginPath();
          ctx.arc(hub.sx, hub.sy, 4.6, 0, Math.PI * 2);
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Luminous inner jewel core
          ctx.beginPath();
          ctx.arc(hub.sx, hub.sy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = coreColor;
          ctx.fill();
        }
      }

      if (isInView && isTabVisible && !prefersReducedMotion) {
        animId = requestAnimationFrame(renderFrame);
      } else {
        animId = null;
      }
    };

    const startLoop = () => {
      if (animId === null && isInView && isTabVisible) {
        lastTime = performance.now();
        animId = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInView = entry.isIntersecting;
        if (isInView && isTabVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isInView) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      renderFrame(performance.now());
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
