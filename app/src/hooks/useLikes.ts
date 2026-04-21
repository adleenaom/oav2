import { useState, useCallback } from 'react';

export interface LikedVideo {
  id: number;
  title: string;
  thumbnail: string;
  likedAt: number;
}

const STORAGE_KEY = 'oa_liked_videos';

function load(): LikedVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: LikedVideo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useLikes() {
  const [likes, setLikes] = useState<LikedVideo[]>(load);

  const isLiked = useCallback((videoId: number): boolean => {
    return likes.some(v => v.id === videoId);
  }, [likes]);

  const toggleLike = useCallback((video: { id: number; title: string; thumbnail: string }) => {
    setLikes(prev => {
      const exists = prev.some(v => v.id === video.id);
      const next = exists
        ? prev.filter(v => v.id !== video.id)
        : [...prev, { id: video.id, title: video.title, thumbnail: video.thumbnail, likedAt: Date.now() }];
      save(next);
      return next;
    });
  }, []);

  const removeLike = useCallback((videoId: number) => {
    setLikes(prev => {
      const next = prev.filter(v => v.id !== videoId);
      save(next);
      return next;
    });
  }, []);

  return { likes, isLiked, toggleLike, removeLike };
}
