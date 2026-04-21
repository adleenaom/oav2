import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, X } from 'lucide-react';
import { useBundleDetail, usePlanDetail } from '../hooks/useOAData';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import OAButton from '../components/OAButton';
import BundleThumbnail from '../components/BundleThumbnail';
import { ChapterVideoPlayer } from '@/components/ui/chapter-video-player';

type PlayerState = 'playing' | 'up-next' | 'end-of-bundle' | 'next-bundle' | 'locked';

export default function ChapterPlayer() {
  const { bundleId, chapterIndex } = useParams<{ bundleId: string; chapterIndex: string }>();
  const navigate = useNavigate();
  const { trackChapterWatch, markChapterComplete, resetChapterProgress, getBundleProgress } = useProgress();
  const { credits, purchaseBundle, isBundleAccessible } = useCredits();

  const { bundle: oaBundle, seriesList, resolvedChapters } = useBundleDetail(bundleId ? Number(bundleId) : null);
  const { planBundles: parentPlanBundles } = usePlanDetail(oaBundle?.plan?.id || null);

  const bundle = oaBundle ? {
    id: oaBundle.id,
    title: oaBundle.title,
    category: '',
    plan_id: oaBundle.plan?.id || null,
    thumbnail: seriesList[0]?.image || '',
  } : null;

  const recommendations: { id: number; title: string; thumbnail: string; category: string; is_free: boolean; credits_required: number }[] = [];

  // Find next bundle in lesson plan
  const planBundles = parentPlanBundles;
  const currentBundleIdx = planBundles.findIndex(b => b.id === Number(bundleId));
  const nextPlanBundle = currentBundleIdx >= 0 && currentBundleIdx < planBundles.length - 1
    ? planBundles[currentBundleIdx + 1] : null;
  const nextBundleAccessible = nextPlanBundle
    ? isBundleAccessible(nextPlanBundle.id, nextPlanBundle.creditsRequired === 0) : false;

  const chapters = resolvedChapters;
  const [currentIdx, setCurrentIdx] = useState(parseInt(chapterIndex || '0', 10));
  const [playerState, setPlayerState] = useState<PlayerState>('playing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [purchaseError, setPurchaseError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const currentChapter = chapters[currentIdx];
  const hasNext = currentIdx < chapters.length - 1;
  const progress = getBundleProgress(bundleId || '');
  const isCompleted = progress?.completedChapters?.includes(String(currentChapter?.id));

  // ---- Navigation with transition ----

  const goToChapter = useCallback((idx: number) => {
    if (idx < 0 || idx >= chapters.length || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setPlayerState('playing');
      setIsTransitioning(false);
      setCountdown(5);
    }, 300);
  }, [chapters.length, isTransitioning]);

  // Swipe/keyboard navigation now handled by ChapterVideoPlayer internally

  // ---- Keyboard (desktop) ----

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIdx > 0) goToChapter(currentIdx - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (playerState === 'playing') {
          if (hasNext) goToChapter(currentIdx + 1);
          else setPlayerState('end-of-bundle');
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIdx, playerState, hasNext, goToChapter]);

  // ---- Auto-play on chapter change + track progress ----

  useEffect(() => {
    if (!currentChapter || !bundle) return;

    // Reset if rewatching a completed chapter
    if (isCompleted) {
      resetChapterProgress(String(bundle.id), String(currentChapter.id));
    }

    // Track this chapter watch
    trackChapterWatch({
      bundleId: String(bundle.id),
      bundleTitle: bundle.title,
      planId: bundle.plan_id ? String(bundle.plan_id) : null,
      totalChapters: chapters.length,
      chapterId: String(currentChapter.id),
      chapterThumbnail: currentChapter.videoImage || currentChapter.seriesImage || bundle.thumbnail,
      chapterTitle: currentChapter.title,
    });

    // Play video
    if (videoRef.current && playerState === 'playing') {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIdx, bundle?.id]);

  // ---- Video ended → show "up next" or "end of bundle" ----

  const handleVideoEnded = useCallback(() => {
    if (!currentChapter || !bundle) return;
    markChapterComplete(String(bundle.id), String(currentChapter.id));

    if (hasNext) {
      // Check if next chapter is in a different bundle (lesson plan flow)
      setPlayerState('up-next');
      setCountdown(5);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            goToChapter(currentIdx + 1);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // End of bundle — check if lesson plan has a next bundle
      if (nextPlanBundle && nextBundleAccessible) {
        setPlayerState('next-bundle');
        setCountdown(5);
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              navigate(`/play/${nextPlanBundle.id}/0`);
              return 5;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (nextPlanBundle && !nextBundleAccessible) {
        setPlayerState('locked');
      } else {
        setPlayerState('end-of-bundle');
      }
    }
  }, [currentChapter, bundle, hasNext, currentIdx, markChapterComplete, goToChapter, nextPlanBundle, nextBundleAccessible, navigate]);

  // Cleanup countdown on unmount
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ---- Purchase handler ----

  const handlePurchase = async () => {
    if (!bundle) return;
    setPurchaseError(false);
    const success = await purchaseBundle(bundle.id);
    if (success) {
      setPlayerState('playing');
    } else {
      setPurchaseError(true);
    }
  };

  // ---- Loading state ----

  if (!bundle || chapters.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="type-body-default text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">

      {/* ---- Video Player (mobile + desktop) ---- */}
      <div className="relative w-full h-full">
        {/* ChapterVideoPlayer replaces raw <video> */}
        {playerState === 'playing' && (
          <ChapterVideoPlayer
            videoUrl={currentChapter.videoUrl}
            bundleTitle={bundle.title}
            chapterTitle={currentChapter.title}
            partNumber={currentIdx + 1}
            totalParts={chapters.length}
            duration={currentChapter.duration}
            skipTimestamp={5}
            onClose={() => navigate(-1)}
            onEnded={handleVideoEnded}
          />
        )}

        {/* Up Next screen */}
        {playerState === 'up-next' && hasNext && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <p className="type-tags text-white/50">UP NEXT</p>
            <p className="type-headline-large text-white text-center">{chapters[currentIdx + 1].title}</p>
            <p className="type-description text-white/40">{chapters[currentIdx + 1].duration}</p>

            {/* Countdown play button */}
            <button
              onClick={() => { clearInterval(countdownRef.current); goToChapter(currentIdx + 1); }}
              className="relative w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mt-4"
            >
              <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" stroke="white" strokeOpacity="0.2" strokeWidth="3" fill="none" />
                <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="3" fill="none"
                  strokeDasharray={`${((5 - countdown) / 5) * 226} 226`} strokeLinecap="round" />
              </svg>
              <Play size={28} className="text-white fill-white ml-1" />
            </button>
            <p className="type-description text-white/40">Playing in {countdown}s</p>
          </div>
        )}

        {/* End of Bundle screen */}
        {playerState === 'end-of-bundle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6 overflow-y-auto py-16">
            <p className="type-tags text-accent-green">BUNDLE COMPLETE</p>
            <p className="type-headline-large text-white text-center">{bundle.title}</p>
            <p className="type-description text-white/50 text-center">You've finished all chapters in this bundle!</p>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="w-full mt-4">
                <p className="type-headline-small text-white/70 mb-4 text-center">Watch next</p>
                <div className="flex gap-3 justify-center">
                  {recommendations.map(rec => (
                    <BundleThumbnail
                      key={rec.id}
                      thumbnail={rec.thumbnail}
                      alt={rec.title}
                      size="default"
                      price={rec.is_free ? 'free' : rec.credits_required}
                      onClick={() => navigate(`/play/${rec.id}/0`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <OAButton variant="blue" size="medium" onClick={() => navigate(`/bundle/${bundleId}`)}>
              Back to Bundle
            </OAButton>
          </div>
        )}

        {/* Next Bundle autoplay screen (lesson plan flow) */}
        {playerState === 'next-bundle' && nextPlanBundle && (
          <div className="absolute inset-0">
            {/* Blurred background thumbnail */}
            <div className="absolute inset-0 bg-bg-overlay" />
            <div className="absolute inset-0 bg-black/60" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-4 z-10">
              {/* Top info */}
              <div className="absolute top-14 left-6 right-6 flex justify-between">
                <div>
                  <p className="type-display-medium text-white italic">{bundle.title}</p>
                  <p className="type-description text-white/50">Part {currentBundleIdx + 1} of {planBundles.length}</p>
                </div>
                <button onClick={() => navigate(-1)} className="text-white">
                  <X size={24} />
                </button>
              </div>

              <p className="type-description text-white/50">Up Next</p>
              <h2 className="type-headline-large text-white text-center">{nextPlanBundle.title}</h2>
              <p className="type-description text-white/50 text-center max-w-[300px]">
                {nextPlanBundle.description}
              </p>

              {/* Countdown play button */}
              <button
                onClick={() => { clearInterval(countdownRef.current); navigate(`/play/${nextPlanBundle.id}/0`); }}
                className="relative w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mt-4"
              >
                <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" stroke="white" strokeOpacity="0.2" strokeWidth="3" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="3" fill="none"
                    strokeDasharray={`${((5 - countdown) / 5) * 226} 226`} strokeLinecap="round" />
                </svg>
                <Play size={28} className="text-white fill-white ml-1" />
                <span className="absolute -bottom-6 type-description text-white/40">{countdown}s</span>
              </button>

              {/* Action buttons */}
              <div className="flex gap-4 mt-8 w-full max-w-[320px]">
                <button
                  onClick={() => { clearInterval(countdownRef.current); navigate(`/bundle/${bundleId}`); }}
                  className="flex-1 py-3 rounded-[8px] bg-white/10 type-button text-white text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { clearInterval(countdownRef.current); navigate(`/play/${nextPlanBundle.id}/0`); }}
                  className="flex-1 py-3 rounded-[8px] bg-action-secondary type-button text-white text-center"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Locked screen (lesson plan — next bundle not purchased) */}
        {playerState === 'locked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <Lock size={48} className="text-accent-magenta" />
            <p className="type-headline-large text-white text-center">{nextPlanBundle ? nextPlanBundle.title : 'Next bundle'} is locked</p>
            <p className="type-description text-white/50 text-center">Purchase this bundle to continue your lesson plan.</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent-yellow" />
              <span className="type-headline-medium text-white">{credits} credits available</span>
            </div>
            {purchaseError && <p className="type-description text-accent-magenta">Not enough credits</p>}
            <OAButton variant="primary" size="medium" onClick={handlePurchase}>
              Unlock Bundle
            </OAButton>
            <button onClick={() => navigate(-1)} className="type-body-default text-white/40 mt-2">Go back</button>
          </div>
        )}
      </div>

      {/* Desktop uses the same ChapterVideoPlayer — it's full-screen on all devices */}
    </div>
  );
}
