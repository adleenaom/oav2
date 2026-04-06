import { useNavigate } from 'react-router-dom';
import SearchHeader from '../components/SearchHeader';
import SectionHeader from '../components/SectionHeader';
import BundleThumbnail from '../components/BundleThumbnail';
import ForYouCard from '../components/ForYouCard';
import LessonCard from '../components/LessonCard';
import PromotionBanner from '../components/PromotionBanner';
import OAButton from '../components/OAButton';
import { useApi } from '../hooks/useApi';
import { useProgress } from '../hooks/useProgress';
import type { ApiHomeListings } from '../services/types';

export default function LearnHome() {
  const navigate = useNavigate();
  const { data, isLoading } = useApi<ApiHomeListings>('/listings/home');
  const { getPercentage, getContinueWatching } = useProgress();

  const continueWatching = getContinueWatching();

  const forYouVideos = data?.for_you ?? [];
  const standaloneBundles = data?.originals ?? [];
  const lessonPlans = data?.lessons ?? [];
  const banners = data?.banners ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="type-body-default text-text-tertiary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[103px] md:pb-0">

        {/* Mobile search header */}
        <div className="md:hidden">
          <SearchHeader />
        </div>

        {/* Desktop hero */}
        <div className="hidden md:block bg-bg-secondary">
          <div className="container-content section-hero">
            <h1 className="text-[36px] lg:text-[40px] font-bold text-text-primary leading-tight font-sans">
              Start Learning
            </h1>
            <p className="type-title-medium text-text-secondary mt-3 max-w-[480px]">
              Explore courses, watch videos, and track your progress
            </p>
          </div>
        </div>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Continue Watching" onSeeAll={() => navigate('/viewall/continue')} />
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {continueWatching.map(item => (
                  <BundleThumbnail
                    key={`${item.type}-${item.id}`}
                    thumbnail={item.thumbnail}
                    alt={item.chapterTitle}
                    size="big"
                    progress={item.percentage}
                    onClick={() => navigate(item.type === 'lesson' ? `/lesson/${item.id}` : `/bundle/${item.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* For You */}
        {forYouVideos.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="For You" onSeeAll={() => navigate('/viewall/foryou')} />
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {forYouVideos.map((video, index) => (
                  <ForYouCard
                    key={video.id}
                    video={{
                      id: video.id,
                      type: 'foryou',
                      title: video.title,
                      fullTitle: video.full_title,
                      category: video.category,
                      description: video.description,
                      keywords: [],
                      seriesCount: video.series_count,
                      totalMinutes: video.total_minutes,
                      thumbnail: video.thumbnail,
                      videoUrl: video.video_url,
                    }}
                    onClick={() => navigate(`/foryou/${index}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Explore Lessons */}
        {lessonPlans.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Explore Lessons" onSeeAll={() => navigate('/viewall/lessons')} />
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {lessonPlans.map(plan => (
                  <LessonCard
                    key={plan.id}
                    lesson={{
                      id: plan.id,
                      type: 'lesson',
                      title: plan.title,
                      fullTitle: plan.title,
                      category: plan.category,
                      description: plan.description,
                      keywords: [],
                      seriesCount: 0,
                      totalMinutes: 0,
                      rating: plan.rating,
                      reviews: plan.review_count,
                      lessonPlanCoins: plan.credits_required,
                      thumbnail: plan.image,
                      background: plan.background,
                      bundles: [],
                      targetAudience: [],
                      learningPoints: [],
                      certificateOnCompletion: plan.certificate_on_completion,
                    }}
                    progress={getPercentage(String(plan.id)) || undefined}
                    onClick={() => navigate(`/lesson/${plan.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OpenAcademy Originals */}
        {standaloneBundles.length > 0 && (
          <div className="bg-bg-base section">
            <div className="container-content">
              <h2 className="type-display-large text-text-brand section-heading-gap">
                OpenAcademy Originals
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                {standaloneBundles.map(bundle => (
                  <BundleThumbnail
                    key={bundle.id}
                    thumbnail={bundle.thumbnail}
                    alt={bundle.title}
                    size="big"
                    progress={getPercentage(String(bundle.id)) || undefined}
                    price={bundle.is_free ? 'free' : bundle.credits_required}
                    onClick={() => navigate(`/bundle/${bundle.id}`)}
                    className="w-full h-auto aspect-[3/4]"
                  />
                ))}
              </div>

              <div className="flex justify-center mt-8 md:mt-10">
                <OAButton variant="primary" size="medium">View More</OAButton>
              </div>
            </div>
          </div>
        )}

        {/* Don't Miss Out */}
        {banners.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Don't Miss Out!" />
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {banners.map(banner => (
                  <PromotionBanner
                    key={banner.id}
                    title={banner.title}
                    subtitle=""
                    image={banner.image}
                    color={banner.color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="hidden md:block h-20" />
      </div>
    </div>
  );
}
