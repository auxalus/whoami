import React, { useRef, useEffect, useMemo } from 'react';

export function GridView({
  stories,
  lang,
  onSelectStory
}) {
  const targetRef = useRef({ x: -280, y: -80 });
  const currentRef = useRef({ x: -280, y: -80 });
  const cardsRef = useRef([]);
  const damping = 0.085;

  const cardWidth = 180;
  const cardHeight = 220;
  const colStepX = 275;
  const rowStepY = 320;
  const colCount = 20;
  const rowCount = Math.ceil(stories.length / colCount);
  const gridTotalW = colCount * colStepX;
  const gridTotalH = rowCount * rowStepY;

  const baseCoords = useMemo(() => {
    return stories.map((_, i) => {
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const staggerY = (col % 2 === 0) ? 65 : 0;
      return {
        x: 160 + col * colStepX,
        y: 120 + row * rowStepY + staggerY
      };
    });
  }, [stories.length]);

  useEffect(() => {
    let isRunning = true;
    const loop = () => {
      if (!isRunning) return;

      const target = targetRef.current;
      const current = currentRef.current;

      current.x += (target.x - current.x) * damping;
      current.y += (target.y - current.y) * damping;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      for (let i = 0; i < stories.length; i++) {
        const el = cardsRef.current[i];
        if (!el) continue;

        const base = baseCoords[i];
        let screenX = ((base.x + current.x) % gridTotalW + gridTotalW) % gridTotalW;
        if (screenX > vpW + cardWidth) screenX -= gridTotalW;

        let screenY = ((base.y + current.y) % gridTotalH + gridTotalH) % gridTotalH;
        if (screenY > vpH + cardHeight) screenY -= gridTotalH;

        if (screenX >= -cardWidth - 60 && screenX <= vpW + 60 && 
            screenY >= -cardHeight - 60 && screenY <= vpH + 60) {
          el.style.display = 'block';
          el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0)`;
        } else {
          el.style.display = 'none';
        }
      }

      requestAnimationFrame(loop);
    };

    const rafId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };
  }, [baseCoords, gridTotalW, gridTotalH, stories.length]);

  useEffect(() => {
    const onWheel = (e) => {
      if (e.target.closest('[data-scrollable="true"]')) return;
      e.preventDefault();

      let dx = e.deltaX;
      let dy = e.deltaY;

      if (e.deltaMode === 1) {
        dx *= 24;
        dy *= 24;
      } else if (e.deltaMode === 2) {
        dx *= window.innerWidth * 0.7;
        dy *= window.innerHeight * 0.7;
      }

      targetRef.current.x -= dx * 1.0;
      targetRef.current.y -= dy * 1.0;
    };

    let isMouseDown = false;
    let mouseStart = { x: 0, y: 0 };
    const onMouseDown = (e) => {
      if (e.target.closest('button, a, input, [data-scrollable="true"]')) return;
      isMouseDown = true;
      mouseStart = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const diffX = e.clientX - mouseStart.x;
      const diffY = e.clientY - mouseStart.y;
      targetRef.current.x += diffX * 1.2;
      targetRef.current.y += diffY * 1.2;
      mouseStart = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {stories.map((story, index) => (
        <div
          key={story.id}
          ref={(el) => (cardsRef.current[index] = el)}
          onClick={() => onSelectStory(story)}
          className="absolute top-0 left-0 group cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.02] z-10 hover:z-20 gpu-accel"
          style={{
            width: `${cardWidth}px`,
            display: 'none'
          }}
        >
          <div className="font-mono text-[11px] text-black leading-tight mb-2 truncate group-hover:text-black/70 transition-colors pointer-events-none">
            {story.number} . {story.displayTitle || story.name}
          </div>
          <div className="w-full aspect-square bg-[#eae8e2] overflow-hidden">
            <img
              src={story.image}
              alt={story.name}
              draggable="false"
              loading="lazy"
              className="w-full h-full object-cover select-none transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
