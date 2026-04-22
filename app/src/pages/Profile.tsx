import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, BookOpen, Clock, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import { useLikes } from '../hooks/useLikes';
import SectionHeader from '../components/SectionHeader';
import BundleThumbnail from '../components/BundleThumbnail';
import OAButton from '../components/OAButton';
import CoinIcon from '../components/CoinIcon';
import { apiPost } from '../services/api';
import { getBundles, getPlans, type OABundle, type OAPlan } from '../services/oa-api';
import { lessonUrl, bundleUrl } from '../utils/slug';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { getContinueWatching, removeFromContinueWatching } = useProgress();
  const { credits, purchasedBundleIds } = useCredits();
  const { likes } = useLikes();

  const continueWatching = getContinueWatching();
  const continueRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  // Fetch user's purchased bundles/plans from API + locally purchased bundles
  const [myBundles, setMyBundles] = useState<OABundle[]>([]);
  const [myPlans, setMyPlans] = useState<OAPlan[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setProfileLoading(true);
    apiPost<{ bundles: { id: number }[]; plans: { id: number }[]; continueWatch: any[]; watchAgain: any[] }>('/v3/profile/home', {})
      .then(async (res) => {
        // Merge API bundle IDs with locally purchased IDs
        const apiBundleIds = (res.bundles || []).map(b => b.id);
        const allBundleIds = [...new Set([...apiBundleIds, ...purchasedBundleIds])];
        const planIds = (res.plans || []).map(p => p.id);
        const [resolvedBundles, resolvedPlans] = await Promise.all([
          allBundleIds.length > 0 ? getBundles(allBundleIds) : Promise.resolve([]),
          planIds.length > 0 ? getPlans(planIds) : Promise.resolve([]),
        ]);
        setMyBundles(resolvedBundles);
        setMyPlans(resolvedPlans);
      })
      .catch(async () => {
        // API failed but we still have local purchases
        if (purchasedBundleIds.length > 0) {
          try {
            const resolved = await getBundles(purchasedBundleIds);
            setMyBundles(resolved);
          } catch {}
        }
      })
      .finally(() => setProfileLoading(false));
  }, [isLoggedIn, purchasedBundleIds.length]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full bg-bg-base">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6 max-w-[300px]">
            <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center">
              <Settings size={32} className="text-text-tertiary" />
            </div>
            <h2 className="type-headline-large text-text-primary text-center">Sign in to see your profile</h2>
            <p className="type-body-default text-text-secondary text-center">Track your progress, manage credits, and continue learning.</p>
            <OAButton variant="primary" size="medium" fullWidth onClick={() => navigate('/login')}>Sign In</OAButton>
          </div>
        </div>
      </div>
    );
  }

  const recentLikes = [...likes].sort((a, b) => b.likedAt - a.likedAt).slice(0, 10);
  const hasLearnings = myBundles.length > 0 || myPlans.length > 0;

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">

        {/* Header */}
        <div className="bg-bg-secondary">
          <div className="container-content py-8 md:py-10">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-action-secondary flex items-center justify-center shrink-0">
                <span className="text-[24px] md:text-[32px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="type-headline-large text-text-primary md:text-[24px]">{user?.name}</h1>
                <p className="type-description text-text-secondary mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-bg-base flex items-center justify-center shrink-0">
                <Settings size={18} className="text-text-secondary" />
              </button>
            </div>

            {/* Credits bar */}
            <div className="flex items-center gap-3 mt-5 p-4 bg-bg-base rounded-[12px]">
              <div className="w-8 h-8 rounded-full bg-accent-yellow/20 flex items-center justify-center">
                <CoinIcon size={16} />
              </div>
              <div className="flex-1">
                <span className="type-headline-medium text-text-primary">{credits}</span>
                <span className="type-description text-text-tertiary ml-1.5">credits</span>
              </div>
              <button onClick={() => navigate('/subscription')} className="type-button text-action-secondary text-[13px]">
                Top Up
              </button>
            </div>
          </div>
        </div>

        <div className="container-content">

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="section-tight">
              <SectionHeader title="Continue Watching" onSeeAll={() => navigate('/viewall/continue')} scrollRef={continueRef} />
              <div ref={continueRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {continueWatching.map(item => {
                  const actions = [{ label: 'Remove', onClick: () => removeFromContinueWatching(item.id) }];
                  if (item.planId) actions.push({ label: 'Go to lessons', onClick: () => navigate(lessonUrl(Number(item.planId))) });
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
          )}

          {/* My Learning */}
          <div className="section-tight">
            <h2 className="type-headline-large text-text-primary mb-4">My Learning</h2>
            {profileLoading ? (
              <p className="type-body-default text-text-tertiary py-4">Loading...</p>
            ) : hasLearnings ? (
              <div className="flex flex-col gap-2">
                {/* Plans (lesson plans) */}
                {myPlans.map(plan => (
                  <button
                    key={`plan-${plan.id}`}
                    onClick={() => navigate(lessonUrl(plan.id, plan.title))}
                    className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                  >
                    <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-bg-base shrink-0">
                      <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="type-headline-small text-text-primary truncate">{plan.title}</p>
                      <p className="type-pre-text text-text-tertiary mt-0.5">{plan.bundles.length} bundles</p>
                    </div>
                    <ChevronRight size={16} className="text-text-tertiary shrink-0" />
                  </button>
                ))}
                {/* Bundles */}
                {myBundles.map(bundle => (
                  <button
                    key={`bundle-${bundle.id}`}
                    onClick={() => navigate(bundleUrl(bundle.id, bundle.title))}
                    className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                  >
                    <div className="w-14 h-14 rounded-[8px] bg-action-secondary/10 flex items-center justify-center shrink-0">
                      <Play size={18} className="text-action-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="type-headline-small text-text-primary truncate">{bundle.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={12} className="text-text-tertiary" />
                        <span className="type-pre-text text-text-tertiary">{bundle.durationMinutes} mins</span>
                        <span className="type-pre-text text-text-tertiary">·</span>
                        <span className="type-pre-text text-text-tertiary">{(bundle.series || []).length} chapters</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-text-tertiary shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col items-center gap-3">
                <BookOpen size={32} className="text-text-tertiary" />
                <p className="type-body-default text-text-tertiary">No courses yet</p>
                <p className="type-description text-text-tertiary text-center">Browse the Discover page to find courses and start learning.</p>
                <OAButton variant="blue" size="medium" onClick={() => navigate('/discover')}>Explore Courses</OAButton>
              </div>
            )}
          </div>

          {/* My Likes — recent preview */}
          <div className="section-tight">
            <SectionHeader title="My Likes" onSeeAll={() => navigate('/liked')} scrollRef={recentRef} />
            {recentLikes.length > 0 ? (
              <div ref={recentRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                {recentLikes.map(video => (
                  <button
                    key={video.id}
                    onClick={() => navigate(`/foryou/0`)}
                    className="card-interactive relative w-[100px] h-[178px] md:w-[120px] md:h-[213px] rounded-[8px] overflow-hidden shrink-0"
                  >
                    <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col items-center gap-3 mt-4">
                <Heart size={32} className="text-text-tertiary" />
                <p className="type-body-default text-text-tertiary">No liked videos yet</p>
                <p className="type-description text-text-tertiary text-center">Tap the heart on For You videos to save them here.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
