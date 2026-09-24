import React, { useState } from 'react';

export function ListView({ stories, onSelectStory }) {
  const [activeStoryId, setActiveStoryId] = useState(null);

  return (
    <div
      data-scrollable="true"
      className="relative w-full h-full pt-36 pb-32 overflow-y-auto overflow-x-hidden font-mono select-none overscroll-contain"
    >
      {/* Interactive Memorial List with profile only visible on black bar (200% size) */}
      <ul className="w-full flex flex-col py-2" role="list">
        {stories.map((story) => {
          const isActive = activeStoryId === story.id;
          return (
            <li
              key={story.id}
              onClick={() => {
                setActiveStoryId(story.id);
                onSelectStory(story);
              }}
              onMouseEnter={() => setActiveStoryId(story.id)}
              className={`names-list-item cursor-pointer px-4 w-full text-center flex items-center justify-center ${
                isActive ? 'row-active' : ''
              }`}
            >
              {/* Centered Name */}
              <span className="text-[13px] md:text-[14px] leading-none tracking-normal select-none truncate max-w-2xl text-black">
                {story.name}
              </span>

              {/* Profile Portrait only visible on the black bar with soft fade-in (200% size) */}
              <div className="list-portrait-thumb absolute right-4 md:right-12 lg:right-20 top-1/2 z-30">
                <div className="w-40 h-40 md:w-48 md:h-48 bg-[#111111] border border-neutral-700/80 shadow-2xl overflow-hidden relative">
                  <img
                    src={story.image}
                    alt={story.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 left-0 bg-black/85 px-2 py-1 text-[10px] text-white/95 text-center truncate tracking-widest font-mono">
                    {story.shortName || story.name}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
