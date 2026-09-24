import React, { useState } from 'react';

export function ListView({ stories, onSelectStory }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStory = stories[activeIndex] || stories[0];

  return (
    <div
      data-scrollable="true"
      className="relative w-full h-full pt-36 pb-32 overflow-y-auto overflow-x-hidden font-mono select-none overscroll-contain"
    >
      {/* Floating Illustration Preview Box docked on the right side */}
      {activeStory && (
        <aside
          aria-hidden="true"
          className="fixed pointer-events-none z-30 transition-opacity duration-200 hidden xl:block"
          style={{
            right: '5.5%',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <div className="w-52 h-52 bg-neutral-100 shadow-md border border-neutral-200/80 overflow-hidden relative group">
            <img
              key={activeStory.id}
              src={activeStory.image}
              alt={activeStory.name}
              className="w-full h-full object-cover animate-fadeIn"
            />
            <div className="absolute bottom-1 right-2 text-[9px] uppercase tracking-widest text-white/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
              {activeStory.shortName || activeStory.name}
            </div>
          </div>
        </aside>
      )}

      {/* Interactive Verbatim Memorial List with exact fixed-height items */}
      <ul className="w-full flex flex-col py-2" role="list">
        {stories.map((story, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={story.id}
              onClick={() => onSelectStory(story)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`names-list-item cursor-pointer px-4 w-full text-center flex items-center justify-center transition-colors ${
                isActive ? 'row-active' : 'hover:bg-neutral-100'
              }`}
            >
              <span
                className={`text-[13px] md:text-[14px] leading-none tracking-normal select-none truncate max-w-2xl ${
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
