import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import type { ApiBundleDetail } from '../services/types';

/**
 * ChaptersRow — horizontal scroll of chapter thumbnails for a bundle.
 * Each thumbnail is 80×107px (3:4 ratio), rounded-8, clickable.
 * Matches Figma pattern from SeriesRow / Bundle Listing component.
 */
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
  const { data: bundle } = useApi<ApiBundleDetail>(`/bundles/${bundleId}`);

  const chapters = bundle?.series?.flatMap(s => s.chapters) ?? [];
  const { w, h } = sizes[size];

  if (chapters.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {chapters.map((chapter, idx) => (
        <button
          key={chapter.id}
          onClick={() => navigate(`/play/${bundleId}/${idx}`)}
          className={`card-interactive relative ${w} ${h} rounded-[8px] overflow-hidden shrink-0`}
        >
          <img
            src={chapter.thumbnail}
            alt={chapter.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
