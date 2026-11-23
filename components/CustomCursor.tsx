import React from 'react';

interface CustomCursorProps {
  cursorRingRef: React.RefObject<HTMLDivElement | null>;
  cursorLabelRef: React.RefObject<HTMLSpanElement | null>;
  cursorDotRef: React.RefObject<HTMLDivElement | null>;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  cursorRingRef,
  cursorLabelRef,
  cursorDotRef,
}) => {
  return (
    <>
      <div ref={cursorRingRef} className="et-cursor-ring" aria-hidden="true">
        <span ref={cursorLabelRef} className="et-cursor-label" />
      </div>
      <div ref={cursorDotRef} className="et-cursor-dot" aria-hidden="true" />

    </>
  );
};
