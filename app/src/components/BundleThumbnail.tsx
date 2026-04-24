import { useState, useRef, useEffect } from 'react';
import { Check, MoreVertical } from 'lucide-react';
import CoinIcon from './CoinIcon';

/*
 * BundleThumbnail — Figma node 4423:32728
 *
 * Pure thumbnail card with price/progress overlay.
 * Matches Figma "Bundle Progress" component exactly.
 *
 * Sizes (2:3 aspect ratio):
 *   default  — 100 × 150px
 *   medium   — 120 × 180px
 *   big      — 160 × 240px
 */

type ThumbnailSize = 'default' | 'medium' | 'big';

interface MenuAction {
  label: string;
  onClick: () => void;
}

interface BundleThumbnailProps {
  thumbnail: string;
  alt?: string;
  size?: ThumbnailSize;
  progress?: number;         // 0–100, undefined = not started
  price?: number | 'free';   // shown only when not started
  showPrice?: boolean;
  onClick?: () => void;
  className?: string;
  menuActions?: MenuAction[];  // 3-dots menu items
}

const sizeMap: Record<ThumbnailSize, { w: string; h: string }> = {
  default: { w: 'w-[100px]', h: 'h-[150px]' },
  medium:  { w: 'w-[120px]', h: 'h-[180px]' },
  big:     { w: 'w-[160px]', h: 'h-[240px]' },
};

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
  menuActions,
}: BundleThumbnailProps) {
  // If className provides its own sizing (e.g. w-full), skip default fixed sizes
  const hasCustomSize = className.includes('w-full') || className.includes('w-[');
  const { w, h } = hasCustomSize ? { w: '', h: '' } : sizeMap[size];
  const isNotStarted = progress === undefined;
  const isInProgress = progress !== undefined && progress < 100;
  const isCompleted = progress === 100;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className={`relative shrink-0 ${w} ${h} ${className}`}>
      <button
        onClick={onClick}
        title={alt}
        className={`card-interactive relative rounded-[8px] overflow-hidden w-full h-full cursor-pointer`}
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
            {progress > 0 && (
              <>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="type-headline-medium text-text-on-dark">
                    {progress}%
                  </span>
                </div>
              </>
            )}
            {/* Progress bar — YouTube-style thin bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
              <div
                className="bg-accent-blue h-full transition-all"
                style={{ width: progress > 0 ? getBarWidth(progress) : '2%' }}
              />
            </div>
          </>
        )}

        {/* Completed overlay */}
        {isCompleted && (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check size={20} className="text-white" strokeWidth={3} />
              </div>
              <span className="type-button text-white text-[11px] tracking-wider">COMPLETED</span>
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
                <CoinIcon size={10} />
                <span className="type-button text-bg-secondary">{price}</span>
              </div>
            )}
          </div>
        )}
      </button>

      {/* 3-dots menu */}
      {menuActions && menuActions.length > 0 && (
        <div ref={menuRef} className="absolute top-1.5 right-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <MoreVertical size={14} className="text-text-primary" />
          </button>

          {menuOpen && (
            <div className="absolute top-8 right-0 bg-bg-elevated rounded-[8px] py-1 min-w-[140px] z-20" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
              {menuActions.map((action) => (
                <button
                  key={action.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    action.onClick();
                  }}
                  className="w-full text-left px-4 py-2.5 type-body-default text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
