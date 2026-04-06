export interface Creator {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar: string;
}

export interface ForYouVideo {
  id: number;
  type: 'foryou';
  title: string;
  fullTitle: string;
  category: string;
  description: string;
  keywords: string[];
  seriesCount: number;
  totalMinutes: number;
  thumbnail: string;
  videoUrl: string;
}

export type PartType = 'video' | 'survey' | 'image';

export interface VideoPart {
  type: 'video';
  videoUrl: string;
}

export interface SurveyPart {
  type: 'survey';
  question: string;
  options: { id: string; text: string }[];
}

export interface ImagePart {
  type: 'image';
  imageUrl: string;
  caption?: string;
}

export type LessonPart = VideoPart | SurveyPart | ImagePart;

export interface Chapter {
  id: number;
  title: string;
  duration: string;
  coins: number;
  parts: LessonPart[];
  thumbnail: string;
}

export interface Bundle {
  id: number;
  lessonId: number | null; // null = standalone bundle (shown in Originals), number = part of a lesson plan
  type: 'bundle';
  title: string;
  subtitle: string;
  description: string;
  category: string;
  seriesCount: number;
  totalMinutes: number;
  price: number;
  isFree: boolean;
  chapters: Chapter[];
  thumbnail: string;
  creator: Creator;
}

export interface LessonPlan {
  id: number;
  type: 'lesson';
  title: string;
  fullTitle: string;
  category: string;
  description: string;
  keywords: string[];
  seriesCount: number;
  totalMinutes: number;
  rating: number;
  reviews: number;
  lessonPlanCoins: number;
  thumbnail: string;
  background: string;
  bundles: Bundle[];
  targetAudience: string[];
  learningPoints: string[];
  certificateOnCompletion: boolean;
}

export interface WatchProgress {
  contentId: string;
  contentType: 'foryou' | 'bundle' | 'lesson';
  chapterId?: string;
  currentTime: number;
  duration: number;
  completedChapters?: string[];
  lastWatchedAt: number;
}
