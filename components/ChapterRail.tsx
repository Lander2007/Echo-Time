import React from 'react';
import { CHAPTERS } from '@/data/echoData';

interface ChapterRailProps {
  chromeTheme: 'dark' | 'light';
  activeChapterId: string;
  onJump: (id: string) => void;
}

export const ChapterRail: React.FC<ChapterRailProps> = ({
  chromeTheme,
  activeChapterId,
  onJump,
}) => {
  return (
      <aside
        className={`chapter-rail ${chromeTheme === 'light' ? 'nav-is-light' : ''}`}
        aria-label="Story chapters"
      >
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            data-cursor="JUMP"
            onClick={() => onJump(ch.id)}
            className={`chapter-rail-btn ${activeChapterId === ch.id ? 'is-active' : ''}`}
          >
            <span className="chapter-rail-label">{ch.label}</span>
            <span className="chapter-rail-tick" />
          </button>
        ))}
      </aside>

  );
};
