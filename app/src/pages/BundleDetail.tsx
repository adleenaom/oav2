import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Search, BookOpen, Download, Check } from 'lucide-react';
import OAButton from '../components/OAButton';
import PurchaseModal from '../components/PurchaseModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBundleDetail } from '../hooks/useOAData';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import { useState } from 'react';

type Tab = 'about' | 'chapters';

export default function BundleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBundleProgress, getBundlePercentage } = useProgress();
  const { credits, isBundleAccessible } = useCredits();
  const { bundle: oaBundle, seriesList, resolvedChapters, isLoading } = useBundleDetail(id ? Number(id) : null);

  const bundle = oaBundle ? {
    id: oaBundle.id,
    planId: oaBundle.plan?.id || null,
    title: oaBundle.title,
    subtitle: `Bundle ${oaBundle.seqNo || 1}`,
    description: oaBundle.description,
    category: '',
    price: oaBundle.creditsRequired,
    isFree: oaBundle.creditsRequired === 0,
    thumbnail: seriesList[0]?.image || '',
    totalMinutes: oaBundle.durationMinutes,
    creator: null as { name: string; avatar: string; title: string; bio: string } | null,
    chapters: resolvedChapters,
    resources: [] as { id: number; title: string; url: string }[],
  } : null;

  const progress = getBundleProgress(id || '');
  const percentage = getBundlePercentage(id || '');
  const completedChapters = progress?.completedChapters || [];
  const parentLesson = bundle?.planId ? { id: bundle.planId } : null;

  const [activeTab, setActiveTab] = useState<Tab>('chapters');
  const [purchaseError] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="type-body-default text-text-tertiary">Loading...</div></div>;
  }
  if (!bundle) { navigate('/'); return null; }

  const isInProgress = percentage > 0 && percentage < 100;
  const isCompleted = percentage === 100;
  const hasAccess = isBundleAccessible(bundle.id, bundle.isFree);

  const handlePlayChapter = (chapterId: string) => {
    if (!hasAccess) return;
    const idx = bundle.chapters.findIndex(c => String(c.id) === chapterId);
    navigate(`/play/${bundle.id}/${idx >= 0 ? idx : 0}`);
  };

  const handleCTA = () => {
    if (!hasAccess) {
      setShowPurchaseModal(true);
      return;
    }
    const first = bundle.chapters.find(c => !completedChapters.includes(String(c.id)));
    handlePlayChapter(String(first?.id || bundle.chapters[0]?.id));
  };


  const ctaLabel = !hasAccess
    ? `Unlock for ${bundle.price} coins`
    : isInProgress ? 'Resume Learning'
    : 'Watch First Video';

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* ===== MOBILE ===== */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px]">

          {/* Video player — vertical 9:16 like YouTube Shorts */}
          {/* Hero bg */}
          <div className="relative w-full h-[281px] overflow-hidden">
              <img src={bundle.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]" />
              <div className="absolute inset-0 bg-black/20" />
              {/* App bar */}
              <div className="absolute top-[53px] left-6 z-10">
                <button onClick={() => navigate(-1)} className="bg-black/50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <ChevronLeft size={13} className="text-text-on-dark" />
                  <span className="type-button text-text-on-dark">Back</span>
                </button>
              </div>
              {/* Credits badge */}
              <div className="absolute top-[52px] right-6 z-10">
                <div className="bg-bg-elevated border border-border-input rounded-lg p-2 flex items-center gap-0.5 h-[34px]">
                  <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                  <span className="font-semibold text-[14px] text-text-primary leading-[20px] font-sans">{credits}</span>
                </div>
              </div>
          </div>

          {/* ---- Floating title card with tabs ---- */}
          <div
            className={cn(
              "mx-5 bg-bg-elevated rounded-[16px] flex flex-col",
              '-mt-[160px] relative z-10'
            )}
            style={{ boxShadow: '0 0 24px rgba(0,0,0,0.12)' }}
          >
            {/* Card content */}
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="type-tags text-text-category">{bundle.category}</span>
                {/* Price / status */}
                {isInProgress && (
                  <span className="type-tags text-text-secondary bg-bg-secondary px-2 py-1 rounded">In-Progress</span>
                )}
                {isCompleted && (
                  <span className="type-tags text-accent-green bg-accent-green/10 px-2 py-1 rounded">Completed</span>
                )}
                {!isInProgress && !isCompleted && (
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                    <span className="font-semibold text-[14px] text-text-primary font-sans">
                      {bundle.isFree ? 'Free' : bundle.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="type-display-large text-text-primary">{bundle.title}</h1>
              <p className="type-body-default text-text-secondary">{bundle.description}</p>
            </div>

            {/* Tab bar (inside card) */}
            <div className="flex flex-col items-center">
              <div className="h-px w-full bg-border-default mx-6" />
              <div className="flex">
                {(['about', 'chapters'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative w-[150px] h-[58px] flex items-center justify-center"
                  >
                    <span className={cn(
                      'text-[14px] text-text-primary text-center font-sans',
                      activeTab === tab ? 'font-bold tracking-[-0.28px]' : 'font-normal'
                    )}>
                      {tab === 'about' ? 'What is this?' : `Chapters (${bundle.chapters.length})`}
                    </span>
                    {activeTab === tab && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-[87px] bg-text-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Tab content ---- */}
          {activeTab === 'about' && (
            <div className="flex flex-col">
              {/* Resources */}
              <div className="flex items-center gap-2 pl-4 pr-6 pt-6">
                <BookOpen size={20} className="text-text-primary" />
                <h2 className="type-display-medium text-text-primary">Resources</h2>
              </div>
              <div className="flex flex-col px-6 py-4">
                <button className="flex items-center justify-between py-2 w-full text-left">
                  <span className="type-body-default text-text-secondary">Reference Document</span>
                  <Download size={20} className="text-text-secondary" />
                </button>
                <button className="flex items-center justify-between py-2 w-full text-left">
                  <span className="type-body-default text-text-secondary">Intro to {bundle.title} Framework</span>
                  <Download size={20} className="text-text-secondary" />
                </button>
              </div>

              <div className="h-px bg-border-default" />

              {/* Creator */}
              {bundle.creator && (
                <div className="px-6 py-6 flex items-center gap-4">
                  <img src={bundle.creator.avatar} alt={bundle.creator.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="type-headline-small text-text-primary">{bundle.creator.name}</p>
                    <p className="type-description text-text-tertiary">{bundle.creator.title}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-border-default" />

              {/* Progress */}
              {percentage > 0 && (
                <div className="px-6 py-4">
                  <div className="bg-bg-secondary rounded-[12px] p-6 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="var(--color-gray-4)" strokeWidth="4" fill="none" />
                        <circle cx="24" cy="24" r="20" stroke="var(--color-brand-oa-blue)" strokeWidth="4" fill="none" strokeDasharray={`${(percentage / 100) * 125.6} 125.6`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center type-pre-text font-bold text-text-primary">{percentage}%</span>
                    </div>
                    <div>
                      <p className="type-description font-semibold text-text-primary">{completedChapters.length} of {bundle.chapters.length} chapters</p>
                      <p className="type-pre-text text-text-tertiary mt-0.5">{isCompleted ? 'All done!' : "Keep going!"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parent lesson link */}
              {parentLesson && (
                <>
                  <div className="h-px bg-border-default" />
                  <div className="bg-[#EDF1F8] p-6 flex flex-col gap-4">
                    <h3 className="type-display-medium text-text-primary">
                      This bundle is part of a lesson plan
                    </h3>
                    <OAButton variant="blue" size="medium" fullWidth onClick={() => navigate(`/lesson/${parentLesson.id}`)}>
                      View lesson plan
                    </OAButton>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="flex flex-col">
              {bundle.chapters.map((chapter, idx) => {
                const chId = String(chapter.id);
                const done = completedChapters.includes(chId);
                const isPlaying = false;
                const isLocked = !hasAccess && idx > 0;
                const hasSurvey = chapter.hasAssessment;
                const isViewed = done;
                const isGrayed = isViewed; // viewed chapters get gray-2 text

                return (
                  <div key={chapter.id}>
                    <div className={cn('px-6 py-4 flex flex-col gap-4', isPlaying && 'bg-accent-blue/5')}>
                      <button
                        onClick={() => !isLocked && handlePlayChapter(chId)}
                        className="flex flex-col gap-4 text-left w-full"
                        disabled={isLocked}
                      >
                        {/* Title row */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-4 min-w-0">
                            <h3 className={cn(
                              'type-display-medium truncate',
                              isGrayed ? 'text-text-tertiary' : 'text-text-primary'
                            )}>
                              {chapter.title}
                            </h3>
                            <ChevronRight size={12} className={cn(
                              'shrink-0',
                              isGrayed ? 'text-text-tertiary' : 'text-text-secondary'
                            )} />
                          </div>
                          <Heart
                            size={24}
                            className={cn(
                              done ? 'text-accent-magenta fill-accent-magenta'
                                : isGrayed ? 'text-text-tertiary' : 'text-text-tertiary'
                            )}
                          />
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4">
                          <span className={cn('type-tags', isGrayed ? 'text-text-tertiary' : 'text-text-secondary')}>
                            {chapter.duration}
                          </span>
                          {isLocked && <span className="type-tags text-accent-magenta">Locked</span>}
                          {isViewed && (
                            <div className="flex items-center gap-1">
                              <Check size={10} className="text-accent-green" strokeWidth={3} />
                              <span className="type-tags text-accent-green">Viewed</span>
                            </div>
                          )}
                          {hasSurvey && !isViewed && (
                            <span className="type-tags text-text-tertiary">1 test</span>
                          )}
                        </div>

                        {/* Description */}
                        <p className={cn(
                          'type-body-default',
                          isGrayed ? 'text-text-tertiary' : 'text-text-secondary'
                        )}>
                          {bundle.description.substring(0, 120)}...
                        </p>
                      </button>
                    </div>
                    <div className="h-px bg-border-default" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---- Sticky bottom bar ---- */}
        <div className="bg-bg-base px-6 py-4" style={{ boxShadow: '0 -4px 14px rgba(0,0,0,0.05)' }}>
          {purchaseError && (
            <p className="type-description text-accent-magenta mb-2 text-center">Not enough coins ({credits} available)</p>
          )}
          <div className="flex items-center gap-2">
            <OAButton
              variant={hasAccess ? 'blue' : 'primary'}
              size="medium"
              className="flex-1"
              onClick={handleCTA}
            >
              {ctaLabel}
            </OAButton>
            <Button variant="ghost" size="icon" className="text-text-secondary">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-text-secondary">
              <Heart className="size-5" />
            </Button>
          </div>
        </div>
        <div className="h-[34px] bg-bg-base flex items-end justify-center pb-2 md:hidden">
          <div className="w-[134px] h-[5px] bg-label-light-primary rounded-full" />
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:flex flex-col flex-1 overflow-y-auto">
        {(
          <div className="relative w-full h-[360px]">
            <img src={bundle.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="container-content absolute inset-0 flex items-start justify-between pt-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-on-dark hover:opacity-80 transition-opacity">
                <ChevronLeft size={18} />
                <span className="type-headline-small">Back</span>
              </button>
              <div className="bg-bg-elevated/90 border border-border-input rounded-lg p-2 flex items-center gap-1 h-[34px]">
                <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                <span className="font-semibold text-[14px] text-text-primary font-sans">{credits}</span>
              </div>
            </div>
          </div>
        )}

        <div className="container-content section">
          <div className="flex gap-12 lg:gap-16">
            {/* Left column */}
            <div className="flex-1 min-w-0">

              {/* Tab bar */}
              <div className="flex border-b border-border-default mb-6">
                {(['about', 'chapters'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'relative px-6 py-4 text-[14px] text-text-primary font-sans transition-colors',
                      activeTab === tab ? 'font-bold tracking-[-0.28px]' : 'font-normal text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {tab === 'about' ? 'What is this?' : `Chapters (${bundle.chapters.length})`}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-text-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab: About */}
              {activeTab === 'about' && (
                <div className="flex flex-col gap-6 p-6">
                  <p className="type-body-default text-text-secondary md:text-[15px] md:leading-[26px]">{bundle.description}</p>

                  <div>
                    <h3 className="type-headline-medium text-text-primary mb-3">Resources</h3>
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-secondary transition-colors">
                        <span className="type-body-default text-text-secondary">Reference Document</span>
                        <Download size={18} className="text-text-secondary" />
                      </button>
                      <button className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-secondary transition-colors">
                        <span className="type-body-default text-text-secondary">Intro to {bundle.title} Framework</span>
                        <Download size={18} className="text-text-secondary" />
                      </button>
                    </div>
                  </div>

                  {bundle.creator && <div className="flex items-center gap-4">
                    <img src={bundle.creator.avatar} alt={bundle.creator.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="type-headline-small text-text-primary">{bundle.creator?.name}</p>
                      <p className="type-description text-text-tertiary">{bundle.creator?.title}</p>
                    </div>
                  </div>}

                  {parentLesson && (
                    <button onClick={() => navigate(`/lesson/${parentLesson.id}`)} className="bg-bg-secondary rounded-[12px] p-6 text-left hover:bg-gray-4/20 transition-colors">
                      <p className="type-pre-text text-text-tertiary mb-1">Part of lesson plan</p>
                      <p className="type-headline-small text-text-primary">View lesson plan</p>
                    </button>
                  )}
                </div>
              )}

              {/* Tab: Chapters */}
              {activeTab === 'chapters' && (
                <div className="flex flex-col gap-4 p-6">
                  {bundle.chapters.map((chapter, idx) => {
                    const chId = String(chapter.id);
                    const done = completedChapters.includes(chId);
                    const isPlaying = false;
                    const isLocked = !hasAccess && idx > 0;
                    const hasSurvey = chapter.hasAssessment;
                    const isViewed = done;
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => !isLocked && handlePlayChapter(chId)}
                        disabled={isLocked}
                        className={cn(
                          'flex flex-col gap-3 p-6 rounded-[12px] text-left w-full transition-colors',
                          isPlaying ? 'bg-accent-blue/10 border border-accent-blue/30'
                            : isLocked ? 'opacity-50 bg-bg-secondary'
                            : 'bg-bg-secondary hover:bg-gray-4/20'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={cn('type-display-medium', isViewed ? 'text-text-tertiary' : 'text-text-primary')}>
                            {chapter.title}
                          </h4>
                          <Heart size={20} className={done ? 'text-accent-magenta fill-accent-magenta' : 'text-text-disabled'} />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="type-tags text-text-secondary">{chapter.duration}</span>
                          {hasSurvey && <span className="type-tags text-text-tertiary">· Quiz</span>}
                          {isViewed && (
                            <span className="flex items-center gap-1 type-tags text-accent-green">
                              <Check size={10} strokeWidth={3} /> Viewed
                            </span>
                          )}
                          {isLocked && <span className="type-tags text-accent-magenta">· Locked</span>}
                        </div>
                        <p className={cn('type-body-default line-clamp-2', isViewed ? 'text-text-tertiary' : 'text-text-secondary')}>
                          {bundle.description.substring(0, 120)}...
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-[340px] lg:w-[380px] shrink-0">
              <div className="bg-bg-elevated rounded-[16px] p-6 flex flex-col gap-6 sticky top-24" style={{ boxShadow: 'var(--shadow-button)' }}>
                <div className="flex items-center justify-between">
                  <span className="type-tags text-text-category">{bundle.category}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                    <span className="font-semibold text-[14px] text-text-primary font-sans">
                      {bundle.isFree ? 'Free' : bundle.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <h2 className="type-display-large text-text-primary">{bundle.title}</h2>
                <p className="type-body-default text-text-secondary">{bundle.description}</p>

                {percentage > 0 && (
                  <div className="flex items-center gap-4 bg-bg-secondary rounded-[12px] p-6">
                    <div className="relative w-10 h-10 shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" stroke="var(--color-gray-4)" strokeWidth="3" fill="none" />
                        <circle cx="20" cy="20" r="16" stroke="var(--color-brand-oa-blue)" strokeWidth="3" fill="none" strokeDasharray={`${(percentage / 100) * 100.5} 100.5`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center type-disclaimer text-text-primary font-bold">{percentage}%</span>
                    </div>
                    <div>
                      <p className="type-description font-semibold text-text-primary">{completedChapters.length}/{bundle.chapters.length} chapters</p>
                      <p className="type-pre-text text-text-tertiary">{isCompleted ? 'Complete!' : 'Keep going!'}</p>
                    </div>
                  </div>
                )}

                {purchaseError && (
                  <p className="type-description text-accent-magenta text-center">Not enough coins ({credits} available)</p>
                )}

                <OAButton
                  variant={hasAccess ? 'blue' : 'primary'}
                  size="medium"
                  fullWidth
                  onClick={handleCTA}
                >
                  {ctaLabel}
                </OAButton>

                {hasAccess && (
                  <p className="type-pre-text text-accent-green text-center">
                    {bundle.isFree ? 'Free access' : 'Purchased'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        bundle={{
          id: bundle.id,
          plan_id: bundle.planId,
          title: bundle.title,
          subtitle: bundle.subtitle,
          description: bundle.description,
          category: bundle.category,
          credits_required: bundle.price,
          duration_minutes: bundle.totalMinutes,
          is_free: bundle.isFree,
          thumbnail: bundle.thumbnail,
          chapter_count: bundle.chapters.length,
          creator: null,
        }}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </div>
  );
}
