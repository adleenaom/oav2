import { useNavigate } from 'react-router-dom';
import { useBundleDetail } from '../hooks/useOAData';

/**
 * ChaptersRow — horizontal scroll of series thumbnails for a bundle.
 * Each thumbnail is 80×107px (3:4 ratio), rounded-8, clickable.
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
  const { seriesList } = useBundleDetail(bundleId);

  const { w, h } = sizes[size];

  if (seriesList.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {seriesList.map((series) => (
        <button
          key={series.id}
          onClick={() => navigate(`/bundle/${bundleId}`)}
          className={`card-interactive relative ${w} ${h} rounded-[8px] overflow-hidden shrink-0`}
        >
          <img
            src={series.image}
            alt={series.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
