import React from 'react';

export interface HourglassMarkProps {
  /** 'filled' = full logo with wavy sand & mound; 'lineart' = minimal architectural outline for subtle watermark */
  variant?: 'filled' | 'lineart';
  /** Stroke & sand fill color (default: Imperial Blue #021F94) */
  color?: string;
  /** Interior fill of the top & bottom pill caps so glass walls terminate crisply behind them */
  capFill?: string;
  /** Stroke thickness in 200x260 viewBox units (use ~10-11 for small navbar/footer icons, ~4.8-5.8 for large watermarks) */
  strokeWidth?: number;
  /** Enables gentle shimmer on the falling sand stream */
  animateStream?: boolean;
  /** Enables 180° flip class when nested inside a `.group` or `.et-logo-trigger` */
  flipOnHover?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function HourglassMark({
  variant = 'filled',
  color = '#021F94',
  capFill = '#F5F2F3',
  strokeWidth = 6,
  animateStream = false,
  flipOnHover = false,
  width = '100%',
  height = '100%',
  className = '',
}: HourglassMarkProps) {
  const fineStroke = Number((strokeWidth * 0.72).toFixed(2));
  const streamWidth = strokeWidth >= 9 ? 4.2 : 2.2;
  const streamX = Number((100 - streamWidth / 2).toFixed(2));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g className={flipOnHover ? 'et-hourglass-flip' : undefined}>
        {/* Symmetrical Curved Glass Walls (Mirrored Exactly Across x = 100) */}
        <path
          d="M 42 30 C 42 74, 58 104, 89 124.5 C 92.5 126.8, 92.5 133.2, 89 135.5 C 58 156, 42 186, 42 230"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 158 30 C 158 74, 142 104, 111 124.5 C 107.5 126.8, 107.5 133.2, 111 135.5 C 142 156, 158 186, 158 230"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top & Bottom Precision Rounded Pill Caps */}
        <rect
          x="28"
          y="14"
          width="144"
          height="16"
          rx="8"
          fill={capFill}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <rect
          x="28"
          y="230"
          width="144"
          height="16"
          rx="8"
          fill={capFill}
          stroke={color}
          strokeWidth={strokeWidth}
        />

        {variant === 'filled' ? (
          <>
            {/* Upper Wavy Sand Body with Uniform Inner Glass Margin */}
            <path
              d="M 58.5 80
                 C 74 74, 88 86, 100 84
                 C 112 82, 126 75, 141.5 80
                 C 134 99, 121 112, 105.5 123.5
                 C 102.8 125.5, 101.2 128.5, 101.1 134
                 L 98.9 134
                 C 98.8 128.5, 97.2 125.5, 94.5 123.5
                 C 79 112, 66 99, 58.5 80 Z"
              fill={color}
            />
            {/* Centered Falling Sand Stream */}
            <rect
              x={streamX}
              y="132"
              width={streamWidth}
              height="54"
              rx={streamWidth / 2}
              fill={color}
              className={animateStream ? 'et-sand-stream' : undefined}
            />
            {/* Smooth Symmetric Lower Sand Mound */}
            <path
              d="M 49.5 225.5 C 63 205, 81 184, 100 184 C 119 184, 137 205, 150.5 225.5 Z"
              fill={color}
            />
          </>
        ) : (
          <>
            {/* Delicate Architectural Line-Art Sand Contours (Base Watermark) */}
            <path
              d="M 59 80 C 74 74, 88 86, 100 84 C 112 82, 126 75, 141 80"
              stroke={color}
              strokeWidth={fineStroke}
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="133"
              x2="100"
              y2="184"
              stroke={color}
              strokeWidth={Number((strokeWidth * 0.45).toFixed(2))}
              strokeLinecap="round"
              strokeDasharray="3 5"
              className={animateStream ? 'et-sand-stream' : undefined}
            />
            <path
              d="M 51 225 C 64 205, 81 184, 100 184 C 119 184, 136 205, 149 225"
              stroke={color}
              strokeWidth={fineStroke}
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    </svg>
  );
}
