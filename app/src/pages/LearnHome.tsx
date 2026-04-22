import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchHeader from '../components/SearchHeader';
import SectionHeader from '../components/SectionHeader';
import BundleThumbnail from '../components/BundleThumbnail';
import ForYouCard from '../components/ForYouCard';
import LessonCard from '../components/LessonCard';
import PurchaseModal from '../components/PurchaseModal';
import { useHomepage } from '../hooks/useHomepage';
import { useProgress } from '../hooks/useProgress';
import { useBundleNavigation } from '../hooks/useBundleNavigation';
import { lessonUrl, bundleUrl } from '../utils/slug';

export default function LearnHome() {
  const navigate = useNavigate();
  const { forYou, plans, discoverBundles, isLoading } = useHomepage();
  const { getPercentage, getContinueWatching, removeFromContinueWatching } = useProgress();
  const { modalBundle, closeModal } = useBundleNavigation();

  const continueRef = useRef<HTMLDivElement>(null);
  const forYouRef = useRef<HTMLDivElement>(null);
  const lessonsRef = useRef<HTMLDivElement>(null);

  const continueWatching = getContinueWatching();

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

        {/* Desktop hero — compact, full-width bg */}
        <div className="hidden md:block bg-bg-secondary">
          <div className="container-content section-hero">
            <h1 className="text-[28px] lg:text-[32px] font-bold text-text-primary leading-tight font-sans">
              Start Learning
            </h1>
            <p className="type-body-default text-text-secondary mt-1.5">
              Explore courses, watch videos, and track your progress
            </p>
          </div>
        </div>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Continue Watching" onSeeAll={() => navigate('/viewall/continue')} scrollRef={continueRef} />
              <div ref={continueRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {continueWatching.map(item => {
                  const actions = [
                    { label: 'Remove', onClick: () => removeFromContinueWatching(item.id) },
                  ];
                  if (item.planId) {
                    actions.push({ label: 'Go to lessons', onClick: () => navigate(lessonUrl(Number(item.planId))) });
                  }
                  return (
                    <BundleThumbnail
                      key={`${item.type}-${item.id}`}
                      thumbnail={item.thumbnail}
                      alt={item.chapterTitle}
                      size="big"
                      progress={item.percentage}
                      onClick={() => navigate(item.type === 'lesson' ? lessonUrl(Number(item.id)) : bundleUrl(Number(item.id)))}
                      menuActions={actions}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* For You */}
        {forYou.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="For You" onSeeAll={() => navigate('/viewall/foryou')} scrollRef={forYouRef} />
              <div ref={forYouRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {forYou.map((video, index) => (
                  <ForYouCard
                    key={video.id}
                    video={{
                      id: video.id,
                      type: 'foryou',
                      title: video.title,
                      fullTitle: video.title,
                      category: '',
                      description: '',
                      keywords: [],
                      seriesCount: 0,
                      totalMinutes: video.video.durationMinutes,
                      thumbnail: video.video.image,
                      videoUrl: video.video.source,
                    }}
                    onClick={() => navigate(`/foryou/${index}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Explore Lessons */}
        {plans.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Explore Lessons" onSeeAll={() => navigate('/viewall/lessons')} scrollRef={lessonsRef} />
              <div ref={lessonsRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {plans.map(plan => (
                  <LessonCard
                    key={plan.id}
                    lesson={{
                      id: plan.id,
                      type: 'lesson',
                      title: plan.title,
                      fullTitle: plan.title,
                      category: '',
                      description: plan.description,
                      keywords: [],
                      seriesCount: plan.bundles.length,
                      totalMinutes: 0,
                      rating: 0,
                      reviews: 0,
                      lessonPlanCoins: plan.creditsRequired,
                      thumbnail: plan.image,
                      background: plan.image,
                      bundles: plan.bundles as any[],
                      targetAudience: [],
                      learningPoints: plan.learnings || [],
                      certificateOnCompletion: true,
                    }}
                    onClick={() => navigate(lessonUrl(plan.id, plan.title))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OpenAcademy Originals — one card per bundle, first series image */}
        {discoverBundles.length > 0 && (
          <div className="bg-bg-base section">
            <div className="container-content">
              <h2 className="type-display-large text-text-brand section-heading-gap">
                OpenAcademy Originals
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                {discoverBundles.map(db => (
                  <BundleThumbnail
                    key={db.bundleId}
                    thumbnail={db.allSeries[0]?.image || ''}
                    alt={db.bundleTitle}
                    size="big"
                    progress={getPercentage(String(db.bundleId)) || undefined}
                    onClick={() => navigate(bundleUrl(db.bundleId, db.bundleTitle))}
                    className="w-full h-auto aspect-[3/4]"
                  />
                ))}
              </div>

            </div>
          </div>
        )}

        <div className="hidden md:block h-20" />
      </div>

      {modalBundle && (
        <PurchaseModal bundle={modalBundle} isOpen={true} onClose={closeModal} />
      )}
    </div>
  );
}
