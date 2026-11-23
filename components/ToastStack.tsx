import React from 'react';
import { ToastItem } from '@/types/echo';
import { TactileAudioEngine } from '@/lib/audio';

interface ToastStackProps {
  toasts: ToastItem[];
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
  getAudio: () => TactileAudioEngine;
}

export const ToastStack: React.FC<ToastStackProps> = ({
  toasts,
  setToasts,
  getAudio,
}) => {
  return (
      <div
        className="fixed top-20 right-5 flex flex-col gap-2 pointer-events-none max-w-xs"
        style={{ zIndex: 98 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="et-toast-item pointer-events-auto px-4 py-3 rounded-sm border font-swiss-mono text-[11px] leading-snug shadow-xl"
            style={{ backgroundColor: '#061354', color: '#F5F2F3', borderColor: '#021F94' }}
          >
            {t.message}
          </div>
        ))}
      </div>

  );
};
