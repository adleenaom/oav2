import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '@/components/ui/video-player';
import type { VideoItem } from '@/components/ui/video-player';
import { useApi } from '../hooks/useApi';
import { useProgress } from '../hooks/useProgress';
import { useCallback } from 'react';
import type { ApiHomeListings } from '../services/types';

export default function ForYouPlayer() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const { updateForYouProgress } = useProgress();
  const { data } = useApi<ApiHomeListings>('/listings/home');

  const forYouVideos = data?.for_you ?? [];

  const videos: VideoItem[] = forYouVideos.map(v => ({
    id: v.id,
    title: v.title,
    fullTitle: v.full_title,
    category: v.category,
    description: v.description,
    keywords: [],
    videoUrl: v.video_url,
    thumbnail: v.thumbnail,
  }));

  const handleProgressUpdate = useCallback(
    (videoId: string | number, currentTime: number, duration: number) => {
      updateForYouProgress(String(videoId), currentTime, duration);
    },
    [updateForYouProgress]
  );

  if (videos.length === 0) {
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
