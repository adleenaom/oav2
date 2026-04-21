import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Heart,
  Share2,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLikes } from "@/hooks/useLikes"
import ShareModal from "@/components/ShareModal"

/* ============================================
 * VideoPlayer — YouTube Shorts-style centered layout
 *
 * Mobile: 9:16 video fills viewport, swipe up/down to navigate
 * Desktop: 9:16 video centered in dark bg, arrows + actions on right
 *
 * Spacing rules (all content has padding from edges):
 *   - Top bar: px-4 (16px), pt-14 mobile / pt-4 desktop
 *   - Bottom info: px-4 (16px), pb-6 (24px)
 *   - Action rail: gap-6 (24px) between buttons
 *   - Desktop nav: gap-3 (12px), right-6 (24px) from video
 *   - Mobile action rail: right-4 (16px) from edge
 *   - Desktop action rail: right-4 (16px) from video edge
 * ============================================ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VideoItem {
  id: string | number
  title: string
  fullTitle?: string
  category?: string
  description?: string
  keywords?: string[]
  videoUrl: string
  thumbnail?: string
}

interface VideoPlayerProps {
  videos: VideoItem[]
  initialIndex?: number
  onBack?: () => void
  onProgressUpdate?: (videoId: string | number, currentTime: number, duration: number) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PlayPauseIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      data-slot="play-pause-indicator"
      className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in duration-200"
    >
      <div className="size-16 rounded-full bg-black/40 flex items-center justify-center">
        {isPlaying ? (
          <Pause className="size-8 text-white fill-white" />
        ) : (
          <Play className="size-8 text-white fill-white" />
        )}
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      data-slot="action-button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 w-12 transition-all active:scale-95"
    >
      <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
        <Icon
          className={cn(
            "size-5 transition-colors",
            active ? "text-accent-magenta fill-accent-magenta" : "text-white"
          )}
        />
      </div>
      <span className="type-tags text-white/80 text-[10px] normal-case">
        {label}
      </span>
    </button>
  )
}

function VideoInfo({ video }: { video: VideoItem }) {
  return (
    <div data-slot="video-info" className="flex flex-col gap-1.5">
      {video.category && (
        <p className="type-tags text-white/50">{video.category}</p>
      )}
      <p className="type-headline-medium text-white leading-snug">
        {video.fullTitle || video.title}
      </p>
      {video.description && (
        <p className="type-description text-white/60 mt-0.5 line-clamp-2">
          {video.description}
        </p>
      )}
      {video.keywords && video.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {video.keywords.slice(0, 3).map((tag) => (
            <span key={tag} className="type-pre-text text-accent-blue">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function VideoPlayer({
  videos,
  initialIndex = 0,
  onBack,
  onProgressUpdate,
  className,
}: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [showControls, setShowControls] = React.useState(false)
  const [showShare, setShowShare] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const controlsTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const { isLiked, toggleLike } = useLikes()

  // Touch state
  const touchStartY = React.useRef(0)
  const touchEndY = React.useRef(0)
  const isSwiping = React.useRef(false)

  const currentVideo = videos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < videos.length - 1

  // Navigation
  const goTo = React.useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < videos.length) setCurrentIndex(idx)
    },
    [videos.length]
  )
  const goPrev = React.useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])
  const goNext = React.useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])

  // Touch — swipe up = next, swipe down = prev
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchEndY.current = e.touches[0].clientY
    isSwiping.current = true
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (isSwiping.current) touchEndY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    if (!isSwiping.current) return
    isSwiping.current = false
    const diff = touchStartY.current - touchEndY.current
    if (diff > 60 && hasNext) goNext()
    else if (diff < -60 && hasPrev) goPrev()
  }, [hasNext, hasPrev, goNext, goPrev])

  // Play/pause on tap
  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => setShowControls(false), 1500)
  }, [isPlaying])

  // Keyboard — ArrowUp/Down to navigate, Space to play/pause
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") { e.preventDefault(); goNext() }
      else if (e.key === "ArrowUp") { e.preventDefault(); goPrev() }
      else if (e.key === " ") { e.preventDefault(); togglePlay() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, togglePlay])

  // Auto-play on video change
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }, [currentIndex])

  // Progress tracking
  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current && currentVideo && onProgressUpdate) {
      onProgressUpdate(currentVideo.id, videoRef.current.currentTime, videoRef.current.duration)
    }
  }, [currentVideo, onProgressUpdate])

  // Auto-advance on end
  const handleEnded = React.useCallback(() => {
    if (hasNext) goNext()
  }, [hasNext, goNext])

  const handleLike = React.useCallback(() => {
    if (!currentVideo) return
    toggleLike({
      id: currentVideo.id as number,
      title: currentVideo.fullTitle || currentVideo.title,
      thumbnail: currentVideo.thumbnail || '',
    })
  }, [currentVideo, toggleLike])

  const handleShare = React.useCallback(async () => {
    if (!currentVideo) return
    const shareUrl = `${window.location.origin}/foryou/${currentIndex}`
    const shareTitle = currentVideo.fullTitle || currentVideo.title

    // Try native share first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl })
        return
      } catch {
        // User cancelled or not supported — fall through to modal
      }
    }
    setShowShare(true)
  }, [currentVideo, currentIndex])

  const videoLiked = currentVideo ? isLiked(currentVideo.id as number) : false

  if (!currentVideo) return null

  return (
    <div
      data-slot="video-player"
      className={cn(
        "fixed inset-0 z-50 bg-black flex items-center justify-center",
        className
      )}
    >
      {/* ======== MOBILE: full-screen 9:16 ======== */}
      <div
        className="md:hidden relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video surface */}
        <div className="absolute inset-0" onClick={togglePlay}>
          <video
            ref={videoRef}
            className="size-full object-cover"
            src={currentVideo.videoUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          {showControls && <PlayPauseIndicator isPlaying={isPlaying} />}
        </div>

        {/* Top bar — px-4 pt-14 pb-3 */}
        <div
          data-slot="top-bar"
          className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 pt-14 pb-3"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <span className="type-headline-small text-white">For You</span>
          <div className="size-8" />
        </div>

        {/* Action rail — right-4 bottom-28 */}
        <div
          data-slot="action-rail"
          className="absolute right-4 bottom-28 z-10 flex flex-col items-center gap-4"
        >
          <div className="size-10 rounded-full border-2 border-white overflow-hidden mb-2">
            {currentVideo.thumbnail && (
              <img src={currentVideo.thumbnail} alt="" className="size-full object-cover" />
            )}
          </div>
          <ActionButton icon={Heart} label="Like" active={videoLiked} onClick={handleLike} />
          <ActionButton icon={Share2} label="Share" onClick={handleShare} />
        </div>

        {/* Bottom info — px-4 pb-8, right padding clears action rail */}
        <div
          data-slot="bottom-info"
          className="absolute inset-x-0 bottom-0 z-10 px-4 pb-8 pr-20"
        >
          <VideoInfo video={currentVideo} />
        </div>
      </div>

      {/* ======== DESKTOP: centered 9:16 video + side controls ======== */}
      <div className="hidden md:flex items-center justify-center w-full h-full gap-6">
        {/* Left spacer for centering */}
        <div className="w-16 shrink-0" />

        {/* Video container — 9:16 aspect, max height viewport */}
        <div
          className="relative bg-black rounded-2xl overflow-hidden shrink-0"
          style={{
            width: 'min(380px, calc((100vh - 96px) * 9 / 16))',
            height: 'min(calc(100vh - 96px), calc(380px * 16 / 9))',
          }}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            className="size-full object-cover"
            src={currentVideo.videoUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          {showControls && <PlayPauseIndicator isPlaying={isPlaying} />}

          {/* Top bar inside video — p-4 */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); onBack?.() }}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <span className="type-headline-small text-white text-[13px]">For You</span>
            <div className="size-7" />
          </div>

          {/* Bottom info inside video — px-4 pb-4 */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
            <VideoInfo video={currentVideo} />
          </div>
        </div>

        {/* Right side — nav arrows + action buttons */}
        <div className="flex flex-col items-center justify-center gap-8 w-16 shrink-0">
          {/* Navigation arrows */}
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              disabled={!hasPrev}
              className={cn(
                "rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white",
                !hasPrev && "opacity-30 pointer-events-none"
              )}
            >
              <ChevronUp className="size-5" />
            </Button>
            <span className="type-tags text-white/40 tabular-nums">
              {currentIndex + 1}/{videos.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              disabled={!hasNext}
              className={cn(
                "rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white",
                !hasNext && "opacity-30 pointer-events-none"
              )}
            >
              <ChevronDown className="size-5" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-4">
            <ActionButton icon={Heart} label="Like" active={videoLiked} onClick={handleLike} />
            <ActionButton icon={Share2} label="Share" onClick={handleShare} />
          </div>
        </div>
      </div>

      {/* Share modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={currentVideo.fullTitle || currentVideo.title}
        url={`${window.location.origin}/foryou/${currentIndex}`}
      />
    </div>
  )
}

export { VideoPlayer, type VideoItem, type VideoPlayerProps }
