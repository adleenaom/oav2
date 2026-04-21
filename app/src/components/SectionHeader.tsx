import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  /** Pass the scrollable container ref to enable carousel controls on desktop */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function SectionHeader({ title, onSeeAll, scrollRef }: SectionHeaderProps) {
  const [showControls, setShowControls] = useState(false);

  // Check if content overflows (needs scrolling)
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const check = () => setShowControls(el.scrollWidth > el.clientWidth + 4);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRef]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef?.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Title + see-all arrow together — both clickable */}
      {onSeeAll ? (
        <button onClick={onSeeAll} className="flex items-center gap-1.5 hover:underline transition-colors">
          <h2 className="type-headline-large text-text-primary">{title}</h2>
          <ChevronRight size={20} className="text-text-primary" strokeWidth={2.5} />
        </button>
      ) : (
        <h2 className="type-headline-large text-text-primary">{title}</h2>
      )}

      {/* Carousel controls — desktop only, hidden when content fits */}
      {scrollRef && showControls && (
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
