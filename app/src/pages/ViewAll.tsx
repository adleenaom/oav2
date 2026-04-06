import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BundleThumbnail from '../components/BundleThumbnail';
import LessonCard from '../components/LessonCard';
import { useApi } from '../hooks/useApi';
import { useProgress } from '../hooks/useProgress';
import type { ApiHomeListings } from '../services/types';

type ViewType = 'continue' | 'foryou' | 'lessons';

const titles: Record<ViewType, string> = {
  continue: 'Continue Watching',
  foryou: 'For You',
  lessons: 'Explore Lessons',
};

export default function ViewAll() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { getPercentage, getContinueWatching } = useProgress();
  const { data } = useApi<ApiHomeListings>('/listings/home');

  const viewType = (type as ViewType) || 'foryou';
  const title = titles[viewType] || 'View All';

  const continueWatching = getContinueWatching();
  const forYouVideos = data?.for_you ?? [];
  const lessonPlans = data?.lessons ?? [];

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* ===== MOBILE ===== */}
      <div className="md:hidden flex flex-col h-full">
        {/* App bar */}
        <div className="bg-bg-secondary pt-14 pb-4 px-4 relative overflow-hidden">
          <div className="flex items-center h-[34px]">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1">
              <ChevronLeft size={14} className="text-text-primary" />
              <span className="type-button text-text-primary">Back</span>
            </button>
            <p className="type-display-medium text-text-primary text-center absolute left-1/2 -translate-x-1/2">
              {title}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px]">
          {/* Continue Watching — 2 column grid */}
          {viewType === 'continue' && (
            <div className="grid grid-cols-2 gap-1 px-6 py-4">
              {continueWatching.map(item => (
                <BundleThumbnail
                  key={`${item.type}-${item.id}`}
                  thumbnail={item.thumbnail}
                  alt={item.chapterTitle}
                  size="big"
                  progress={item.percentage}
                  onClick={() => navigate(item.type === 'lesson' ? `/lesson/${item.id}` : `/bundle/${item.id}`)}
                  className="w-full h-auto aspect-[3/4]"
                />
              ))}
            </div>
          )}

          {/* For You — 2 column grid using BundleThumbnail for consistent sizing */}
          {viewType === 'foryou' && (
            <div className="grid grid-cols-2 gap-1 px-6 py-4">
              {forYouVideos.map((video, index) => (
                <BundleThumbnail
                  key={video.id}
                  thumbnail={video.thumbnail}
                  alt={video.title}
                  size="big"
                  onClick={() => navigate(`/foryou/${index}`)}
                  className="w-full h-auto aspect-[3/4]"
                />
              ))}
            </div>
          )}

          {/* Lessons — 1 column list */}
          {viewType === 'lessons' && (
            <div className="flex flex-col gap-4 px-6 py-4">
              {lessonPlans.map(plan => (
                <LessonCard
                  key={plan.id}
                  lesson={{
                    id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                    category: plan.category, description: plan.description, keywords: [],
                    seriesCount: 0, totalMinutes: 0, rating: plan.rating,
                    reviews: plan.review_count, lessonPlanCoins: plan.credits_required,
                    thumbnail: plan.image, background: plan.background || plan.image,
                    bundles: [], targetAudience: [], learningPoints: [],
                    certificateOnCompletion: plan.certificate_on_completion,
                  }}
                  progress={getPercentage(String(plan.id)) || undefined}
                  onClick={() => navigate(`/lesson/${plan.id}`)}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-bg-secondary">
          <div className="container-content py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} />
              <span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-display-large text-text-primary">{title}</h1>
          </div>
        </div>

        <div className="container-content section-tight">
          {/* Continue Watching — 2 col grid, responsive to 3-4 */}
          {viewType === 'continue' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
              {continueWatching.map(item => (
                <BundleThumbnail
                  key={`${item.type}-${item.id}`}
                  thumbnail={item.thumbnail}
                  alt={item.chapterTitle}
                  size="big"
                  progress={item.percentage}
                  onClick={() => navigate(item.type === 'lesson' ? `/lesson/${item.id}` : `/bundle/${item.id}`)}
                  className="w-full h-auto aspect-[3/4]"
                />
              ))}
            </div>
          )}

          {/* For You — 2 col grid, responsive to 4-6 */}
          {viewType === 'foryou' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 card-grid-gap">
              {forYouVideos.map((video, index) => (
                <BundleThumbnail
                  key={video.id}
                  thumbnail={video.thumbnail}
                  alt={video.title}
                  size="big"
                  onClick={() => navigate(`/foryou/${index}`)}
                  className="w-full h-auto aspect-[3/4]"
                />
              ))}
            </div>
          )}

          {/* Lessons — 1 column, max-width for readability */}
          {viewType === 'lessons' && (
            <div className="flex flex-col gap-6 max-w-[720px]">
              {lessonPlans.map(plan => (
                <LessonCard
                  key={plan.id}
                  lesson={{
                    id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                    category: plan.category, description: plan.description, keywords: [],
                    seriesCount: 0, totalMinutes: 0, rating: plan.rating,
                    reviews: plan.review_count, lessonPlanCoins: plan.credits_required,
                    thumbnail: plan.image, background: plan.background || plan.image,
                    bundles: [], targetAudience: [], learningPoints: [],
                    certificateOnCompletion: plan.certificate_on_completion,
                  }}
                  progress={getPercentage(String(plan.id)) || undefined}
                  onClick={() => navigate(`/lesson/${plan.id}`)}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
