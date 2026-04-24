import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, X } from 'lucide-react';
import { useBundleDetail, usePlanDetail } from '../hooks/useOAData';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import OAButton from '../components/OAButton';
import CoinIcon from '../components/CoinIcon';
import BundleThumbnail from '../components/BundleThumbnail';
import { ChapterVideoPlayer } from '@/components/ui/chapter-video-player';
import SurveyScreen from '../components/SurveyScreen';
import { fromSlug, toSlug, playUrl, bundleUrl } from '../utils/slug';

type PlayerState = 'playing' | 'survey' | 'up-next' | 'end-of-bundle' | 'next-bundle' | 'locked';

export default function ChapterPlayer() {
  const { bundleSlug, chapterIndex } = useParams<{ bundleSlug: string; chapterIndex: string }>();
  const bundleId = bundleSlug ? String(fromSlug(bundleSlug)) : null;
  const navigate = useNavigate();
  const { trackChapterWatch, markChapterComplete, resetChapterProgress, getBundleProgress } = useProgress();
  const { credits, purchaseBundle, isBundleAccessible } = useCredits();

  const { bundle: oaBundle, seriesList, resolvedChapters } = useBundleDetail(bundleId ? Number(bundleId) : null);
  const { planBundles: parentPlanBundles } = usePlanDetail(oaBundle?.plan?.id || null);

  // Correct URL slug
  useEffect(() => {
    if (!oaBundle || !bundleSlug || !chapterIndex) return;
    const correctSlug = toSlug(oaBundle.id, oaBundle.title);
    if (bundleSlug !== correctSlug) {
      navigate(`/play/${correctSlug}/${chapterIndex}`, { replace: true });
    }
  }, [oaBundle, bundleSlug, chapterIndex, navigate]);

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
  const [currentChapterIdx, setCurrentChapterIdx] = useState(parseInt(chapterIndex || '0', 10));
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>('playing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [purchaseError, setPurchaseError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const currentChapter = chapters[currentChapterIdx];
  const totalParts = currentChapter?.parts?.length || 1;
  const currentPart = currentChapter?.parts?.[currentPartIdx];
  const currentVideoUrl = currentPart?.videoUrl || currentChapter?.videoUrl || '';
  const currentPosterImage = currentPart?.videoImage || currentChapter?.videoImage || '';
  const hasNextChapter = currentChapterIdx < chapters.length - 1;
  const hasNextPart = currentPartIdx < totalParts - 1;
  const hasPrevPart = currentPartIdx > 0;
  const progress = getBundleProgress(bundleId || '');
  const isCompleted = progress?.completedChapters?.includes(String(currentChapter?.id));

  // ---- Navigation ----

  // Skip to next/prev part within current chapter (instant, no buffer)
  const goToPart = useCallback((partIdx: number) => {
    if (partIdx < 0 || partIdx >= totalParts || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPartIdx(partIdx);
      setPlayerState('playing');
      setIsTransitioning(false);
    }, 300);
  }, [totalParts, isTransitioning]);

  // Go to a different chapter (with transition)
  const goToChapter = useCallback((chapterIdx: number) => {
    if (chapterIdx < 0 || chapterIdx >= chapters.length || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentChapterIdx(chapterIdx);
      setCurrentPartIdx(0);
      setPlayerState('playing');
      setIsTransitioning(false);
      setCountdown(5);
    }, 300);
  }, [chapters.length, isTransitioning]);

  // ---- Keyboard (desktop) ----

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hasPrevPart) goToPart(currentPartIdx - 1);
        else if (currentChapterIdx > 0) goToChapter(currentChapterIdx - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (playerState === 'playing') {
          if (hasNextPart) goToPart(currentPartIdx + 1);
          else if (hasNextChapter) setPlayerState('up-next');
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
  }, [currentChapterIdx, currentPartIdx, playerState, hasNextPart, hasNextChapter, hasPrevPart, goToPart, goToChapter]);

  // ---- Auto-play on chapter change + track progress ----

  useEffect(() => {
    if (!currentChapter || !bundle || chapters.length === 0) return;

    // Reset if rewatching a completed chapter (only on first part)
    if (isCompleted && currentPartIdx === 0) {
      resetChapterProgress(String(bundle.id), String(currentChapter.id));
    }

    // Track this chapter watch
    trackChapterWatch({
      bundleId: String(bundle.id),
      bundleTitle: bundle.title,
      planId: bundle.plan_id ? String(bundle.plan_id) : null,
      totalChapters: chapters.length,
      chapterId: String(currentChapter.id),
      chapterThumbnail: currentChapter.seriesImage || currentChapter.videoImage || bundle.thumbnail,
      chapterTitle: currentChapter.title,
    });

    // Play video
    if (videoRef.current && playerState === 'playing') {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentChapterIdx, currentPartIdx, bundle?.id, chapters.length]);

  // ---- Video ended → show "up next" or "end of bundle" ----

  // After survey completes, proceed to next chapter or end-of-bundle
  const handleSurveyComplete = useCallback(() => {
    if (hasNextChapter) {
      setPlayerState('up-next');
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            goToChapter(currentChapterIdx + 1);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (nextPlanBundle && nextBundleAccessible) {
      setPlayerState('next-bundle');
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            navigate(playUrl(nextPlanBundle.id, 0, nextPlanBundle.title));
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
  }, [hasNextChapter, currentChapterIdx, goToChapter, nextPlanBundle, nextBundleAccessible, navigate]);

  const handleVideoEnded = useCallback(() => {
    if (!currentChapter || !bundle) return;

    // If there are more parts in this chapter, go to next part instantly
    if (hasNextPart) {
      goToPart(currentPartIdx + 1);
      return;
    }

    // Last part of chapter — mark chapter complete
    markChapterComplete(String(bundle.id), String(currentChapter.id));

    // Show survey if chapter has assessments
    if (currentChapter.assessments && currentChapter.assessments.length > 0) {
      setPlayerState('survey');
      return;
    }

    // Proceed to next chapter with 5s buffer
    if (hasNextChapter) {
      setPlayerState('up-next');
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            goToChapter(currentChapterIdx + 1);
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
              navigate(playUrl(nextPlanBundle.id, 0, nextPlanBundle.title));
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
  }, [currentChapter, bundle, hasNextPart, hasNextChapter, currentPartIdx, currentChapterIdx, markChapterComplete, goToPart, goToChapter, nextPlanBundle, nextBundleAccessible, navigate]);

  // Cleanup countdown on unmount
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ---- Purchase handler ----

  const handlePurchase = async () => {
    if (!bundle) return;
    setPurchaseError(false);
    const success = await purchaseBundle(bundle.id, oaBundle?.creditsRequired ?? 0);
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
        {/* Survey screen — shown after video if chapter has assessments */}
        {playerState === 'survey' && currentChapter.assessments.length > 0 && (
          <SurveyScreen
            bundleTitle={bundle.title}
            partNumber={currentChapterIdx + 1}
            totalParts={chapters.length}
            assessments={currentChapter.assessments}
            onClose={() => navigate(-1)}
            onComplete={handleSurveyComplete}
          />
        )}

        {/* ChapterVideoPlayer replaces raw <video> */}
        {playerState === 'playing' && (
          <ChapterVideoPlayer
            videoUrl={currentVideoUrl}
            posterImage={currentPosterImage}
            bundleTitle={bundle.title}
            chapterTitle={currentChapter.title}
            partNumber={currentPartIdx + 1}
            totalParts={totalParts}
            duration={currentChapter.duration}
            skipTimestamp={5}
            hasNext={hasNextPart || hasNextChapter}
            hasPrev={hasPrevPart || currentChapterIdx > 0}
            onNext={() => {
              if (hasNextPart) goToPart(currentPartIdx + 1);
              else if (hasNextChapter) goToChapter(currentChapterIdx + 1);
            }}
            onPrev={() => {
              if (hasPrevPart) goToPart(currentPartIdx - 1);
              else if (currentChapterIdx > 0) goToChapter(currentChapterIdx - 1);
            }}
            onClose={() => navigate(-1)}
            onEnded={handleVideoEnded}
            onTitleClick={() => navigate(bundleUrl(Number(bundleId), bundle.title))}
          />
        )}

        {/* Up Next screen */}
        {playerState === 'up-next' && hasNextChapter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <p className="type-tags text-white/50">UP NEXT</p>
            <p className="type-headline-large text-white text-center">{chapters[currentChapterIdx + 1].title}</p>
            <p className="type-description text-white/40">{chapters[currentChapterIdx + 1].duration}</p>

            {/* Countdown play button */}
            <button
              onClick={() => { clearInterval(countdownRef.current); goToChapter(currentChapterIdx + 1); }}
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
                      onClick={() => navigate(playUrl(rec.id, 0, rec.title))}
                    />
                  ))}
                </div>
              </div>
            )}

            <OAButton variant="blue" size="medium" onClick={() => navigate(bundleUrl(Number(bundleId)))}>
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
                onClick={() => { clearInterval(countdownRef.current); navigate(playUrl(nextPlanBundle.id, 0, nextPlanBundle.title)); }}
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
                  onClick={() => { clearInterval(countdownRef.current); navigate(bundleUrl(Number(bundleId))); }}
                  className="flex-1 py-3 rounded-[8px] bg-white/10 type-button text-white text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { clearInterval(countdownRef.current); navigate(playUrl(nextPlanBundle.id, 0, nextPlanBundle.title)); }}
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
              <CoinIcon size={16} />
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
