import * as React from "react"
import Hls from "hls.js"
import { cn } from "@/lib/utils"
import { getAuthHeaders } from "@/services/api"
import { X, Pause, Play, Volume2, VolumeX, Settings, Subtitles, ChevronUp, ChevronDown } from "lucide-react"

/**
 * ChapterVideoPlayer — Figma node 8985:39676
 *
 * Full-screen video player for lesson/bundle chapters.
 * Different from ForYou reel player — has:
 * - Draggable progress bar with section markers
 * - Skip Intro button (jumps to 5s by default)
 * - Part X of Y in header
 * - Closed captions (EN, CN, MS, Off)
 * - Play/pause, volume, speed controls
 */

interface ChapterVideoPlayerProps {
  videoUrl: string
  posterImage?: string
  bundleTitle: string
  chapterTitle: string
  partNumber: number
  totalParts: number
  duration?: string
  skipTimestamp?: number
  hasNext?: boolean
  hasPrev?: boolean
  onNext?: () => void
  onPrev?: () => void
  onClose: () => void
  onEnded: () => void
  onTitleClick?: () => void
  className?: string
}

const CC_OPTIONS = ['Off', 'English', '中文', 'Bahasa Melayu'] as const

function ChapterVideoPlayer({
  videoUrl,
  posterImage,
  bundleTitle,
  chapterTitle,
  partNumber,
  totalParts,
  skipTimestamp = 5,
  hasNext = false,
  hasPrev = false,
  onNext,
  onPrev,
  onClose,
  onEnded,
  onTitleClick,
  className,
}: ChapterVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const progressRef = React.useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [videoError, setVideoError] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [showControls, setShowControls] = React.useState(true)
  const [isDragging, setIsDragging] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [showCCMenu, setShowCCMenu] = React.useState(false)
  const [selectedCC, setSelectedCC] = React.useState<typeof CC_OPTIONS[number]>('Off')
  const [showSkip, setShowSkip] = React.useState(true)
  const [slideDir, setSlideDir] = React.useState<'up' | 'down' | null>(null)
  const controlsTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const touchStartY = React.useRef(0)
  const touchEndY = React.useRef(0)

  // Swipe navigation (mobile)
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchEndY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    const diff = touchStartY.current - touchEndY.current
    if (diff > 80 && hasNext && onNext) {
      setSlideDir('up')
      setTimeout(() => { onNext(); setSlideDir(null) }, 300)
    } else if (diff < -80 && hasPrev && onPrev) {
      setSlideDir('down')
      setTimeout(() => { onPrev(); setSlideDir(null) }, 300)
    }
  }, [hasNext, hasPrev, onNext, onPrev])

  // Keyboard nav
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && hasNext && onNext) {
        e.preventDefault()
        setSlideDir('up')
        setTimeout(() => { onNext(); setSlideDir(null) }, 300)
      } else if (e.key === 'ArrowUp' && hasPrev && onPrev) {
        e.preventDefault()
        setSlideDir('down')
        setTimeout(() => { onPrev(); setSlideDir(null) }, 300)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasNext, hasPrev, onNext, onPrev])

  // Auto-hide controls
  const resetControlsTimer = React.useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (!isDragging && !showCCMenu) setShowControls(false)
    }, 4000)
  }, [isDragging, showCCMenu])

  // HLS + play on mount
  //
  // The backend /media/playlist/<token> returns a 303 redirect to a signed CloudFront
  // CDN URL. The m3u8 master playlist contains relative URLs (file_1.m3u8, segments, etc.)
  // that must resolve against the CDN base URL, not our proxy.
  //
  // Strategy: resolve the redirect via a same-origin proxy fetch (redirect: 'manual')
  // to extract the CDN URL from the Location header, then give HLS.js the CDN URL.
  const hlsRef = React.useRef<Hls | null>(null)

  // Resolve /media/playlist/ URL → signed CloudFront CDN URL via /resolve-media/ endpoint.
  // The endpoint hits the backend, captures the 303 redirect Location, and returns the CDN URL as text.
  const resolveCdnUrl = React.useCallback(async (url: string): Promise<string> => {
    if (!url.includes('/media/playlist/')) return url

    // Strip upstream domain and use /resolve-media/ prefix
    const mediaPath = url.startsWith('https://app.theopenacademy.org')
      ? url.replace('https://app.theopenacademy.org/media/', '')
      : url.replace(/^\/media\//, '')

    try {
      const res = await fetch(`/resolve-media/${mediaPath}`, {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const cdnUrl = (await res.text()).trim()
        if (cdnUrl.startsWith('https://')) return cdnUrl
      }
    } catch (e) {
      console.warn('Failed to resolve CDN URL:', e)
    }
    // Fallback: return original URL (will likely fail but worth trying)
    return url
  }, [])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    let cancelled = false

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const isHls = videoUrl.includes('.m3u8') || videoUrl.includes('playlist')

    const initPlayer = async () => {
      let finalUrl = videoUrl
      if (isHls) {
        finalUrl = await resolveCdnUrl(videoUrl)
        if (cancelled) return
      }

      if (isHls && Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(finalUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) video.play().catch(() => setIsPlaying(false))
        })
        hls.on(Hls.Events.ERROR, (_event: string, data: { fatal?: boolean; type?: string }) => {
          if (data.fatal) {
            console.warn('HLS fatal error — video unavailable')
            if (!cancelled) {
              setIsPlaying(false)
              setVideoError(true)
            }
          }
        })
      } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS — handles redirects natively
        video.src = finalUrl
        video.addEventListener('loadedmetadata', () => {
          if (!cancelled) video.play().catch(() => setIsPlaying(false))
        }, { once: true })
        video.addEventListener('error', () => {
          if (!cancelled) {
            setIsPlaying(false)
            setVideoError(true)
          }
        }, { once: true })
      } else {
        video.src = finalUrl
        video.play().catch(() => setIsPlaying(false))
      }
    }

    initPlayer()
    resetControlsTimer()
    return () => {
      cancelled = true
      clearTimeout(controlsTimer.current)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoUrl])

  // Time update
  const handleTimeUpdate = React.useCallback(() => {
    if (!videoRef.current || isDragging) return
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.currentTime > skipTimestamp) setShowSkip(false)
  }, [isDragging, skipTimestamp])

  const handleLoadedMetadata = React.useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }, [])

  // Play/pause
  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
    resetControlsTimer()
  }, [isPlaying, resetControlsTimer])

  // Volume
  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  // Speed
  const cycleSpeed = React.useCallback(() => {
    const speeds = [1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]
    if (videoRef.current) videoRef.current.playbackRate = next
    setPlaybackRate(next)
  }, [playbackRate])

  // Skip intro
  const handleSkip = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = skipTimestamp
      setShowSkip(false)
    }
  }, [skipTimestamp])

  // Progress bar drag
  const handleProgressInteraction = React.useCallback((clientX: number) => {
    if (!progressRef.current || !videoRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    videoRef.current.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }, [duration])

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    handleProgressInteraction(e.clientX)
  }, [handleProgressInteraction])

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (isDragging) handleProgressInteraction(e.clientX)
  }, [isDragging, handleProgressInteraction])

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  // Format time
  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Shared controls overlay
  const controlsOverlay = (
    <>
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* ---- Top bar ---- */}
      <div className={cn(
        "absolute top-0 inset-x-0 z-10 px-4 pt-6 pb-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-start justify-between">
          <div>
            {onTitleClick ? (
              <button onClick={onTitleClick} className="font-serif italic text-[16px] text-white leading-normal hover:underline text-left">
                {chapterTitle}
              </button>
            ) : (
              <p className="font-serif italic text-[16px] text-white leading-normal">{chapterTitle}</p>
            )}
            <p className="type-pre-text text-white/70">Part {partNumber} of {totalParts}</p>
          </div>
          {/* Close button — mobile only (desktop has it outside the container) */}
          <button onClick={onClose} className="md:hidden w-10 h-10 flex items-center justify-center">
            <X size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* ---- Bottom controls ---- */}
      <div className={cn(
        "absolute bottom-0 inset-x-0 z-10 px-4 pb-6 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Skip Intro button */}
        {showSkip && currentTime < skipTimestamp && (
          <div className="flex justify-end mb-3">
            <button
              onClick={handleSkip}
              className="bg-white/20 rounded-full px-4 py-2 type-tags text-white normal-case"
            >
              Skip Intro
            </button>
          </div>
        )}

        {/* Section label + progress bar */}
        <div className="flex flex-col gap-3 mb-4">
          <span className="type-tags text-accent-yellow normal-case text-[10px] font-bold">
            {currentTime < skipTimestamp ? 'Intro' : chapterTitle}
          </span>

          {/* Progress bar — draggable */}
          <div
            ref={progressRef}
            className="relative h-2 bg-white/30 rounded-full cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div
              className="absolute h-full bg-accent-blue rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute w-0.5 h-4 -top-1 bg-accent-yellow rounded-full"
              style={{ left: `0%` }}
            />
            <div
              className="absolute w-0.5 h-4 -top-1 bg-white/70 rounded-full"
              style={{ left: `${duration > 0 ? (skipTimestamp / duration) * 100 : 15}%` }}
            />
            <div
              className="absolute w-3 h-3 -top-0.5 bg-white/0 rounded-full shadow-lg"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>

        {/* Control buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {isPlaying ? <Pause size={16} className="text-white fill-white" /> : <Play size={16} className="text-white fill-white ml-0.5" />}
            </button>
            <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </button>
            <span className="text-[12px] text-white font-medium tabular-nums font-sans">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            <button onClick={cycleSpeed} className="h-9 rounded-full bg-white/20 flex items-center justify-center gap-1 px-3">
              <Settings size={14} className="text-white" />
              <span className="text-[10px] text-white font-bold">{playbackRate}x</span>
            </button>
            <button onClick={() => setShowCCMenu(!showCCMenu)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Subtitles size={16} className={selectedCC !== 'Off' ? 'text-accent-blue' : 'text-white'} />
            </button>

            {showCCMenu && (
              <div className="absolute bottom-12 right-0 bg-bg-overlay/95 rounded-[12px] p-2 min-w-[160px] flex flex-col gap-1 z-20">
                {CC_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSelectedCC(opt); setShowCCMenu(false); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-left type-description transition-colors",
                      selectedCC === opt ? "bg-white/20 text-white font-semibold" : "text-white/70 hover:bg-white/10"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  // Slide animation classes
  const slideClass = slideDir === 'up'
    ? 'animate-[slideOutUp_300ms_ease-in-out_forwards]'
    : slideDir === 'down'
    ? 'animate-[slideOutDown_300ms_ease-in-out_forwards]'
    : 'animate-[slideInUp_400ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]'

  return (
    <div
      className={cn("fixed inset-0 z-[100] bg-black flex items-center justify-center", className)}
      onClick={resetControlsTimer}
    >
      {/* Slide animation keyframes */}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `}</style>

      {/* Desktop layout: video + side controls in a flex row */}
      <div className="w-full h-full md:flex md:items-center md:justify-center md:gap-4">

      {/* Video container — full-screen on mobile, centered 9:16 on desktop */}
      <div
        className={cn(
          "relative w-full h-full md:w-auto md:h-auto md:rounded-2xl md:overflow-hidden md:shrink-0",
          slideClass
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop sizing wrapper */}
        <div
          className="relative w-full h-full"
          style={{
            // On desktop, these CSS custom properties constrain the size
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              [data-chapter-video-container] {
                width: min(420px, calc((100vh - 64px) * 9 / 16)) !important;
                height: min(calc(100vh - 64px), calc(420px * 16 / 9)) !important;
                border-radius: 16px;
                overflow: hidden;
              }
            }
          `}</style>
          <div data-chapter-video-container="" className="relative w-full h-full">
            {/* Poster image behind video */}
            {posterImage && (
              <img src={posterImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              poster={posterImage}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={onEnded}
              onClick={togglePlay}
            />
            {/* Video unavailable overlay */}
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 px-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Play size={24} className="text-white/50 ml-1" />
                </div>
                <p className="type-headline-medium text-white text-center mb-2">Video unavailable</p>
                <p className="type-description text-white/50 text-center max-w-[260px]">
                  This video requires authentication from the native app. It will be available once the backend enables web streaming.
                </p>
              </div>
            )}
            {controlsOverlay}
          </div>
        </div>
      </div>

      {/* Desktop side controls — close + nav arrows, adjacent to video */}
      <div className="hidden md:flex flex-col items-center gap-4 shrink-0">
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={22} className="text-white" />
        </button>

        <div className="flex-1" />

        {/* Nav arrows */}
        {(hasNext || hasPrev) && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => { if (hasPrev && onPrev) { setSlideDir('down'); setTimeout(() => { onPrev(); setSlideDir(null) }, 300) } }}
              disabled={!hasPrev}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                hasPrev ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/5 text-white/20 pointer-events-none"
              )}
            >
              <ChevronUp size={20} />
            </button>
            <span className="type-pre-text text-white/40 tabular-nums">{partNumber}/{totalParts}</span>
            <button
              onClick={() => { if (hasNext && onNext) { setSlideDir('up'); setTimeout(() => { onNext(); setSlideDir(null) }, 300) } }}
              disabled={!hasNext}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                hasNext ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/5 text-white/20 pointer-events-none"
              )}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}

        <div className="flex-1" />
      </div>

      </div>{/* end desktop flex row */}
    </div>
  )
}

export { ChapterVideoPlayer, type ChapterVideoPlayerProps }
