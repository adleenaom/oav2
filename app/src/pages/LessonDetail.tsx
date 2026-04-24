import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Heart, Search, BookOpen, Clock, Award, Video, HelpCircle, FileText, Users, GraduationCap, Share2 } from 'lucide-react';
import OAButton from '../components/OAButton';
import ChaptersRow from '../components/ChaptersRow';
import Breadcrumb from '../components/Breadcrumb';
import PurchaseModal from '../components/PurchaseModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlanDetail } from '../hooks/useOAData';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import CoinIcon from '../components/CoinIcon';
import { BundleDetailSkeleton } from '../components/Skeleton';
import { fromSlug, toSlug, bundleUrl, playUrl } from '../utils/slug';

const TABS = ['About', 'Lesson Bundles', 'Certificates', 'Instructors'] as const;
type Tab = typeof TABS[number];

export default function LessonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ? String(fromSlug(slug)) : null;
  const navigate = useNavigate();
  const { getPercentage, getBundlePercentage } = useProgress();
  const { credits, isBundleAccessible } = useCredits();
  const [activeTab, setActiveTab] = useState<Tab>('About');
  const [modalBundle, setModalBundle] = useState<any>(null);
  const { plan: oaPlan, planBundles, isLoading } = usePlanDetail(id ? Number(id) : null);

  // Parse structured info field: [{type:"heading",content:""}, {type:"list1",content:""}, ...]
  const infoItems = (oaPlan?.info || []).flat();
  const targetAudience = infoItems
    .filter((item: any) => item?.type === 'list1')
    .map((item: any) => item.content);
  const learningPoints = oaPlan?.learnings?.length
    ? oaPlan.learnings
    : infoItems.filter((item: any) => item?.type === 'list2').map((item: any) => item.content);

  const lesson = oaPlan ? {
    id: oaPlan.id,
    fullTitle: oaPlan.title,
    category: '',
    description: oaPlan.description,
    rating: 0,
    reviews: 0,
    lessonPlanCoins: oaPlan.creditsRequired,
    thumbnail: oaPlan.image,
    background: oaPlan.image,
    certificateOnCompletion: (oaPlan.badges || []).length > 0,
    targetAudience,
    learningPoints,
    bundles: planBundles.map((b, idx) => ({
      id: b.id,
      title: b.title,
      subtitle: `Bundle ${idx + 1}`,
      description: b.description,
      category: '',
      thumbnail: '',
      isFree: b.creditsRequired === 0,
      price: b.creditsRequired,
      totalMinutes: b.durationMinutes,
      chapters: [] as { length: number }[],
      chapterCount: (b.series || []).length,
      creator: null as { id: number; name: string; avatar: string; title: string; bio: string } | null,
    })),
  } : null;

  // Redirect home if plan not found or if it's not a real lesson plan
  useEffect(() => {
    if (!isLoading && (!oaPlan || !oaPlan.isLesson)) navigate('/', { replace: true });
  }, [isLoading, oaPlan, navigate]);

  // Correct URL to include slug if only ID was provided
  useEffect(() => {
    if (!oaPlan || !slug) return;
    const correctSlug = toSlug(oaPlan.id, oaPlan.title);
    if (slug !== correctSlug) {
      navigate(`/lesson/${correctSlug}`, { replace: true });
    }
  }, [oaPlan, slug, navigate]);

  if (isLoading) {
    return <div className="flex flex-col h-full bg-bg-base"><div className="flex-1 overflow-y-auto"><BundleDetailSkeleton /></div></div>;
  }
  if (!lesson) return null;

  const totalChapters = lesson.bundles.reduce((acc, b) => acc + (b.chapterCount || 0), 0);
  const overallProgress = lesson.bundles.length > 0
    ? Math.round(lesson.bundles.reduce((acc, b) => acc + getPercentage(String(b.id)), 0) / lesson.bundles.length) : 0;

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* ===== MOBILE ===== */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px]">

          {/* Hero bg */}
          <div className="relative w-full h-[280px] overflow-hidden">
            <img src={lesson.background} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]" />
            <div className="absolute inset-0 bg-black/20" />
            {/* App bar */}
            <div className="absolute top-[53px] left-6 z-10">
              <button onClick={() => navigate(-1)} className="bg-black/50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <ChevronLeft size={13} className="text-text-on-dark" />
                <span className="type-button text-text-on-dark">Back</span>
              </button>
            </div>
            <div className="absolute top-[52px] right-6 z-10">
              <div className="bg-bg-elevated border border-border-input rounded-lg p-2 flex items-center gap-0.5 h-[34px]">
                <CoinIcon size={14} />
                <span className="font-semibold text-[14px] text-text-primary leading-[20px] font-sans">{credits}</span>
              </div>
            </div>
          </div>

          {/* ---- Floating Title Card (Figma-faithful) ---- */}
          <div
            className="mx-6 -mt-[200px] relative z-10 bg-bg-elevated rounded-[16px] flex flex-col overflow-hidden"
            style={{ boxShadow: '0 0 24px rgba(0,0,0,0.12)' }}
          >
            {/* Top section — "Lesson" badge + graduation cap */}
            <div className="relative flex flex-col items-center gap-2 pt-8 pb-4 px-6">
              {/* Yellow floating badge — centered at top edge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-accent-yellow border-2 border-white rounded-full p-2">
                <GraduationCap size={40} className="text-text-primary" />
              </div>
              <span className="type-headline-large text-text-primary">Lesson</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-border-default" />

            {/* Content section — px-24 py-24 gap-8 */}
            <div className="flex flex-col gap-2 p-6">
              {/* Category */}
              <span className="type-tags text-text-category">{lesson.category}</span>

              {/* Title + meta + description */}
              <div className="flex flex-col gap-4">
                <h1 className="type-display-large text-text-primary">{lesson.fullTitle}</h1>

                {/* 3-column stats with icons */}
                <div className="flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-center">
                      <span className="type-body-default text-text-primary">{lesson.rating}</span>
                      <Star size={16} fill="var(--color-orange)" color="var(--color-orange)" className="ml-0.5" />
                    </div>
                    <span className="type-pre-text text-text-primary">{lesson.reviews > 0 ? `${lesson.reviews} reviews` : '0 reviews'}</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-border-default" />

                  {/* Bundles */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <BookOpen size={16} className="text-text-primary" />
                    <span className="type-pre-text text-text-primary">{lesson.bundles.length} Bundles</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-border-default" />

                  {/* Duration */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Clock size={16} className="text-text-primary" />
                    <span className="type-pre-text text-text-primary">{'>'}3 Hrs</span>
                  </div>
                </div>

                <p className="type-body-default text-text-secondary">{lesson.description}</p>
              </div>
            </div>

            {/* Black CTA — full-width bottom, rounded-b-12 */}
            {lesson.lessonPlanCoins > 0 && overallProgress === 0 && lesson.bundles.length > 0 && (
              <button
                onClick={() => navigate(bundleUrl(lesson.bundles[0].id, lesson.bundles[0].title))}
                className="bg-action-primary flex items-center justify-center gap-1 px-4 py-3 rounded-b-[12px]"
              >
                <span className="type-button text-text-on-dark">Get this as lesson plan</span>
                <span className="text-white/40 mx-1">|</span>
                <CoinIcon size={16} />
                <span className="type-button text-text-on-dark">{lesson.lessonPlanCoins.toLocaleString()}</span>
              </button>
            )}
          </div>

          {/* ---- Tab bar ---- */}
          <div className="sticky top-0 z-20 bg-bg-base mt-4">
            <div className="flex px-6 overflow-x-auto hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-3.5 whitespace-nowrap text-[14px] font-sans transition-colors border-b-2 shrink-0',
                    activeTab === tab
                      ? 'text-text-primary font-bold tracking-[-0.28px] border-action-primary'
                      : 'text-text-tertiary font-normal border-transparent'
                  )}
                >
                  {tab === 'Lesson Bundles' ? `Lesson Bundles (${lesson.bundles.length})` : tab}
                </button>
              ))}
            </div>
            <div className="h-px bg-border-default" />
          </div>

          {/* ---- Tab: About ---- */}
          {activeTab === 'About' && (
            <div className="flex flex-col">
              {/* Made just for */}
              <div className="px-6 pt-8 pb-6">
                <h3 className="type-headline-medium text-text-primary mb-4">Made just for</h3>
                <div className="flex flex-col gap-3.5">
                  {lesson.targetAudience.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-text-primary mt-2.5 shrink-0" />
                      <p className="type-body-default text-text-secondary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What you'll learn */}
              <div className="px-6 pb-6">
                <h3 className="type-headline-medium text-text-primary mb-2">What you'll learn</h3>
                <p className="type-body-default text-text-secondary mb-4">This will be the space to explain why your users should view this particular content:</p>
                <div className="flex flex-col gap-4">
                  {lesson.learningPoints.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-accent-green/20 flex items-center justify-center mt-0.5 shrink-0">
                        <span className="text-accent-green text-[10px]">✓</span>
                      </div>
                      <p className="type-body-default text-text-secondary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson components */}
              <div className="px-6 pb-6">
                <h3 className="type-headline-medium text-text-primary mb-4">Lesson components</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-text-secondary" />
                    <span className="type-body-default text-text-secondary">Short videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-text-secondary" />
                    <span className="type-body-default text-text-secondary">Quizzes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-text-secondary" />
                    <span className="type-body-default text-text-secondary">Assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-text-secondary" />
                    <span className="type-body-default text-text-secondary">Workshop</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: Lesson Bundles ---- */}
          {activeTab === 'Lesson Bundles' && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 pl-4 pr-6 pt-6">
                <BookOpen size={20} className="text-text-primary" />
                <h2 className="type-display-medium text-text-primary">Lesson Bundles</h2>
              </div>

              {lesson.bundles.map((bundle) => (
                <div key={bundle.id} className="px-6 py-5 flex flex-col gap-3">
                  {/* Subtitle + title + description */}
                  <span className="type-tags text-text-primary">{bundle.subtitle}</span>
                  <h3 className="type-display-medium text-text-secondary">{bundle.title}</h3>
                  <p className="type-body-default text-text-secondary line-clamp-2">{bundle.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 type-tags text-text-secondary">
                    <span>{bundle.chapterCount || 0} chapters</span>
                    <span>•</span>
                    <span>{bundle.totalMinutes} mins</span>
                  </div>

                  {/* ChaptersRow — horizontal scrollable thumbnails */}
                  <ChaptersRow bundleId={bundle.id} size="small" />

                  {/* CTA */}
                  {(() => {
                    const accessible = isBundleAccessible(bundle.id, bundle.isFree);
                    const pct = getBundlePercentage(String(bundle.id));
                    if (accessible) {
                      return (
                        <OAButton variant="blue" size="medium" fullWidth
                          onClick={() => navigate(playUrl(bundle.id, 0, bundle.title))}
                        >
                          {pct > 0 ? 'Resume Learning' : 'Start Bundle'}
                        </OAButton>
                      );
                    }
                    return (
                      <OAButton variant="blue" size="medium" fullWidth
                        onClick={() => setModalBundle({
                          id: bundle.id, plan_id: null, title: bundle.title, subtitle: bundle.subtitle,
                          description: bundle.description, category: bundle.category,
                          credits_required: bundle.price, duration_minutes: bundle.totalMinutes,
                          is_free: false, thumbnail: '', chapter_count: bundle.chapterCount, creator: null,
                        })}
                      >
                        <span className="flex items-center justify-center gap-1">Get this bundle | <CoinIcon size={14} /> {bundle.price}</span>
                      </OAButton>
                    );
                  })()}

                  <div className="h-px bg-border-default mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* ---- Tab: Certificates ---- */}
          {activeTab === 'Certificates' && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 pl-4 pr-6 pt-6">
                <Award size={20} className="text-text-primary" />
                <h2 className="type-display-medium text-text-primary">Certificates</h2>
              </div>
              <div className="px-6 py-6">
                <div className="bg-bg-secondary rounded-[16px] p-6 flex flex-col items-center gap-4">
                  <Award size={40} className="text-accent-yellow" />
                  <h3 className="type-headline-medium text-text-primary text-center">Course Completion Certificate</h3>
                  <p className="type-description text-text-secondary text-center">Complete all bundles to earn your certificate</p>
                  <div className="w-full h-2 bg-border-default/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <span className="type-tags text-text-tertiary">{overallProgress}% complete</span>
                </div>
              </div>
            </div>
          )}

          {/* ---- Tab: Instructors ---- */}
          {activeTab === 'Instructors' && (
            <div className="px-6 py-6">
              <h3 className="type-display-medium text-text-primary mb-6">Your instructors</h3>
              {/* Avatar scroll */}
              <div className="flex gap-4 overflow-x-auto hide-scrollbar mb-6">
                {lesson.bundles.filter(b => b.creator).map(b => (
                  <div key={b.creator!.id} className="shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent-yellow">
                      <img src={b.creator!.avatar} alt={b.creator!.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
              {/* First creator bio */}
              {lesson.bundles[0]?.creator && (
                <div className="flex flex-col gap-1">
                  <p className="type-headline-small text-text-primary">{lesson.bundles[0].creator.name}</p>
                  <p className="type-pre-text text-text-secondary">{lesson.bundles[0].creator.title}</p>
                  <p className="type-body-default text-text-secondary mt-3">{lesson.bundles[0].creator.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---- Sticky bottom bar ---- */}
        <div className="bg-bg-base px-6 py-4" style={{ boxShadow: '0 -4px 14px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
              <Heart className="size-5" />
            </Button>
          </div>
        </div>
        <div className="h-[34px] bg-bg-base flex items-end justify-center pb-2 md:hidden">
          <div className="w-[134px] h-[5px] bg-label-light-primary rounded-full" />
        </div>
      </div>

      {/* ===== DESKTOP — Spotify-inspired hero + two-column body ===== */}
      <div className="hidden md:flex flex-col flex-1 overflow-y-auto">

        {/* Hero header — blurred lesson thumbnail + title + action bar */}
        <div className="relative w-full min-h-[300px] bg-[#1a1a2e] overflow-hidden">
          <img
            src={lesson.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-[20px] brightness-[0.6]"
            style={{ display: lesson.thumbnail ? 'block' : 'none' }}
          />
          <div className="absolute inset-0 bg-black/30" />

          <div className="container-content relative z-10 flex flex-col justify-end min-h-[300px] pt-6 pb-8">
            <Breadcrumb items={[
              { label: 'Home', path: '/' },
              { label: 'Lessons', path: '/viewall/lessons' },
              { label: lesson.fullTitle },
            ]} />

            <h1 className="font-bold text-[40px] lg:text-[48px] leading-[1.1] text-white mt-2 font-sans">
              {lesson.fullTitle}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="type-body-default text-white/70">{lesson.bundles.length} bundles</span>
              <span className="text-white/30">·</span>
              <span className="type-body-default text-white/70">{totalChapters} chapters</span>
              {lesson.category && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="type-body-default text-white/70">{lesson.category}</span>
                </>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 mt-6">
              {lesson.bundles.length > 0 && (
                <OAButton
                  variant="primary"
                  size="medium"
                  onClick={() => navigate(lesson.bundles[0].isFree ? playUrl(lesson.bundles[0].id, 0, lesson.bundles[0].title) : bundleUrl(lesson.bundles[0].id, lesson.bundles[0].title))}
                >
                  {overallProgress > 0 ? 'Resume Learning' : lesson.lessonPlanCoins > 0 ? `Get for ${lesson.lessonPlanCoins} Credits` : 'Start Learning'}
                </OAButton>
              )}
              <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Heart size={18} className="text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Share2 size={18} className="text-white" />
              </button>
              {lesson.lessonPlanCoins > 0 && overallProgress === 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <CoinIcon size={16} />
                  <span className="type-headline-small text-white">{lesson.lessonPlanCoins}</span>
                  <span className="type-description text-white/60">credits</span>
                </div>
              )}
              {overallProgress > 0 && (
                <span className="type-pre-text text-accent-blue ml-auto">{overallProgress}% complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Two-column body: LEFT = bundles with chapters, RIGHT = sticky info cards */}
        <div className="container-content py-8">
          <div className="flex gap-12 lg:gap-16">

            {/* LEFT — Certificate + Bundle listings with ChaptersRow */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">
              {/* Certificate badge */}
              {lesson.certificateOnCompletion && (
                <div className="bg-accent-yellow/10 rounded-[12px] p-6 flex items-center gap-4">
                  <Award size={24} className="text-accent-yellow shrink-0" />
                  <div>
                    <p className="type-headline-small text-text-primary">Certificate on completion</p>
                    <p className="type-pre-text text-text-tertiary">Complete all bundles to earn yours</p>
                  </div>
                </div>
              )}

              {/* Bundle listings */}
              {lesson.bundles.map((bundle) => (
                <div key={bundle.id} className="flex">
                  {/* Vertical progress bar */}
                  <div className="flex items-stretch px-6 shrink-0">
                    <div className={cn(
                      'w-1 rounded-full',
                      getPercentage(String(bundle.id)) === 100 ? 'bg-accent-green'
                        : getPercentage(String(bundle.id)) > 0 ? 'bg-accent-blue'
                        : 'bg-border-default'
                    )} />
                  </div>

                  {/* Bundle content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-6 pb-6">
                    {/* Detail */}
                    <div className="flex flex-col gap-2">
                      <span className="type-tags text-text-primary">{bundle.subtitle}</span>
                      <h3 className="type-display-medium text-text-secondary">{bundle.title}</h3>
                      <p className="type-body-default text-text-secondary">{bundle.description}</p>
                      <div className="flex items-center gap-2 type-tags text-text-secondary">
                        <span>{bundle.chapterCount || 0} chapters</span>
                        <span>•</span>
                        <span>{bundle.totalMinutes} mins</span>
                      </div>
                    </div>

                    {/* ChaptersRow — horizontal thumbnails */}
                    <ChaptersRow bundleId={bundle.id} size="small" />

                    {/* CTA button */}
                    {(() => {
                      const accessible = isBundleAccessible(bundle.id, bundle.isFree);
                      const pct = getBundlePercentage(String(bundle.id));
                      if (accessible) {
                        return (
                          <OAButton variant="blue" size="medium" fullWidth
                            onClick={() => navigate(playUrl(bundle.id, 0, bundle.title))}
                          >
                            {pct > 0 ? 'Resume Learning' : 'Start Bundle'}
                          </OAButton>
                        );
                      }
                      return (
                        <OAButton variant="blue" size="medium" fullWidth
                          onClick={() => setModalBundle({
                            id: bundle.id, plan_id: null, title: bundle.title, subtitle: bundle.subtitle,
                            description: bundle.description, category: bundle.category,
                            credits_required: bundle.price, duration_minutes: bundle.totalMinutes,
                            is_free: false, thumbnail: '', chapter_count: bundle.chapterCount, creator: null,
                          })}
                        >
                          <span className="flex items-center justify-center gap-1">Get this bundle | <CoinIcon size={14} /> {bundle.price}</span>
                        </OAButton>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — Sticky info cards */}
            <div className="w-[300px] lg:w-[340px] shrink-0">
              <div className="sticky top-20 flex flex-col gap-5">

                {/* About card */}
                <div className="bg-bg-secondary rounded-[16px] p-6">
                  <h3 className="type-headline-small text-text-primary mb-3">About</h3>
                  <p className="type-body-default text-text-secondary">{lesson.description}</p>
                </div>

                {/* Progress card */}
                {overallProgress > 0 && (
                  <div className="bg-bg-secondary rounded-[16px] p-6">
                    <h3 className="type-headline-small text-text-primary mb-4">Progress</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" stroke="var(--color-gray-4)" strokeWidth="3" fill="none" />
                          <circle cx="24" cy="24" r="20" stroke="var(--color-brand-oa-blue)" strokeWidth="3" fill="none" strokeDasharray={`${(overallProgress / 100) * 125.6} 125.6`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center type-pre-text font-bold text-text-primary">{overallProgress}%</span>
                      </div>
                      <div>
                        <p className="type-description font-semibold text-text-primary">{lesson.bundles.length} bundles · {totalChapters} chapters</p>
                        <p className="type-pre-text text-text-tertiary">{overallProgress === 100 ? 'All done!' : 'Keep going!'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Made just for card */}
                {lesson.targetAudience.length > 0 && (
                  <div className="bg-bg-secondary rounded-[16px] p-6">
                    <h3 className="type-headline-small text-text-primary mb-3">Made just for</h3>
                    <div className="flex flex-col gap-2.5">
                      {lesson.targetAudience.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-text-primary mt-2 shrink-0" />
                          <p className="type-description text-text-secondary">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What you'll learn card */}
                {lesson.learningPoints.length > 0 && (
                  <div className="bg-bg-secondary rounded-[16px] p-6">
                    <h3 className="type-headline-small text-text-primary mb-3">What you'll learn</h3>
                    <div className="flex flex-col gap-2.5">
                      {lesson.learningPoints.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-accent-green/20 flex items-center justify-center mt-0.5 shrink-0">
                            <span className="text-accent-green text-[9px]">✓</span>
                          </div>
                          <p className="type-description text-text-secondary">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructors card */}
                {lesson.bundles.some(b => b.creator) && (
                  <div className="bg-bg-secondary rounded-[16px] p-6">
                    <h3 className="type-headline-small text-text-primary mb-3">Instructors</h3>
                    <div className="flex flex-col gap-3">
                      {lesson.bundles.filter(b => b.creator).map(b => (
                        <div key={b.creator!.id} className="flex items-center gap-3">
                          <img src={b.creator!.avatar} alt={b.creator!.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="type-headline-small text-text-primary">{b.creator!.name}</p>
                            <p className="type-pre-text text-text-tertiary">{b.creator!.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase modal */}
      {modalBundle && (
        <PurchaseModal
          bundle={modalBundle}
          isOpen={true}
          onClose={() => setModalBundle(null)}
        />
      )}
    </div>
  );
}
