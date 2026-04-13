import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '../hooks/useApi';
import { useProgress } from '../hooks/useProgress';
import { useCredits } from '../hooks/useCredits';
import OAButton from '../components/OAButton';
import BundleThumbnail from '../components/BundleThumbnail';
import type { ApiBundleDetail } from '../services/types';

type PlayerState = 'playing' | 'up-next' | 'end-of-bundle' | 'locked';

export default function ChapterPlayer() {
  const { bundleId, chapterIndex } = useParams<{ bundleId: string; chapterIndex: string }>();
  const navigate = useNavigate();
  const { trackChapterWatch, markChapterComplete, resetChapterProgress, getBundleProgress } = useProgress();
  const { credits, purchaseBundle } = useCredits();

  const { data: bundle } = useApi<ApiBundleDetail>(bundleId ? `/bundles/${bundleId}` : null);
  const { data: recommendations } = useApi<{ id: number; title: string; thumbnail: string; category: string; is_free: boolean; credits_required: number }[]>(
    bundleId ? `/recommendations/similar/${bundleId}` : null
  );

  const chapters = bundle?.series?.flatMap(s => s.chapters) ?? [];
  const [currentIdx, setCurrentIdx] = useState(parseInt(chapterIndex || '0', 10));
  const [playerState, setPlayerState] = useState<PlayerState>('playing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [purchaseError, setPurchaseError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const currentChapter = chapters[currentIdx];
  const hasNext = currentIdx < chapters.length - 1;
  const progress = getBundleProgress(bundleId || '');
  const isCompleted = progress?.completedChapters?.includes(String(currentChapter?.id));

  // Get video URL from chapter parts
  const getVideoUrl = useCallback((ch: typeof chapters[0]) => {
    const vp = ch?.parts?.find((p: { type: string }) => p.type === 'video');
    return (vp as { url?: string })?.url || '';
  }, []);

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

  // ---- Swipe handling ----

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartY.current - touchEndY.current;
    if (diff > 60) {
      // Swipe up → skip to next part/chapter
      if (playerState === 'playing') {
        if (hasNext) {
          goToChapter(currentIdx + 1);
        } else {
          setPlayerState('end-of-bundle');
        }
      }
    } else if (diff < -60) {
      // Swipe down → go back
      if (currentIdx > 0) goToChapter(currentIdx - 1);
    }
  }, [playerState, hasNext, currentIdx, goToChapter]);

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
      chapterThumbnail: currentChapter.thumbnail || bundle.thumbnail,
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
      setPlayerState('end-of-bundle');
    }
  }, [currentChapter, bundle, hasNext, currentIdx, markChapterComplete, goToChapter]);

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

      {/* ---- Mobile: full-screen ---- */}
      <div
        className="md:hidden relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video */}
        {playerState === 'playing' && (
          <div className={cn(
            'absolute inset-0 transition-transform duration-300',
            isTransitioning ? '-translate-y-full' : 'translate-y-0'
          )}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={getVideoUrl(currentChapter)}
              playsInline
              onEnded={handleVideoEnded}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 pt-14 pb-3">
              <button onClick={() => navigate(-1)} className="bg-black/50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <ChevronLeft size={13} className="text-white" />
                <span className="type-button text-white">Back</span>
              </button>
              <span className="type-tags text-white/60">{currentIdx + 1}/{chapters.length}</span>
            </div>

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8">
              <p className="type-tags text-white/50 mb-1">{bundle.category}</p>
              <p className="type-headline-medium text-white">{currentChapter.title}</p>
              <p className="type-description text-white/60 mt-1">{currentChapter.duration}</p>
            </div>
          </div>
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

        {/* Locked screen (lesson plan — next bundle not purchased) */}
        {playerState === 'locked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6">
            <Lock size={48} className="text-accent-magenta" />
            <p className="type-headline-large text-white text-center">This bundle is locked</p>
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

      {/* ---- Desktop: centered vertical video ---- */}
      <div className="hidden md:flex items-center justify-center w-full h-full gap-6">
        <div className="w-16 shrink-0" />

        {/* Video container */}
        <div
          className="relative bg-black rounded-2xl overflow-hidden shrink-0"
          style={{
            width: 'min(380px, calc((100vh - 96px) * 9 / 16))',
            height: 'min(calc(100vh - 96px), calc(380px * 16 / 9))',
          }}
        >
          {playerState === 'playing' && (
            <div className={cn(
              'absolute inset-0 transition-transform duration-300',
              isTransitioning ? '-translate-y-full' : 'translate-y-0'
            )}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={getVideoUrl(currentChapter)}
                playsInline
                onEnded={handleVideoEnded}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* Top bar */}
              <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4">
                <button onClick={() => navigate(-1)} className="bg-black/50 rounded-lg px-3 py-1.5 flex items-center gap-1">
                  <ChevronLeft size={12} className="text-white" />
                  <span className="type-button text-white text-[10px]">Back</span>
                </button>
                <span className="type-tags text-white/60">{currentIdx + 1}/{chapters.length}</span>
              </div>

              {/* Bottom info */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
                <p className="type-tags text-white/50 mb-1">{bundle.category}</p>
                <p className="type-headline-small text-white">{currentChapter.title}</p>
                <p className="type-pre-text text-white/50 mt-0.5">{currentChapter.duration}</p>
              </div>
            </div>
          )}

          {/* Up Next overlay */}
          {playerState === 'up-next' && hasNext && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-4">
              <p className="type-tags text-white/50">UP NEXT</p>
              <p className="type-headline-medium text-white text-center">{chapters[currentIdx + 1].title}</p>
              <button
                onClick={() => { clearInterval(countdownRef.current); goToChapter(currentIdx + 1); }}
                className="relative w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mt-2"
              >
                <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="white" strokeOpacity="0.2" strokeWidth="3" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" fill="none"
                    strokeDasharray={`${((5 - countdown) / 5) * 176} 176`} strokeLinecap="round" />
                </svg>
                <Play size={22} className="text-white fill-white ml-0.5" />
              </button>
              <p className="type-pre-text text-white/40">{countdown}s</p>
            </div>
          )}

          {/* End of bundle overlay */}
          {playerState === 'end-of-bundle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-4">
              <p className="type-tags text-accent-green">COMPLETE</p>
              <p className="type-headline-small text-white text-center">{bundle.title}</p>
              <OAButton variant="blue" size="medium-compact" onClick={() => navigate(`/bundle/${bundleId}`)}>
                Back to Bundle
              </OAButton>
            </div>
          )}

          {/* Locked overlay */}
          {playerState === 'locked' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-4">
              <Lock size={32} className="text-accent-magenta" />
              <p className="type-headline-small text-white text-center">Locked</p>
              <OAButton variant="primary" size="medium-compact" onClick={handlePurchase}>Unlock</OAButton>
            </div>
          )}
        </div>

        {/* Right side — nav + info */}
        <div className="flex flex-col items-center justify-center gap-4 w-16 shrink-0">
          <button
            onClick={() => currentIdx > 0 && goToChapter(currentIdx - 1)}
            className={cn('w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white', currentIdx === 0 && 'opacity-30')}
          >
            <ChevronLeft size={16} className="rotate-90" />
          </button>
          <span className="type-tags text-white/40 tabular-nums">{currentIdx + 1}/{chapters.length}</span>
          <button
            onClick={() => {
              if (hasNext) goToChapter(currentIdx + 1);
              else setPlayerState('end-of-bundle');
            }}
            className={cn('w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white')}
          >
            <ChevronLeft size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
