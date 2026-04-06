import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart, Search, BookOpen, Clock, Award, Video, HelpCircle, FileText, Users, GraduationCap } from 'lucide-react';
import OAButton from '../components/OAButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApi } from '../hooks/useApi';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import type { ApiPlanDetail } from '../services/types';

const TABS = ['About', 'Lesson Bundles', 'Certificates', 'Instructors'] as const;
type Tab = typeof TABS[number];

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPercentage } = useProgress();
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState<Tab>('About');
  const { data: apiPlan, isLoading } = useApi<ApiPlanDetail>(id ? `/plans/${id}` : null);

  // Map API response to component shape
  const lesson = apiPlan ? {
    id: apiPlan.id,
    fullTitle: apiPlan.title,
    category: apiPlan.category,
    description: apiPlan.description,
    rating: apiPlan.rating,
    reviews: apiPlan.review_count,
    lessonPlanCoins: apiPlan.credits_required,
    thumbnail: apiPlan.image,
    background: apiPlan.background || apiPlan.image,
    certificateOnCompletion: apiPlan.certificate_on_completion,
    targetAudience: apiPlan.target_audience,
    learningPoints: apiPlan.learning_points,
    bundles: apiPlan.bundles.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      category: b.category,
      thumbnail: b.thumbnail,
      isFree: b.is_free,
      price: b.credits_required,
      totalMinutes: b.duration_minutes,
      chapters: [] as { length: number }[],
      chapterCount: b.chapter_count || 0,
      creator: b.creator ? { id: b.creator.id, name: b.creator.name, avatar: b.creator.avatar, title: b.creator.job_title || '', bio: b.creator.bio || '' } : null,
    })),
  } : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="type-body-default text-text-tertiary">Loading...</div></div>;
  }
  if (!lesson) { navigate('/'); return null; }

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
                <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
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
            {lesson.lessonPlanCoins > 0 && overallProgress === 0 && (
              <button
                onClick={() => navigate(`/bundle/${lesson.bundles[0].id}`)}
                className="bg-action-primary flex items-center justify-center gap-1 px-4 py-3 rounded-b-[12px]"
              >
                <span className="type-button text-text-on-dark">Get this as lesson plan</span>
                <span className="text-white/40 mx-1">|</span>
                <div className="w-4 h-4 rounded-full bg-accent-yellow" />
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

              {lesson.bundles.map((bundle, idx) => {
                const bundleProgress = getPercentage(String(bundle.id));
                const isLocked = idx > 0 && getPercentage(String(lesson.bundles[idx - 1].id)) < 100;
                return (
                  <div key={bundle.id}>
                    <button
                      onClick={() => !isLocked && navigate(`/bundle/${bundle.id}`)}
                      className={cn('w-full text-left px-6 py-5 flex flex-col gap-3', isLocked && 'opacity-50')}
                    >
                      {/* Thumbnail */}
                      <div className="w-full h-[160px] rounded-[12px] overflow-hidden relative">
                        <img src={bundle.thumbnail} alt={bundle.title} className="w-full h-full object-cover" />
                        {bundleProgress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
                            <div className="bg-accent-blue h-full" style={{ width: `${bundleProgress}%` }} />
                            <div className="bg-white/40 h-full flex-1" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="type-tags text-text-category">{bundle.subtitle}</span>
                        {bundle.isFree ? (
                          <span className="type-tags text-accent-green">FREE</span>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-yellow" />
                            <span className="type-tags text-text-primary">{bundle.price}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="type-headline-medium text-text-primary">{bundle.title}</h3>
                      <p className="type-description text-text-secondary line-clamp-2">{bundle.description}</p>

                      <div className="flex items-center gap-3">
                        <span className="type-tags text-text-secondary">{bundle.chapters.length} chapters</span>
                        <span className="type-tags text-text-tertiary">· {bundle.totalMinutes} min</span>
                        {bundleProgress > 0 && <span className="type-tags text-accent-blue">· {bundleProgress}%</span>}
                      </div>

                      {/* Get this bundle CTA */}
                      <div className="bg-action-primary rounded flex items-center justify-center gap-1 px-4 py-3 w-full mt-1">
                        <span className="type-button text-text-on-dark">Get this bundle</span>
                        {!bundle.isFree && (
                          <>
                            <span className="text-white/40 mx-0.5">|</span>
                            <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                            <span className="type-button text-text-on-dark">{bundle.price}</span>
                          </>
                        )}
                      </div>
                    </button>
                    <div className="h-px bg-border-default" />
                  </div>
                );
              })}
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

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:flex flex-col flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="relative w-full h-[360px]">
          <img src={lesson.background} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="container-content absolute inset-0 flex flex-col justify-between pt-6 pb-8">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-on-dark hover:opacity-80 transition-opacity w-fit">
                <ChevronLeft size={18} />
                <span className="type-headline-small">Back</span>
              </button>
              <div className="bg-bg-elevated/90 border border-border-input rounded-lg p-2 flex items-center gap-1 h-[34px]">
                <div className="w-3.5 h-3.5 rounded-full bg-accent-yellow" />
                <span className="font-semibold text-[14px] text-text-primary font-sans">{credits}</span>
              </div>
            </div>
            <div className="max-w-[600px]">
              <span className="type-tags text-accent-blue">{lesson.category}</span>
              <h1 className="font-bold text-[40px] leading-[48px] text-text-on-dark mt-2 font-sans">{lesson.fullTitle}</h1>
            </div>
          </div>
        </div>

        <div className="container-content section">
          <div className="flex gap-12 lg:gap-16">
            {/* Main column */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Meta with icons */}
              <div className="flex items-center gap-6 text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="var(--color-orange)" color="var(--color-orange)" />
                  <span className="type-body-default text-text-primary">{lesson.rating}</span>
                  <span className="type-pre-text text-text-tertiary ml-0.5">{lesson.reviews > 0 ? `${lesson.reviews} reviews` : ''}</span>
                </div>
                <div className="w-px h-5 bg-border-default" />
                <div className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-text-primary" />
                  <span className="type-pre-text text-text-primary">{lesson.bundles.length} Bundles</span>
                </div>
                <div className="w-px h-5 bg-border-default" />
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-text-primary" />
                  <span className="type-pre-text text-text-primary">{totalChapters} Chapters</span>
                </div>
              </div>

              <p className="type-body-default text-text-secondary md:text-[15px] md:leading-[26px]">{lesson.description}</p>

              {/* Target audience */}
              <div>
                <h3 className="type-headline-medium text-text-primary mb-4">Made just for</h3>
                <div className="flex flex-col gap-3">
                  {lesson.targetAudience.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-text-primary mt-2.5 shrink-0" />
                      <p className="type-body-default text-text-secondary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning points */}
              <div>
                <h3 className="type-headline-medium text-text-primary mb-4">What you'll learn</h3>
                <div className="flex flex-col gap-3">
                  {lesson.learningPoints.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center mt-0.5 shrink-0">
                        <span className="text-accent-green text-[10px]">✓</span>
                      </div>
                      <p className="type-body-default text-text-secondary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructors */}
              <div>
                <h3 className="type-headline-medium text-text-primary mb-4">Your instructors</h3>
                <div className="flex gap-6">
                  {lesson.bundles.filter(b => b.creator).map(b => (
                    <div key={b.creator!.id} className="flex items-center gap-3">
                      <img src={b.creator!.avatar} alt={b.creator!.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="type-headline-small text-text-primary">{b.creator!.name}</p>
                        <p className="type-pre-text text-text-tertiary">{b.creator!.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-[340px] lg:w-[380px] shrink-0">
              <div className="sticky top-24 flex flex-col gap-6 py-1">
                {/* CTA card */}
                <div className="bg-bg-elevated rounded-[16px] p-6 flex flex-col gap-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-button)' }}>
                  {overallProgress > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="type-description font-semibold text-text-primary">Progress</span>
                        <span className="type-description font-bold text-accent-blue">{overallProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-border-default/40 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-blue rounded-full" style={{ width: `${overallProgress}%` }} />
                      </div>
                    </>
                  )}
                  <OAButton variant="primary" size="medium" fullWidth onClick={() => navigate(`/bundle/${lesson.bundles[0].id}`)}>
                    {overallProgress > 0 ? 'Resume Learning' : lesson.lessonPlanCoins > 0 ? `Get for ${lesson.lessonPlanCoins} Credits` : 'Start Learning'}
                  </OAButton>
                </div>

                {/* Bundles list */}
                <div className="flex flex-col gap-3">
                  <h3 className="type-headline-medium text-text-primary px-1">Course Content</h3>
                  {lesson.bundles.map((bundle, idx) => {
                    const bp = getPercentage(String(bundle.id));
                    const locked = idx > 0 && getPercentage(String(lesson.bundles[idx - 1].id)) < 100;
                    return (
                      <button
                        key={bundle.id}
                        onClick={() => !locked && navigate(`/bundle/${bundle.id}`)}
                        className={cn(
                          'flex items-center gap-4 p-6 rounded-[12px] text-left',
                          locked ? 'opacity-50 bg-bg-secondary' : 'bg-bg-secondary hover:bg-gray-4/20 transition-colors'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          bp === 100 ? 'bg-accent-green' : bp > 0 ? 'bg-accent-blue' : 'bg-border-default'
                        )}>
                          <span className="type-headline-small text-text-on-dark">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="type-headline-small text-text-primary truncate">{bundle.title}</p>
                          <p className="type-description text-text-tertiary mt-1">
                            {bundle.chapters.length} chapters{bp > 0 && ` · ${bp}%`}
                          </p>
                        </div>
                        <ChevronRight size={16} className={locked ? 'text-text-disabled' : 'text-text-secondary'} />
                      </button>
                    );
                  })}
                </div>

                {/* Certificate */}
                {lesson.certificateOnCompletion && (
                  <div className="bg-accent-yellow/10 rounded-[12px] p-6 flex items-center gap-4">
                    <Award size={24} className="text-accent-yellow shrink-0" />
                    <div>
                      <p className="type-headline-small text-text-primary">Certificate on completion</p>
                      <p className="type-pre-text text-text-tertiary">Complete all bundles to earn yours</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
