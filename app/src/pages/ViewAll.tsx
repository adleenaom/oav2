import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BundleThumbnail from '../components/BundleThumbnail';
import ForYouCard from '../components/ForYouCard';
import LessonCard from '../components/LessonCard';
import Breadcrumb from '../components/Breadcrumb';
import { SkeletonGrid } from '../components/Skeleton';
import { useHomepage } from '../hooks/useHomepage';
import { useProgress } from '../hooks/useProgress';
import { getLearnListings, getDailyVideos, type OADailyVideo } from '../services/oa-api';
import { lessonUrl, bundleUrl } from '../utils/slug';

type ViewType = 'continue' | 'foryou' | 'lessons';

const titles: Record<ViewType, string> = {
  continue: 'Continue Watching',
  foryou: 'For You',
  lessons: 'Explore Lessons',
};

/** Dedicated hook for ForYou videos — independent of useHomepage */
function useForYouVideos() {
  const [videos, setVideos] = useState<OADailyVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const listings = await getLearnListings(20);
        const ids = (listings.forYou || []).map(r => r.id);
        const resolved = ids.length > 0 ? await getDailyVideos(ids) : [];
        if (!cancelled) setVideos(resolved);
      } catch (e) {
        console.warn('Failed to load ForYou videos:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { videos, loading };
}

export default function ViewAll() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { getPercentage, getContinueWatching, removeFromContinueWatching } = useProgress();
  const { plans, isLoading: homepageLoading } = useHomepage();
  const { videos: forYou, loading: forYouLoading } = useForYouVideos();

  const viewType = (type as ViewType) || 'foryou';
  const title = titles[viewType] || 'View All';

  const continueWatching = getContinueWatching();

  const isLoading = viewType === 'foryou' ? forYouLoading : homepageLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-bg-base">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-bg-secondary"><div className="container-content py-8"><div className="animate-pulse bg-bg-secondary h-8 w-40 rounded" /></div></div>
          <div className="container-content section-tight"><SkeletonGrid /></div>
        </div>
      </div>
    );
  }

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
              {continueWatching.map(item => {
                const actions = [
                  { label: 'Remove', onClick: () => removeFromContinueWatching(item.id) },
                  { label: 'Go to bundle', onClick: () => navigate(bundleUrl(Number(item.id), item.title)) },
                ];
                if (item.planId) {
                  actions.push({ label: 'Go to lesson', onClick: () => navigate(lessonUrl(Number(item.planId))) });
                }
                return (
                  <BundleThumbnail
                    key={`${item.type}-${item.id}`}
                    thumbnail={item.thumbnail}
                    alt={item.chapterTitle}
                    size="big"
                    progress={item.percentage}
                    onClick={() => navigate(item.type === 'lesson' ? lessonUrl(Number(item.id)) : bundleUrl(Number(item.id)))}
                    className="w-full h-auto aspect-[2/3]"
                    menuActions={actions}
                  />
                );
              })}
            </div>
          )}

          {/* For You — grid using ForYouCard */}
          {viewType === 'foryou' && (
            <div className="grid grid-cols-3 gap-2 px-6 py-4">
              {forYou.map((video, index) => (
                <ForYouCard
                  key={video.id}
                  video={{
                    id: video.id, type: 'foryou', title: video.title, fullTitle: video.title,
                    category: '', description: '', keywords: [],
                    seriesCount: 0, totalMinutes: video.video.durationMinutes,
                    thumbnail: video.video.image, videoUrl: video.video.source,
                  }}
                  onClick={() => navigate(`/foryou/${index}`)}
                  className="w-full h-auto aspect-[2/3]"
                />
              ))}
            </div>
          )}

          {/* Lessons — 1 column list */}
          {viewType === 'lessons' && (
            <div className="flex flex-col gap-4 px-6 py-4">
              {plans.map(plan => (
                <LessonCard
                  key={plan.id}
                  lesson={{
                    id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                    category: '', description: plan.description, keywords: [],
                    seriesCount: plan.bundles.length, totalMinutes: 0, rating: 0,
                    reviews: 0, lessonPlanCoins: plan.creditsRequired,
                    thumbnail: plan.image, background: plan.image,
                    bundles: plan.bundles as any[], targetAudience: [], learningPoints: plan.learnings || [],
                    certificateOnCompletion: true,
                  }}
                  progress={getPercentage(String(plan.id)) || undefined}
                  onClick={() => navigate(lessonUrl(plan.id, plan.title))}
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
            <Breadcrumb items={[
              { label: 'Home', path: '/' },
              { label: title },
            ]} />
            <h1 className="type-display-large text-text-primary">{title}</h1>
          </div>
        </div>

        <div className="container-content section-tight">
          {/* Continue Watching — responsive 3:4 grid */}
          {viewType === 'continue' && (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {continueWatching.map(item => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigate(item.type === 'lesson' ? lessonUrl(Number(item.id)) : bundleUrl(Number(item.id)))}
                  className="card-interactive relative aspect-[2/3] rounded-[8px] overflow-hidden"
                >
                  <img src={item.thumbnail} alt={item.chapterTitle} className="absolute inset-0 w-full h-full object-cover" />
                  {item.percentage > 0 && item.percentage < 100 && (
                    <>
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="type-headline-medium text-text-on-dark">{item.percentage}%</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-[7px]">
                        <div className="bg-accent-blue h-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* For You — responsive grid using ForYouCard */}
          {viewType === 'foryou' && (
            <>
              {forYou.length > 0 ? (
                <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {forYou.map((video, index) => (
                    <ForYouCard
                      key={video.id}
                      video={{
                        id: video.id, type: 'foryou', title: video.title, fullTitle: video.title,
                        category: '', description: '', keywords: [],
                        seriesCount: 0, totalMinutes: video.video.durationMinutes,
                        thumbnail: video.video.image, videoUrl: video.video.source,
                      }}
                      onClick={() => navigate(`/foryou/${index}`)}
                      className="w-full h-auto aspect-[2/3]"
                    />
                  ))}
                </div>
              ) : (
                <p className="type-body-default text-text-tertiary text-center py-12">No videos available</p>
              )}
            </>
          )}

          {/* Lessons — responsive card grid */}
          {viewType === 'lessons' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plans.map(plan => (
                <LessonCard
                  key={plan.id}
                  lesson={{
                    id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                    category: '', description: plan.description, keywords: [],
                    seriesCount: plan.bundles.length, totalMinutes: 0, rating: 0,
                    reviews: 0, lessonPlanCoins: plan.creditsRequired,
                    thumbnail: plan.image, background: plan.image,
                    bundles: plan.bundles as any[], targetAudience: [], learningPoints: plan.learnings || [],
                    certificateOnCompletion: true,
                  }}
                  progress={getPercentage(String(plan.id)) || undefined}
                  onClick={() => navigate(lessonUrl(plan.id, plan.title))}
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
