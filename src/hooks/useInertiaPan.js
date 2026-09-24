import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for high-performance 2D canvas inertial panning (trackpad & mouse wheel).
 *
 * Physics model:
 * - Direct delta accumulation onto targetX / targetY.
 * - Normalized delta modes (pixels vs lines vs pages).
 * - Linear Interpolation (lerp) per requestAnimationFrame:
 *     current += (target - current) * damping
 * - Soft rubber-band resistance beyond boundaries with spring restitution.
 * - Hardware accelerated translate3d direct DOM mutation.
 */
export function useInertiaPan({
  canvasWidth = 3400,
  canvasHeight = 2400,
  damping = 0.08,             // 0.04 (floaty) to 0.15 (crisp)
  deltaMultiplier = 1.0,      // Sensitivity factor
  rubberBand = true,          // Soft boundary bounce
  initialCenterX = true,
  enabled = true
}) {
  const containerRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const prevRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);
  const boundsRef = useRef({ minX: -2000, maxX: 0, minY: -1600, maxY: 0 });

  // Expose telemetry state for UI / Minimap / HUD without re-rendering every frame
  const [telemetry, setTelemetry] = useState({
    x: 0,
    y: 0,
    progressX: 0.5,
    progressY: 0.5,
    velocityX: 0,
    velocityY: 0
  });

  const updateBounds = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const pad = 80; // Boundary padding margin
    boundsRef.current = {
      minX: vpW - canvasWidth - pad,
      maxX: pad,
      minY: vpH - canvasHeight - pad,
      maxY: pad
    };
  }, [canvasWidth, canvasHeight]);

  const recenter = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const cx = (vpW - canvasWidth) / 2;
    const cy = (vpH - canvasHeight) / 2;
    targetRef.current = { x: cx, y: cy };
    currentRef.current = { x: cx, y: cy };
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    }
  }, [canvasWidth, canvasHeight]);

  const panTo = useCallback((destX, destY) => {
    targetRef.current = { x: destX, y: destY };
  }, []);

  // Main animation frame physics loop
  useEffect(() => {
    if (!enabled) return;

    updateBounds();
    window.addEventListener('resize', updateBounds);

    if (initialCenterX) {
      recenter();
    }

    let isRunning = true;
    let lastTelemetryUpdate = 0;

    const tick = (now) => {
      if (!isRunning) return;

      const { minX, maxX, minY, maxY } = boundsRef.current;
      const target = targetRef.current;
      const current = currentRef.current;

      // Soft boundary pull-back if target went into overscroll
      if (rubberBand) {
        if (target.x > maxX) target.x += (maxX - target.x) * 0.12;
        if (target.x < minX) target.x += (minX - target.x) * 0.12;
        if (target.y > maxY) target.y += (maxY - target.y) * 0.12;
        if (target.y < minY) target.y += (minY - target.y) * 0.12;
      } else {
        target.x = Math.max(minX, Math.min(maxX, target.x));
        target.y = Math.max(minY, Math.min(maxY, target.y));
      }

      // Lerp deceleration
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      current.x += dx * damping;
      current.y += dy * damping;

      // Direct DOM update via translate3d for sub-millisecond 60/120Hz smoothness
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
      }

      // Calculate velocity and normalized progression (0 to 1)
      const vx = current.x - prevRef.current.x;
      const vy = current.y - prevRef.current.y;
      prevRef.current = { x: current.x, y: current.y };

      // Update telemetry throttled to ~20-30 fps to keep React UI lean
      if (now - lastTelemetryUpdate > 40) {
        lastTelemetryUpdate = now;
        const totalSpanX = Math.abs(minX - maxX) || 1;
        const totalSpanY = Math.abs(minY - maxY) || 1;
        const normX = Math.max(0, Math.min(1, (maxX - current.x) / totalSpanX));
        const normY = Math.max(0, Math.min(1, (maxY - current.y) / totalSpanY));

        setTelemetry({
          x: Math.round(current.x),
          y: Math.round(current.y),
          progressX: normX,
          progressY: normY,
          velocityX: Math.round(vx * 10) / 10,
          velocityY: Math.round(vy * 10) / 10
        });
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', updateBounds);
    };
  }, [enabled, damping, rubberBand, initialCenterX, updateBounds, recenter]);

  // Wheel listener attached with { passive: false } to intercept trackpad 2D pan
  useEffect(() => {
    if (!enabled) return;

    const handleWheel = (e) => {
      // Disregard if event originated inside a scrollable modal or dropdown
      if (e.target.closest('[data-scrollable="true"]')) {
        return;
      }

      e.preventDefault();

      // Normalize delta based on deltaMode (pixel vs line vs page)
      let dx = e.deltaX;
      let dy = e.deltaY;

      if (e.deltaMode === 1) {
        // DOM_DELTA_LINE (traditional notched mouse wheel)
        dx *= 24;
        dy *= 24;
      } else if (e.deltaMode === 2) {
        // DOM_DELTA_PAGE
        dx *= window.innerWidth * 0.8;
        dy *= window.innerHeight * 0.8;
      }

      dx *= deltaMultiplier;
      dy *= deltaMultiplier;

      const { minX, maxX, minY, maxY } = boundsRef.current;
      const target = targetRef.current;

      // Natural trackpad swipe: moving fingers left / up pans target coordinates
      let nextX = target.x - dx;
      let nextY = target.y - dy;

      // Apply resistance if already beyond boundary
      if (rubberBand) {
        if (nextX > maxX) {
          const over = nextX - maxX;
          nextX = maxX + over * 0.35;
        } else if (nextX < minX) {
          const over = minX - nextX;
          nextX = minX - over * 0.35;
        }

        if (nextY > maxY) {
          const over = nextY - maxY;
          nextY = maxY + over * 0.35;
        } else if (nextY < minY) {
          const over = minY - nextY;
          nextY = minY - over * 0.35;
        }
      } else {
        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));
      }

      target.x = nextX;
      target.y = nextY;
    };

    // Touch support for iPad / mobile screens (1-finger pan without grabbing)
    let touchStartPos = { x: 0, y: 0 };
    const handleTouchStart = (e) => {
      if (e.touches.length === 1 && !e.target.closest('[data-scrollable="true"]')) {
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && !e.target.closest('[data-scrollable="true"]')) {
        e.preventDefault();
        const currentTouchX = e.touches[0].clientX;
        const currentTouchY = e.touches[0].clientY;
        const diffX = (currentTouchX - touchStartPos.x) * 1.5 * deltaMultiplier;
        const diffY = (currentTouchY - touchStartPos.y) * 1.5 * deltaMultiplier;

        targetRef.current.x += diffX;
        targetRef.current.y += diffY;

        touchStartPos = { x: currentTouchX, y: currentTouchY };
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled, deltaMultiplier, rubberBand]);

  return {
    containerRef,
    telemetry,
    recenter,
    panTo,
    targetRef,
    currentRef
  };
}
