import { useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchHeader from '../components/SearchHeader';
import SectionHeader from '../components/SectionHeader';
import BundleThumbnail from '../components/BundleThumbnail';
import ForYouCard from '../components/ForYouCard';
import LessonCard from '../components/LessonCard';
import PurchaseModal from '../components/PurchaseModal';
import ViewAllBundlesCard from '../components/ViewAllBundlesCard';
import { HomepageSkeleton } from '../components/Skeleton';
import { useHomepage, type DiscoverBundle } from '../hooks/useHomepage';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import { lessonUrl, bundleUrl, playUrl } from '../utils/slug';
import type { ApiBundleSummary } from '../services/types';

/** Convert a DiscoverBundle to the ApiBundleSummary shape for PurchaseModal */
function toBundleSummary(db: DiscoverBundle): ApiBundleSummary {
  return {
    id: db.bundleId,
    plan_id: null,
    title: db.bundleTitle,
    subtitle: '',
    description: db.bundleDescription,
    category: '',
    credits_required: db.creditsRequired,
    duration_minutes: db.durationMinutes,
    is_free: db.creditsRequired === 0,
    thumbnail: db.allSeries[0]?.image || '',
    chapter_count: db.chapterCount,
    creator: db.creator ? { id: db.creator.id, name: db.creator.name, avatar: db.creator.avatar, job_title: db.creator.jobTitle, bio: db.creator.bio } : null,
  };
}

export default function LearnHome() {
  const navigate = useNavigate();
  const { forYou, plans, discoverBundles, isLoading } = useHomepage();
  const { getPercentage, getContinueWatching, removeFromContinueWatching } = useProgress();
  const { isBundleAccessible } = useCredits();
  const [modalBundle, setModalBundle] = useState<ApiBundleSummary | null>(null);

  const continueRef = useRef<HTMLDivElement>(null);
  const forYouRef = useRef<HTMLDivElement>(null);
  const lessonsRef = useRef<HTMLDivElement>(null);

  const continueWatching = getContinueWatching();

  // Sort bundles by most recent (highest ID first), take first 6 for display + next 3 for "View All" card
  const sortedBundles = useMemo(() => {
    return [...discoverBundles].sort((a, b) => b.bundleId - a.bundleId);
  }, [discoverBundles]);
  const displayBundles = sortedBundles.slice(0, 6);
  const viewAllThumbnails = sortedBundles.slice(6, 9).map(db => db.allSeries[0]?.image || '').filter(Boolean);

  const handleBundleClick = (db: DiscoverBundle) => {
    const accessible = isBundleAccessible(db.bundleId, db.creditsRequired === 0);
    if (accessible) {
      navigate(bundleUrl(db.bundleId, db.bundleTitle));
    } else {
      setModalBundle(toBundleSummary(db));
    }
  };

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

        {/* Skeleton while loading */}
        {isLoading && <HomepageSkeleton />}

        {/* Continue Watching */}
        {!isLoading && continueWatching.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Continue Watching" onSeeAll={() => navigate('/viewall/continue')} scrollRef={continueRef} />
              <div ref={continueRef} className="flex scroll-gap overflow-x-auto hide-scrollbar scroll-row mt-4 -mx-6 px-6 md:mx-0 md:px-0">
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
                      alt={`${item.title} — ${item.chapterTitle}`}
                      size="big"
                      progress={item.percentage}
                      onClick={() => navigate(playUrl(Number(item.id), 0, item.title))}
                      menuActions={actions}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* For You */}
        {!isLoading && forYou.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="For You" onSeeAll={() => navigate('/viewall/foryou')} scrollRef={forYouRef} />
              <div ref={forYouRef} className="flex scroll-gap overflow-x-auto hide-scrollbar scroll-row mt-4 -mx-6 px-6 md:mx-0 md:px-0">
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
        {!isLoading && plans.length > 0 && (
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              <SectionHeader title="Explore Lessons" onSeeAll={() => navigate('/viewall/lessons')} scrollRef={lessonsRef} />
              <div ref={lessonsRef} className="flex scroll-gap overflow-x-auto hide-scrollbar scroll-row mt-4 -mx-6 px-6 md:mx-0 md:px-0">
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

        {/* OpenAcademy Originals — 6 recent bundles + desktop "View All" card */}
        {displayBundles.length > 0 && (
          <div className="bg-bg-base section">
            <div className="container-content">
              <SectionHeader
                title="OpenAcademy Originals"
                titleClassName="type-display-large text-text-brand"
                onSeeAll={() => navigate('/discover#bundles')}
                seeAllClassName="lg:hidden"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap mt-4">
                {displayBundles.map(db => {
                  const pct = getPercentage(String(db.bundleId));
                  const accessible = isBundleAccessible(db.bundleId, db.creditsRequired === 0);
                  return (
                    <BundleThumbnail
                      key={db.bundleId}
                      thumbnail={db.allSeries[0]?.image || ''}
                      alt={db.bundleTitle}
                      size="big"
                      progress={pct || undefined}
                      price={!accessible && !pct ? (db.creditsRequired === 0 ? 'free' : db.creditsRequired) : undefined}
                      onClick={() => handleBundleClick(db)}
                      className="w-full h-auto aspect-[2/3]"
                    />
                  );
                })}
                {/* Desktop-only "View All Bundles" card — spans 2 columns */}
                {viewAllThumbnails.length > 0 && (
                  <div className="hidden lg:block lg:col-span-2">
                    <ViewAllBundlesCard thumbnails={viewAllThumbnails} />
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        <div className="hidden md:block h-20" />
      </div>

      {modalBundle && (
        <PurchaseModal bundle={modalBundle} isOpen={true} onClose={() => setModalBundle(null)} />
      )}
    </div>
  );
}
