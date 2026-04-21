import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Pause, Play, Volume2, VolumeX, Settings, Subtitles } from "lucide-react"

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
  bundleTitle: string
  chapterTitle: string
  partNumber: number
  totalParts: number
  duration?: string
  skipTimestamp?: number // seconds to skip intro to (default 5)
  onClose: () => void
  onEnded: () => void
  className?: string
}

const CC_OPTIONS = ['Off', 'English', '中文', 'Bahasa Melayu'] as const

function ChapterVideoPlayer({
  videoUrl,
  bundleTitle,
  chapterTitle,
  partNumber,
  totalParts,
  skipTimestamp = 5,
  onClose,
  onEnded,
  className,
}: ChapterVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const progressRef = React.useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [isMuted, setIsMuted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [showControls, setShowControls] = React.useState(true)
  const [isDragging, setIsDragging] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [showCCMenu, setShowCCMenu] = React.useState(false)
  const [selectedCC, setSelectedCC] = React.useState<typeof CC_OPTIONS[number]>('Off')
  const [showSkip, setShowSkip] = React.useState(true)
  const controlsTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  // Auto-hide controls
  const resetControlsTimer = React.useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (!isDragging && !showCCMenu) setShowControls(false)
    }, 4000)
  }, [isDragging, showCCMenu])

  // Play on mount
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false))
    }
    resetControlsTimer()
    return () => clearTimeout(controlsTimer.current)
  }, [])

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

  return (
    <div
      className={cn("fixed inset-0 z-[100] bg-black flex flex-col", className)}
      onClick={resetControlsTimer}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoUrl}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        onClick={togglePlay}
      />

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
            <p className="font-serif italic text-[16px] text-white leading-normal">{bundleTitle}</p>
            <p className="type-pre-text text-white/70">Part {partNumber} of {totalParts}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
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
            {/* Filled progress */}
            <div
              className="absolute h-full bg-accent-blue rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Section marker: intro end */}
            <div
              className="absolute w-0.5 h-4 -top-1 bg-accent-yellow rounded-full"
              style={{ left: `0%` }}
            />
            {/* Section marker: skip point */}
            <div
              className="absolute w-0.5 h-4 -top-1 bg-white/70 rounded-full"
              style={{ left: `${duration > 0 ? (skipTimestamp / duration) * 100 : 15}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute w-3 h-3 -top-0.5 bg-white/0 rounded-full shadow-lg"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>

        {/* Control buttons row */}
        <div className="flex items-center justify-between">
          {/* Left: pause, volume, time */}
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

          {/* Right: speed, CC */}
          <div className="flex items-center gap-2 relative">
            <button onClick={cycleSpeed} className="h-9 rounded-full bg-white/20 flex items-center justify-center gap-1 px-3">
              <Settings size={14} className="text-white" />
              <span className="text-[10px] text-white font-bold">{playbackRate}x</span>
            </button>
            <button onClick={() => setShowCCMenu(!showCCMenu)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Subtitles size={16} className={selectedCC !== 'Off' ? 'text-accent-blue' : 'text-white'} />
            </button>

            {/* CC dropdown */}
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
    </div>
  )
}

export { ChapterVideoPlayer, type ChapterVideoPlayerProps }
