import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '@/components/ui/video-player';
import type { VideoItem } from '@/components/ui/video-player';
import { useHomepage } from '../hooks/useHomepage';
import { useProgress } from '../hooks/useProgress';
import { useCallback } from 'react';

export default function ForYouPlayer() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const { updateForYouProgress } = useProgress();
  const { forYou, isLoading } = useHomepage();

  const videos: VideoItem[] = forYou.map(v => ({
    id: v.id,
    title: v.title,
    fullTitle: v.title,
    category: '',
    description: '',
    keywords: [],
    videoUrl: v.video.source,
    thumbnail: v.video.image,
  }));

  const handleProgressUpdate = useCallback(
    (videoId: string | number, currentTime: number, duration: number) => {
      updateForYouProgress(String(videoId), currentTime, duration);
    },
    [updateForYouProgress]
  );

  if (isLoading || videos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="type-body-default text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <VideoPlayer
      videos={videos}
      initialIndex={parseInt(index || '0', 10)}
      onBack={() => navigate(-1)}
      onProgressUpdate={handleProgressUpdate}
    />
  );
}
