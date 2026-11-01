'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { asset } from '@/lib/asset';

interface SafeImageProps {
  src: string;
  alt: string;
  /** Responsive `sizes` hint for the browser. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Shown in the placeholder when the file is missing. */
  fallbackLabel?: string;
}

/**
 * `next/image` (fill mode) with a monochrome placeholder when the file is
 * missing or fails to load, so one bad upload never leaves a broken box.
 * The parent must be `position: relative` with a defined size.
 */
export function SafeImage({ src, alt, sizes, className = '', priority, fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const url = asset(src);

  if (!url || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-2 text-mute">
        <ImageOff aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        {fallbackLabel ? <span className="text-label uppercase">{fallbackLabel}</span> : null}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        console.warn('[image] failed to load:', url);
        setFailed(true);
      }}
    />
  );
}

export default SafeImage;
