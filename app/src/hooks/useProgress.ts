import { useState, useCallback } from 'react';

/**
 * Continue Watching logic:
 *
 * - Tracks progress at the BUNDLE level (bundleId is the key)
 * - Stores which chapters are completed + the LAST watched chapter (id + thumbnail)
 * - Continue Watching shows:
 *     - Standalone bundles (planId = null) with progress
 *     - Lesson plans where ANY child bundle has progress
 * - Each card shows the LAST watched chapter's thumbnail
 * - Items where ALL chapters are completed do NOT appear (finished)
 * - Sorted by most recently watched
 */

export interface BundleProgress {
  bundleId: string;
  bundleTitle: string;
  planId: string | null;           // null = standalone, string = lesson plan bundle
  totalChapters: number;
  completedChapters: string[];     // chapter IDs
  lastChapterId: string;           // most recently watched chapter
  lastChapterThumbnail: string;    // thumbnail of that chapter
  lastChapterTitle: string;
  lastWatchedAt: number;
}

export interface ForYouProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  lastWatchedAt: number;
}

interface ProgressStore {
  bundles: Record<string, BundleProgress>;
  foryou: Record<string, ForYouProgress>;
  hiddenFromContinue?: string[];  // bundle/plan IDs hidden from Continue Watching
}

const STORAGE_KEY = 'oa_progress_v3';

function load(): ProgressStore {
  try {
    // Clear stale v2 data
    if (localStorage.getItem('oa_progress_v2')) localStorage.removeItem('oa_progress_v2');
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { bundles: {}, foryou: {}, hiddenFromContinue: [] };
  } catch {
    return { bundles: {}, foryou: {}, hiddenFromContinue: [] };
  }
}

function save(data: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>(load);

  // ---- Bundle/Lesson progress ----

  const trackChapterWatch = useCallback((params: {
    bundleId: string;
    bundleTitle: string;
    planId: string | null;
    totalChapters: number;
    chapterId: string;
    chapterThumbnail: string;
    chapterTitle: string;
  }) => {
    setStore(prev => {
      const existing = prev.bundles[params.bundleId];
      const completedChapters = existing?.completedChapters ?? [];
      // Un-hide this bundle if it was previously removed from Continue Watching
      const hiddenFromContinue = (prev.hiddenFromContinue || []).filter(id => id !== params.bundleId);
      const next: ProgressStore = {
        ...prev,
        hiddenFromContinue,
        bundles: {
          ...prev.bundles,
          [params.bundleId]: {
            bundleId: params.bundleId,
            bundleTitle: params.bundleTitle,
            planId: params.planId,
            totalChapters: params.totalChapters,
            completedChapters,
            lastChapterId: params.chapterId,
            lastChapterThumbnail: params.chapterThumbnail,
            lastChapterTitle: params.chapterTitle,
            lastWatchedAt: Date.now(),
          },
        },
      };
      save(next);
      return next;
    });
  }, []);

  const markChapterComplete = useCallback((bundleId: string, chapterId: string) => {
    setStore(prev => {
      const existing = prev.bundles[bundleId];
      if (!existing) return prev;
      const completedChapters = [...new Set([...existing.completedChapters, chapterId])];
      const next: ProgressStore = {
        ...prev,
        bundles: {
          ...prev.bundles,
          [bundleId]: {
            ...existing,
            completedChapters,
            lastWatchedAt: Date.now(),
          },
        },
      };
      save(next);
      return next;
    });
  }, []);

  /**
   * Rewatch reset: when a completed chapter is re-watched, remove it from
   * completedChapters. This makes progress incomplete again (e.g. 4/4 → 3/4 = 75%).
   */
  const resetChapterProgress = useCallback((bundleId: string, chapterId: string) => {
    setStore(prev => {
      const existing = prev.bundles[bundleId];
      if (!existing) return prev;
      const completedChapters = existing.completedChapters.filter(id => id !== chapterId);
      const next: ProgressStore = {
        ...prev,
        bundles: {
          ...prev.bundles,
          [bundleId]: {
            ...existing,
            completedChapters,
            lastWatchedAt: Date.now(),
          },
        },
      };
      save(next);
      return next;
    });
  }, []);

  const getBundleProgress = useCallback((bundleId: string): BundleProgress | undefined => {
    return store.bundles[bundleId];
  }, [store]);

  const getBundlePercentage = useCallback((bundleId: string): number => {
    const p = store.bundles[bundleId];
    if (!p || p.totalChapters === 0) return 0;
    return Math.round((p.completedChapters.length / p.totalChapters) * 100);
  }, [store]);

  /** Remove an item from Continue Watching without deleting progress */
  const removeFromContinueWatching = useCallback((id: string) => {
    setStore(prev => {
      const hidden = [...(prev.hiddenFromContinue || []), id];
      const next: ProgressStore = { ...prev, hiddenFromContinue: hidden };
      save(next);
      return next;
    });
  }, []);

  /**
   * Continue Watching list:
   * - Only shows items with actual mid-watch progress (not 100% complete)
   * - Standalone bundles (planId = null) with progress
   * - Lesson plans: find unique planIds from bundles with progress, aggregate
   * - Items hidden via removeFromContinueWatching are excluded
   * - Each item has the last watched chapter's thumbnail
   */
  const getContinueWatching = useCallback((): Array<{
    id: string;
    type: 'bundle' | 'lesson';
    planId: string | null;
    title: string;
    thumbnail: string;
    chapterTitle: string;
    percentage: number;
    lastWatchedAt: number;
  }> => {
    const items: Array<{
      id: string;
      type: 'bundle' | 'lesson';
      planId: string | null;
      title: string;
      thumbnail: string;
      chapterTitle: string;
      percentage: number;
      lastWatchedAt: number;
    }> = [];

    const hidden = new Set(store.hiddenFromContinue || []);
    const allBundles = Object.values(store.bundles);

    // Standalone bundles (NOT part of a lesson)
    // Show if user has started watching (lastWatchedAt > 0) and not fully complete
    allBundles
      .filter(b => b.planId === null || b.planId === undefined)
      .filter(b => b.completedChapters.length < b.totalChapters)
      .filter(b => !hidden.has(b.bundleId))
      .forEach(b => {
        items.push({
          id: b.bundleId,
          type: 'bundle',
          planId: null,
          title: b.bundleTitle,
          thumbnail: b.lastChapterThumbnail,
          chapterTitle: b.lastChapterTitle,
          percentage: b.totalChapters > 0
            ? Math.round((b.completedChapters.length / b.totalChapters) * 100)
            : 0,
          lastWatchedAt: b.lastWatchedAt,
        });
      });

    // Lesson plans: group bundles by planId
    // Show the LATEST watched bundle to represent the lesson plan
    const lessonBundles = allBundles.filter(b => b.planId !== null && b.planId !== undefined);
    const planGroups: Record<string, BundleProgress[]> = {};
    for (const b of lessonBundles) {
      const pid = b.planId!;
      if (!planGroups[pid]) planGroups[pid] = [];
      planGroups[pid].push(b);
    }

    for (const [planId, bundles] of Object.entries(planGroups)) {
      const totalChapters = bundles.reduce((sum, b) => sum + b.totalChapters, 0);
      const completedChapters = bundles.reduce((sum, b) => sum + b.completedChapters.length, 0);

      // Skip if fully complete
      if (totalChapters > 0 && completedChapters >= totalChapters) continue;

      // Find the most recently watched bundle in this plan
      const latest = [...bundles].sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)[0];

      // Skip if hidden (check both planId and latest bundleId)
      if (hidden.has(planId) || hidden.has(latest.bundleId)) continue;

      // Use the latest bundle's ID so clicking goes to the bundle, not the lesson page
      items.push({
        id: latest.bundleId,
        type: 'bundle',
        planId,
        title: latest.bundleTitle,
        thumbnail: latest.lastChapterThumbnail,
        chapterTitle: latest.lastChapterTitle,
        percentage: totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 1,
        lastWatchedAt: latest.lastWatchedAt,
      });
    }

    return items.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
  }, [store]);

  // ---- For You progress (video playback position) ----

  const updateForYouProgress = useCallback((videoId: string, currentTime: number, duration: number) => {
    setStore(prev => {
      const next: ProgressStore = {
        ...prev,
        foryou: {
          ...prev.foryou,
          [videoId]: { videoId, currentTime, duration, lastWatchedAt: Date.now() },
        },
      };
      save(next);
      return next;
    });
  }, []);

  // ---- Legacy compat (used by pages that pass string IDs) ----

  const getPercentage = useCallback((contentId: string): number => {
    return getBundlePercentage(contentId);
  }, [getBundlePercentage]);

  const getProgress = useCallback((contentId: string) => {
    return getBundleProgress(contentId);
  }, [getBundleProgress]);

  return {
    trackChapterWatch,
    markChapterComplete,
    resetChapterProgress,
    removeFromContinueWatching,
    getBundleProgress,
    getBundlePercentage,
    getContinueWatching,
    updateForYouProgress,
    // Legacy compat
    getPercentage,
    getProgress,
    // Raw access
    store,
  };
}
