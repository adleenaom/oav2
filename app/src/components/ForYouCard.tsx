import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ForYouVideo } from '../data/types';

interface ForYouCardProps {
  video: ForYouVideo;
  onClick: () => void;
  className?: string;
}

export default function ForYouCard({ video, onClick, className }: ForYouCardProps) {
  return (
    <button
      onClick={onClick}
      title={video.title}
      className={cn(
        "card-interactive relative rounded-[8px] overflow-hidden shrink-0",
        className || "w-[100px] h-[150px] md:w-[140px] md:h-[200px]"
      )}
    >
      <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />

      {/* Play icon */}
      <div className="absolute top-1.5 left-1.5">
        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
          <Play size={9} fill="#202020" color="#202020" />
        </div>
      </div>

      {/* Title gradient */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-8">
        <span className="type-tags text-text-on-dark leading-tight line-clamp-2 block text-left text-[9px] md:text-[10px]">
          {video.title}
        </span>
      </div>
    </button>
  );
}
