import { Play } from 'lucide-react';
import type { Bundle } from '../data/types';

interface ContinueWatchingCardProps {
  content: Bundle;
  percentage: number;
  onClick: () => void;
}

export default function ContinueWatchingCard({ content, percentage, onClick }: ContinueWatchingCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-interactive relative w-[154px] h-[234px] md:w-[200px] md:h-[300px] rounded-[9px] overflow-hidden shrink-0"
    >
      <img src={content.thumbnail} alt={content.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute top-2 left-2">
        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
          <Play size={10} fill="#202020" color="#202020" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="type-headline-large text-text-on-dark text-[20px] md:text-[24px]">{percentage}%</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 flex">
        <div className="bg-accent-blue h-full rounded-l" style={{ width: `${percentage}%` }} />
        <div className="bg-white/30 h-full flex-1 rounded-r" />
      </div>
    </button>
  );
}
