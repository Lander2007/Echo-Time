'use client';

import React, { useEffect, useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  initials: string;
  alt: string;
  className?: string;
}

export function UserAvatar({
  src,
  initials,
  alt,
  className = 'w-10 h-10 text-xs',
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset error flag whenever the user uploads a new photo
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} rounded-[2px] object-cover border border-[#021F94]/40 shrink-0 bg-[#F5F2F3]`}
      />
    );
  }

  return (
    <span
      className={`${className} rounded-[2px] bg-[#0B1026] text-[#F5F2F3] border border-[#0B1026] font-mono font-bold inline-flex items-center justify-center shrink-0 select-none`}
      aria-label={alt}
    >
      {initials}
    </span>
  );
}
