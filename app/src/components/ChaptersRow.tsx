import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useBundleDetail } from '../hooks/useOAData';
import { useProgress } from '../hooks/useProgress';
import { bundleUrl } from '../utils/slug';

interface ChaptersRowProps {
  bundleId: number;
  size?: 'small' | 'medium';
}

const sizes = {
  small: { w: 'w-[80px]', h: 'h-[107px]' },
  medium: { w: 'w-[100px]', h: 'h-[133px]' },
};

export default function ChaptersRow({ bundleId, size = 'small' }: ChaptersRowProps) {
  const navigate = useNavigate();
  const { resolvedChapters } = useBundleDetail(bundleId);
  const { getBundleProgress } = useProgress();

  const { w, h } = sizes[size];
  const progress = getBundleProgress(String(bundleId));
  const completedIds = progress?.completedChapters || [];

  if (resolvedChapters.length === 0) return null;

  // Sort: incomplete first, completed last
  const sorted = [...resolvedChapters].sort((a, b) => {
    const aDone = completedIds.includes(String(a.id));
    const bDone = completedIds.includes(String(b.id));
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {sorted.map((chapter) => {
        const isDone = completedIds.includes(String(chapter.id));
        return (
          <button
            key={chapter.id}
            onClick={() => navigate(bundleUrl(bundleId))}
            title={chapter.title}
            className={`card-interactive relative ${w} ${h} rounded-[8px] overflow-hidden shrink-0`}
          >
            <img
              src={chapter.seriesImage}
              alt={chapter.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isDone && (
              <>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
