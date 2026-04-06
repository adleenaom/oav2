import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '../data/types';

interface LessonCardProps {
  lesson: LessonPlan;
  progress?: number;
  onClick: () => void;
  className?: string;
}

export default function LessonCard({ lesson, progress, onClick, className }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "card-interactive bg-bg-elevated border border-border-card rounded-[12px] overflow-hidden shrink-0 text-left flex flex-col",
        className || "w-[257px] md:w-[300px]"
      )}
    >
      <div className="relative w-full h-[145px] md:h-[170px]">
        <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />

        {progress !== undefined && progress > 0 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
              <div className="bg-accent-blue h-full rounded-l" style={{ width: `${progress}%` }} />
              <div className="bg-white/70 h-full flex-1 rounded-r" />
            </div>
            <div className="absolute top-3 left-4 bg-bg-secondary px-2 py-1 rounded">
              <span className="type-tags text-text-secondary">{progress}% COMPLETED</span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <span className="type-tags text-text-category">{lesson.category}</span>
          <h3 className="type-headline-medium text-text-primary">{lesson.fullTitle}</h3>
          <p className="type-description text-text-secondary line-clamp-3">{lesson.description}</p>
        </div>

        <div className="flex items-center gap-1.5 mt-auto">
          <div className="flex items-center">
            <span className="type-description text-text-secondary">{lesson.rating}</span>
            <Star size={12} fill="var(--color-orange)" color="var(--color-orange)" className="ml-0.5" />
          </div>
          {lesson.reviews > 0 && (
            <span className="type-pre-text text-text-secondary">{lesson.reviews} reviews</span>
          )}
          <span className="type-pre-text text-text-tertiary">· {lesson.bundles.length} bundles</span>
        </div>
      </div>
    </button>
  );
}
