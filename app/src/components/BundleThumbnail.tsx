import { Check } from 'lucide-react';

/*
 * BundleThumbnail — Figma node 4423:32728
 *
 * Pure thumbnail card with price/progress overlay.
 * Matches Figma "Bundle Progress" component exactly.
 *
 * Sizes (3:4 aspect ratio):
 *   default  — 100 × 133px
 *   medium   — 120 × 160px
 *   big      — 160 × 213px
 *
 * States:
 *   not-started  — price badge (coin + N or FREE) top-right
 *   in-progress  — 30% black overlay, percentage centered, blue bar bottom
 *   completed    — 30% black overlay, check + "COMPLETED" centered
 *
 * All: 8px border-radius, image fills edge-to-edge
 */

type ThumbnailSize = 'default' | 'medium' | 'big';

interface BundleThumbnailProps {
  thumbnail: string;
  alt?: string;
  size?: ThumbnailSize;
  progress?: number;         // 0–100, undefined = not started
  price?: number | 'free';   // shown only when not started
  showPrice?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap: Record<ThumbnailSize, { w: string; h: string }> = {
  default: { w: 'w-[100px]', h: 'h-[133px]' },
  medium:  { w: 'w-[120px]', h: 'h-[160px]' },
  big:     { w: 'w-[160px]', h: 'h-[213px]' },
};

// Blue bar width scales roughly per Figma: ~75% of width at 57%
function getBarWidth(progress: number): string {
  return `${progress}%`;
}

export default function BundleThumbnail({
  thumbnail,
  alt = '',
  size = 'big',
  progress,
  price,
  showPrice = true,
  onClick,
  className = '',
}: BundleThumbnailProps) {
  const { w, h } = sizeMap[size];
  const isNotStarted = progress === undefined || progress === 0;
  const isInProgress = progress !== undefined && progress > 0 && progress < 100;
  const isCompleted = progress === 100;

  return (
    <button
      onClick={onClick}
      className={`card-interactive relative rounded-[8px] overflow-hidden shrink-0 ${w} ${h} ${className}`}
    >
      {/* Image — fills entire card */}
      <img
        src={thumbnail}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* In-progress overlay */}
      {isInProgress && (
        <>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="type-headline-medium text-text-on-dark">
              {progress}%
            </span>
          </div>
          {/* Progress bar — 7px tall, blue, left-aligned */}
          <div className="absolute bottom-0 left-[-3px] right-0 h-[7px]">
            <div
              className="bg-accent-blue h-full rounded-l-none"
              style={{ width: getBarWidth(progress) }}
            />
          </div>
        </>
      )}

      {/* Completed overlay */}
      {isCompleted && (
        <>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Check size={18} className="text-text-on-dark" strokeWidth={3} />
            <span className="type-tags text-text-on-dark">Completed</span>
          </div>
        </>
      )}

      {/* Price badge — only when not started & showPrice */}
      {isNotStarted && showPrice && price !== undefined && (
        <div className="absolute top-[9px] right-[9px] bg-action-primary rounded h-[34px] w-[57px] flex items-center justify-center p-2 gap-1">
          {price === 'free' || price === 0 ? (
            <span className="type-button text-bg-secondary">FREE</span>
          ) : (
            <div className="flex items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-yellow" />
              <span className="type-button text-bg-secondary">{price}</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
