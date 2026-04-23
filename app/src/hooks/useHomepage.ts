import { useState, useEffect } from 'react';
import { getHomepageData, resolveDiscoverBundles, type OADailyVideo, type OAPlan, type OASeries } from '../services/oa-api';

export interface DiscoverBundle {
  bundleId: number;
  bundleTitle: string;
  bundleDescription: string;
  creditsRequired: number;
  durationMinutes: number;
  chapterCount: number;
  allSeries: OASeries[];
}

interface HomepageData {
  forYou: OADailyVideo[];
  plans: OAPlan[];
  series: OASeries[];
  discoverBundles: DiscoverBundle[];
  isLoading: boolean;
  error: string | null;
}

export function useHomepage(): HomepageData {
  const [data, setData] = useState<HomepageData>({
    forYou: [],
    plans: [],
    series: [],
    discoverBundles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // Phase 1: Load fast data (forYou + plans + series) — ~2 API calls
    getHomepageData()
      .then(result => {
        if (cancelled) return;

        // Render immediately with fast data
        setData(prev => ({
          ...prev,
          forYou: result.forYou,
          plans: result.plans,
          series: result.series,
          isLoading: false,
          error: null,
        }));

        // Phase 2: Load discover bundles in background (slower — resolves all series + chapters)
        resolveDiscoverBundles(result.series)
          .then(discoverBundles => {
            if (!cancelled) {
              setData(prev => ({ ...prev, discoverBundles }));
            }
          })
          .catch(() => {}); // Non-critical, fail silently
      })
      .catch(err => {
        if (!cancelled) {
          setData(prev => ({ ...prev, isLoading: false, error: err.message }));
        }
      });

    return () => { cancelled = true; };
  }, []);

  return data;
}
