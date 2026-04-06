/**
 * ============================================
 * OPENACADEMY VIDEO ASSETS
 * ============================================
 *
 * This file centralizes all video URLs used throughout the app.
 * Titles and descriptions are pulled from assets/content.ts for consistency.
 *
 * INSTRUCTIONS:
 * 1. Find the section for the video you want to replace
 * 2. Update the URL with your new video URL
 * 3. The change will automatically reflect across the app
 *
 * VIDEO ID NAMESPACING:
 * - Duit Yourself Bundle Lessons: 1-2 (unique videos)
 * - Other Bundle Lessons: 3-99
 * - For You Videos: 1001-1099
 * - OpenAcademy Originals: 2001-2099
 */

import { FOR_YOU_CONTENT, ORIGINALS_CONTENT, BUNDLES_CONTENT } from './content';

// ============================================
// PLACEHOLDER VIDEO URL (used for most videos)
// ============================================
export const PLACEHOLDER_VIDEO_URL =
'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4';

// ============================================
// VIDEO URLS BY CONTENT TYPE
// ============================================

// Duit Yourself unique video URLs
export const DUIT_YOURSELF_VIDEO_URLS = {
  howMuchDoIMake:
  'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C01_HowMuchDoIActuallyMake.mp4',
  understandingDeductions:
  'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C02_UnderstandingDeductions.mp4'
};

// For You video URLs (all use placeholder for now)
export const FOR_YOU_VIDEO_URLS: Record<number, string> = {
  1: PLACEHOLDER_VIDEO_URL,
  2: PLACEHOLDER_VIDEO_URL,
  3: PLACEHOLDER_VIDEO_URL,
  4: PLACEHOLDER_VIDEO_URL
};

// Originals video URLs (all use placeholder for now)
export const ORIGINALS_VIDEO_URLS: Record<number, string> = {
  1: PLACEHOLDER_VIDEO_URL,
  2: PLACEHOLDER_VIDEO_URL,
  3: PLACEHOLDER_VIDEO_URL,
  4: PLACEHOLDER_VIDEO_URL,
  5: PLACEHOLDER_VIDEO_URL,
  6: PLACEHOLDER_VIDEO_URL
};

// Bundle lesson video URLs
export const BUNDLE_LESSON_VIDEO_URLS: Record<number, string> = {
  1: DUIT_YOURSELF_VIDEO_URLS.howMuchDoIMake,
  2: DUIT_YOURSELF_VIDEO_URLS.understandingDeductions,
  5: PLACEHOLDER_VIDEO_URL,
  6: PLACEHOLDER_VIDEO_URL,
  7: PLACEHOLDER_VIDEO_URL,
  8: PLACEHOLDER_VIDEO_URL,
  9: PLACEHOLDER_VIDEO_URL,
  10: PLACEHOLDER_VIDEO_URL,
  11: PLACEHOLDER_VIDEO_URL,
  12: PLACEHOLDER_VIDEO_URL
};

// ============================================
// VIDEO TYPE DEFINITION
// ============================================
export interface VideoAsset {
  id: number;
  title: string;
  url: string;
  summary: string;
  isMock: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get video for a bundle lesson by lesson ID
 * Pulls title from BUNDLES_CONTENT for consistency
 */
export function getVideoForLessonId(lessonId: number): VideoAsset {
  // Find the lesson in bundles content
  let lessonTitle = 'Lesson Video';
  let lessonSummary = 'This lesson video content will be available soon.';

  for (const bundle of BUNDLES_CONTENT) {
    const lesson = bundle.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      lessonTitle = lesson.title;
      // Generate summary based on bundle context
      lessonSummary = `Learn about ${lesson.title.toLowerCase()} in this ${lesson.duration} lesson from the "${bundle.title}" bundle.`;
      break;
    }
  }

  const url = BUNDLE_LESSON_VIDEO_URLS[lessonId] || PLACEHOLDER_VIDEO_URL;
  const isMock = lessonId !== 1 && lessonId !== 2; // Only lessons 1 & 2 have real videos

  return {
    id: lessonId,
    title: lessonTitle,
    url,
    summary: lessonSummary,
    isMock
  };
}

/**
 * Get video for a "For You" item by its ID (1-4)
 * Pulls title and description from FOR_YOU_CONTENT for consistency
 */
export function getVideoForForYouId(forYouId: number): VideoAsset {
  const content = FOR_YOU_CONTENT[forYouId];

  if (content) {
    return {
      id: 1000 + forYouId,
      title: content.fullTitle,
      url: FOR_YOU_VIDEO_URLS[forYouId] || PLACEHOLDER_VIDEO_URL,
      summary: content.description,
      isMock: true
    };
  }

  return {
    id: 1000 + forYouId,
    title: 'For You Video',
    url: PLACEHOLDER_VIDEO_URL,
    summary: 'Personalized content just for you.',
    isMock: true
  };
}

/**
 * Get video for an OpenAcademy Original by its ID (1-6)
 * Pulls title and description from ORIGINALS_CONTENT for consistency
 */
export function getVideoForOriginalsId(originalsId: number): VideoAsset {
  const content = ORIGINALS_CONTENT[originalsId];

  if (content) {
    return {
      id: 2000 + originalsId,
      title: content.fullTitle,
      url: ORIGINALS_VIDEO_URLS[originalsId] || PLACEHOLDER_VIDEO_URL,
      summary: content.description,
      isMock: true
    };
  }

  return {
    id: 2000 + originalsId,
    title: 'OpenAcademy Original',
    url: PLACEHOLDER_VIDEO_URL,
    summary: 'Premium content from OpenAcademy.',
    isMock: true
  };
}

/**
 * Convert VideoAsset to the format expected by VideoPlayer
 */
export function toVideoPlayerFormat(video: VideoAsset) {
  return {
    id: video.id,
    title: video.title,
    url: video.url,
    summary: video.summary
  };
}