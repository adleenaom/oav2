import { useState, useEffect } from 'react';
import { getHomepageData, type OADailyVideo, type OAPlan, type OASeries } from '../services/oa-api';

export interface DiscoverBundle {
  bundleId: number;
  bundleTitle: string;
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

    getHomepageData()
      .then(result => {
        if (!cancelled) {
          setData({
            forYou: result.forYou,
            plans: result.plans,
            series: result.series,
            discoverBundles: result.discoverBundles,
            isLoading: false,
            error: null,
          });
        }
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
