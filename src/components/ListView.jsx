import React, { useState, useEffect, useRef } from 'react';

export function ListView({ stories, onSelectStory }) {
  const [activeIndex, setActiveIndex] = useState(11);
  const [previewTop, setPreviewTop] = useState(400);
  const listRefs = useRef([]);
  const containerRef = useRef(null);

  const activeStory = stories[activeIndex] || stories[0];

  const updatePreview = (index) => {
    setActiveIndex(index);
    const itemEl = listRefs.current[index];
    if (itemEl) {
      const rect = itemEl.getBoundingClientRect();
      setPreviewTop(rect.top + rect.height / 2);
    }
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      const itemEl = listRefs.current[activeIndex];
      if (itemEl) {
        const rect = itemEl.getBoundingClientRect();
        setPreviewTop(rect.top + rect.height / 2);
      }
    };

    const timer = setTimeout(() => {
      updatePreview(11);
    }, 100);

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      data-scrollable="true"
      className="relative w-full h-full pt-36 pb-32 overflow-y-auto overflow-x-hidden font-mono select-none scroll-smooth"
    >
      {/* Floating Illustration Preview Box with Individual Profile Picture */}
      {activeStory && (
        <aside
          aria-hidden="true"
          className="fixed pointer-events-none z-30 transition-all duration-300 ease-out hidden xl:block"
          style={{
            right: '5.5%',
            top: `${previewTop}px`,
            transform: 'translateY(-48%)'
          }}
        >
          <div className="w-48 h-48 md:w-52 md:h-52 bg-neutral-100 shadow-md border border-neutral-200/60 overflow-hidden relative group">
            <img
              src={activeStory.image}
              alt={activeStory.name}
              className="w-full h-full object-cover transition-opacity duration-200"
            />
            <div className="absolute bottom-1 right-2 text-[9px] uppercase tracking-widest text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
              {activeStory.shortName || activeStory.name}
            </div>
          </div>
        </aside>
      )}

      {/* Interactive Verbatim Memorial List */}
      <ul className="w-full flex flex-col py-2" role="list">
        {stories.map((story, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={story.id}
              ref={(el) => (listRefs.current[index] = el)}
              onClick={() => onSelectStory(story)}
              onMouseEnter={() => updatePreview(index)}
              className={`names-list-item cursor-pointer py-[0.5rem] px-4 w-full text-center flex items-center justify-center transition-colors ${
                isActive ? 'row-active' : 'hover:bg-neutral-100'
              }`}
            >
              <span
                className={`text-[13px] md:text-[14px] leading-relaxed tracking-normal select-none ${
                  isActive ? 'text-white font-medium' : 'text-black'
                }`}
              >
                {story.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
