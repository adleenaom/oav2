import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import { useLikes } from '../hooks/useLikes';
import SectionHeader from '../components/SectionHeader';
import BundleThumbnail from '../components/BundleThumbnail';
import OAButton from '../components/OAButton';
import CoinIcon from '../components/CoinIcon';
import ChaptersRow from '../components/ChaptersRow';
import { apiPost } from '../services/api';
import { getBundles, getPlans, type OABundle, type OAPlan } from '../services/oa-api';
import { lessonUrl, bundleUrl, playUrl } from '../utils/slug';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { getContinueWatching, removeFromContinueWatching } = useProgress();
  const { credits, purchasedBundleIds } = useCredits();
  const { likes } = useLikes();

  const continueWatching = getContinueWatching();
  const continueRef = useRef<HTMLDivElement>(null);

  // Fetch user's purchased bundles/plans from API + locally purchased bundles
  const [myBundles, setMyBundles] = useState<OABundle[]>([]);
  const [myPlans, setMyPlans] = useState<OAPlan[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setProfileLoading(true);
    apiPost<{ bundles: { id: number }[]; plans: { id: number }[] }>('/v3/profile/home', {})
      .then(async (res) => {
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
        if (purchasedBundleIds.length > 0) {
          try { setMyBundles(await getBundles(purchasedBundleIds)); } catch {}
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

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">

        {/* Header — user info */}
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

            {/* Quick actions row */}
            <div className="flex gap-3 mt-5">
              {/* Credits + actions */}
              <div className="flex-1 flex items-center gap-4 p-4 bg-bg-base rounded-[12px]">
                <div className="flex items-center gap-2">
                  <CoinIcon size={20} />
                  <span className="type-headline-medium text-text-primary">{credits}</span>
                  <span className="type-description text-text-tertiary">credits</span>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <button onClick={() => navigate('/credit-history')} className="type-headline-small text-text-primary hover:text-action-secondary transition-colors">
                    Credit history
                  </button>
                  <button onClick={() => navigate('/subscription')} className="type-headline-small text-action-secondary hover:underline">
                    Top Up
                  </button>
                </div>
              </div>

              {/* My likes */}
              <button
                onClick={() => navigate('/liked')}
                className="flex items-center gap-3 px-5 bg-bg-base rounded-[12px] hover:bg-gray-4/20 transition-colors shrink-0"
              >
                <Heart size={18} className="text-text-secondary" />
                <span className="type-headline-small text-text-primary">My likes</span>
                {likes.length > 0 && (
                  <span className="type-description text-text-tertiary">({likes.length})</span>
                )}
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
          )}

          {/* My Learning — Bundles */}
          <div className="section-tight">
            <h2 className="type-headline-large text-text-primary mb-4">Bundles</h2>
            {profileLoading ? (
              <p className="type-body-default text-text-tertiary py-4">Loading...</p>
            ) : myBundles.length > 0 ? (
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:overflow-visible">
                {myBundles.map(bundle => (
                  <div
                    key={bundle.id}
                    className="shrink-0 w-[300px] md:w-auto bg-bg-secondary rounded-[16px] overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex flex-col gap-2">
                      <h3 className="type-headline-small text-text-primary truncate">{bundle.title}</h3>
                      {/* Chapter thumbnails row */}
                      <ChaptersRow bundleId={bundle.id} size="small" />
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => navigate(bundleUrl(bundle.id, bundle.title))}
                        className="w-full py-2.5 bg-action-primary text-white type-button rounded-[8px] hover:bg-[#333] transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col items-center gap-3">
                <BookOpen size={32} className="text-text-tertiary" />
                <p className="type-body-default text-text-tertiary">No bundles yet</p>
                <OAButton variant="blue" size="medium" onClick={() => navigate('/discover')}>Explore</OAButton>
              </div>
            )}
          </div>

          {/* My Learning — Lessons */}
          <div className="section-tight">
            <h2 className="type-headline-large text-text-primary mb-4">Lessons</h2>
            {profileLoading ? (
              <p className="type-body-default text-text-tertiary py-4">Loading...</p>
            ) : myPlans.length > 0 ? (
              <div className="flex flex-col gap-4">
                {myPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => navigate(lessonUrl(plan.id, plan.title))}
                    className="flex gap-4 p-4 rounded-[16px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left w-full"
                  >
                    {/* Lesson thumbnail */}
                    <div className="w-[120px] h-[160px] md:w-[140px] md:h-[187px] rounded-[10px] overflow-hidden bg-bg-base shrink-0 relative">
                      <img src={plan.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2 py-1">
                      <p className="type-headline-medium text-text-primary">{plan.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="type-pre-text text-text-tertiary">{plan.bundles.length} bundles</span>
                        <span className="type-pre-text text-text-tertiary">·</span>
                        <span className="type-pre-text text-text-tertiary">{plan.duration}</span>
                      </div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2 bg-action-primary text-white type-button rounded-[8px] px-4 py-2.5 justify-center w-fit">
                        Resume Learning
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col items-center gap-3">
                <BookOpen size={32} className="text-text-tertiary" />
                <p className="type-body-default text-text-tertiary">No lessons yet</p>
                <OAButton variant="blue" size="medium" onClick={() => navigate('/discover')}>Explore</OAButton>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
