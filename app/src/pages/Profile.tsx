import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, LogOut, CreditCard, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import { useApi } from '../hooks/useApi';
import OAButton from '../components/OAButton';
import BundleThumbnail from '../components/BundleThumbnail';
import type { ApiBundleSummary } from '../services/types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { getContinueWatching } = useProgress();
  const { credits, purchasedBundleIds } = useCredits();

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

  const continueWatching = getContinueWatching();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        {/* Header */}
        <div className="bg-bg-secondary">
          <div className="container-content py-8 md:py-12">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-action-secondary flex items-center justify-center shrink-0">
                <span className="text-[24px] md:text-[32px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="type-headline-large text-text-primary md:text-[24px]">{user?.name}</h1>
                <p className="type-description text-text-secondary mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-4 h-4 rounded-full bg-accent-yellow" />
                  <span className="type-headline-small text-text-primary">{credits}</span>
                  <span className="type-description text-text-tertiary">credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-content">
          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="section-tight">
              <h2 className="type-headline-large text-text-primary mb-4">Continue Watching</h2>
              <div className="flex scroll-gap overflow-x-auto hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {continueWatching.map(item => (
                  <BundleThumbnail
                    key={`${item.type}-${item.id}`}
                    thumbnail={item.thumbnail}
                    alt={item.chapterTitle}
                    size="big"
                    progress={item.percentage}
                    onClick={() => navigate(item.type === 'lesson' ? `/lesson/${item.id}` : `/play/${item.id}/0`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* My Learning */}
          <div className="section-tight">
            <h2 className="type-headline-large text-text-primary mb-4">My Learning</h2>
            {purchasedBundleIds.length > 0 ? (
              <div className="flex flex-col gap-3">
                {purchasedBundleIds.map(bundleId => (
                  <MyLearningItem key={bundleId} bundleId={bundleId} navigate={navigate} />
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 text-center">
                <BookOpen size={32} className="text-text-tertiary mx-auto mb-3" />
                <p className="type-body-default text-text-tertiary">No bundles purchased yet</p>
                <p className="type-description text-text-tertiary mt-1">Browse the Discover page to find courses.</p>
              </div>
            )}
          </div>

          {/* Purchase History */}
          <div className="section-tight">
            <h2 className="type-headline-large text-text-primary mb-4">Purchase History</h2>
            {purchasedBundleIds.length > 0 ? (
              <div className="flex flex-col gap-2">
                {purchasedBundleIds.map((bundleId, i) => (
                  <PurchaseHistoryItem key={bundleId} bundleId={bundleId} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-[12px] p-6 text-center">
                <CreditCard size={32} className="text-text-tertiary mx-auto mb-3" />
                <p className="type-body-default text-text-tertiary">No transactions yet</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="section-tight">
            <div className="flex flex-col gap-2">
              {[
                { icon: Heart, label: 'Liked Content', path: '/liked' },
                { icon: CreditCard, label: 'Top Up Credits', path: '/subscription' },
                { icon: Settings, label: 'Settings', path: '/settings' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                >
                  <item.icon size={20} className="text-text-secondary shrink-0" />
                  <span className="type-body-default text-text-primary flex-1">{item.label}</span>
                  <ChevronRight size={16} className="text-text-tertiary" />
                </button>
              ))}

              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary hover:bg-accent-magenta/10 transition-colors text-left mt-4"
              >
                <LogOut size={20} className="text-accent-magenta shrink-0" />
                <span className="type-body-default text-accent-magenta">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- My Learning item — fetches bundle data ---- */

function MyLearningItem({ bundleId, navigate }: { bundleId: number; navigate: (p: string) => void }) {
  const { data: bundle } = useApi<ApiBundleSummary>(`/bundles/${bundleId}`);
  if (!bundle) return null;

  return (
    <button
      onClick={() => navigate(`/play/${bundleId}/0`)}
      className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
    >
      <img src={bundle.thumbnail} alt="" className="w-16 h-16 rounded-[8px] object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="type-tags text-text-category">{bundle.category}</span>
        <p className="type-headline-small text-text-primary mt-0.5 truncate">{bundle.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Clock size={12} className="text-text-tertiary" />
          <span className="type-pre-text text-text-tertiary">{bundle.duration_minutes} mins</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-text-tertiary shrink-0" />
    </button>
  );
}

/* ---- Purchase History item — mock transaction ---- */

function PurchaseHistoryItem({ bundleId, index }: { bundleId: number; index: number }) {
  const { data: bundle } = useApi<ApiBundleSummary>(`/bundles/${bundleId}`);
  if (!bundle) return null;

  // Mock transaction data
  const methods = ['In-app transaction', 'Gift code', 'Stripe'];
  const method = methods[index % methods.length];
  const date = new Date(Date.now() - index * 86400000 * 3).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary text-left">
      <div className="flex-1 min-w-0">
        <p className="type-headline-small text-text-primary truncate">{bundle.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="type-pre-text text-text-tertiary">{date}</span>
          <span className="type-pre-text text-text-tertiary">•</span>
          <span className="type-pre-text text-text-tertiary">{method}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <div className="w-3 h-3 rounded-full bg-accent-yellow" />
        <span className="type-headline-small text-text-primary">{bundle.is_free ? 'Free' : bundle.credits_required}</span>
      </div>
    </div>
  );
}
