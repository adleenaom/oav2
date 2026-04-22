import { useParams, useNavigate } from 'react-router-dom';
import { Globe, BookOpen } from 'lucide-react';
import { useCreator } from '../hooks/useOAData';
import BundleThumbnail from '../components/BundleThumbnail';
import Breadcrumb from '../components/Breadcrumb';
import { bundleUrl } from '../utils/slug';

// Creator detail type is resolved from useCreator hook

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: oaCreator, isLoading } = useCreator(id ? Number(id) : null);
  const creator = oaCreator ? {
    ...oaCreator,
    job_title: oaCreator.jobTitle,
    bundles: [] as { id: number; title: string; subtitle: string; thumbnail: string; category: string; is_free: boolean; credits_required: number }[],
    videos: [] as { id: number; title: string; thumbnail: string; category: string }[],
  } : null;

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="type-body-default text-text-tertiary">Loading...</div></div>;
  if (!creator) { navigate('/'); return null; }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        {/* Header */}
        <div className="bg-bg-secondary">
          <div className="container-content py-8 md:py-12">
            {/* Back */}
            <Breadcrumb items={[
              { label: 'Home', path: '/' },
              { label: 'Discover', path: '/discover' },
              { label: creator.name },
            ]} />

            <div className="flex items-start gap-6">
              <img src={creator.avatar} alt={creator.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-accent-yellow shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="type-headline-large text-text-primary md:text-[24px]">{creator.name}</h1>
                <p className="type-description text-text-secondary mt-1">{creator.job_title}</p>
                {creator.homepage && (
                  <a href={creator.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 type-pre-text text-action-secondary hover:underline">
                    <Globe size={12} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container-content">
          {/* Bio */}
          <div className="section-tight">
            <h2 className="type-headline-medium text-text-primary mb-3">About</h2>
            <p className="type-body-default text-text-secondary">{creator.bio}</p>
          </div>

          {/* Bundles */}
          {creator.bundles.length > 0 && (
            <div className="section-tight">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-text-primary" />
                <h2 className="type-headline-medium text-text-primary">Courses ({creator.bundles.length})</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                {creator.bundles.map(bundle => (
                  <BundleThumbnail
                    key={bundle.id}
                    thumbnail={bundle.thumbnail}
                    alt={bundle.title}
                    size="big"
                    price={bundle.is_free ? 'free' : bundle.credits_required}
                    onClick={() => navigate(bundleUrl(bundle.id))}
                    className="w-full h-auto aspect-[3/4]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* For You videos by this creator */}
          {creator.videos.length > 0 && (
            <div className="section-tight">
              <h2 className="type-headline-medium text-text-primary mb-4">Videos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                {creator.videos.map(video => (
                  <BundleThumbnail
                    key={video.id}
                    thumbnail={video.thumbnail}
                    alt={video.title}
                    size="big"
                    onClick={() => {}}
                    className="w-full h-auto aspect-[3/4]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
