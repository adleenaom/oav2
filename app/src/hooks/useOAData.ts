import { useState, useEffect } from 'react';
import { getPlans, getSeries, getBundles, getCreators, getChapters, getContents, getResources, getReviews, type OAPlan, type OASeries, type OABundle, type OACreator, type OAContent, type OAResource, type OAReview, type OAAssessmentContent } from '../services/oa-api';

/** Fetch a single plan by ID */
export function usePlan(id: number | null) {
  const [data, setData] = useState<OAPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    getPlans([id])
      .then(items => { setData(items[0] || null); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading };
}

/** Fetch a single series by ID (used for bundle detail) */
export function useSeries(id: number | null) {
  const [data, setData] = useState<OASeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    getSeries([id])
      .then(items => { setData(items[0] || null); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading };
}

/** Fetch a single bundle by ID */
export function useBundle(id: number | null) {
  const [data, setData] = useState<OABundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    getBundles([id])
      .then(items => { setData(items[0] || null); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading };
}

/** Fetch a single creator by ID */
export function useCreator(id: number | null) {
  const [data, setData] = useState<OACreator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    getCreators([id])
      .then(items => { setData(items[0] || null); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading };
}

/** A fully resolved chapter with video URL and assessments */
export interface ResolvedChapter {
  id: number;
  seriesId: number;
  seriesTitle: string;
  seriesImage: string;
  title: string;
  description: string;
  duration: string;
  seqNo: number;
  isPremium: boolean;
  videoUrl: string;
  videoImage: string;
  durationMinutes: number;
  hasAssessment: boolean;
  assessments: OAAssessmentContent[];
}

/** Fetch series detail + resolve chapters + content/videos for a bundle detail page */
export function useBundleDetail(bundleId: number | null) {
  const [bundle, setBundle] = useState<OABundle | null>(null);
  const [seriesList, setSeriesList] = useState<OASeries[]>([]);
  const [resolvedChapters, setResolvedChapters] = useState<ResolvedChapter[]>([]);
  const [resources, setResources] = useState<OAResource[]>([]);
  const [reviews, setReviews] = useState<OAReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bundleId) { setIsLoading(false); return; }
    setIsLoading(true);

    getBundles([bundleId])
      .then(async (bundles) => {
        const b = bundles[0];
        if (!b) { setIsLoading(false); return; }
        setBundle(b);

        // Resolve series
        const seriesIds = (b.series || []).map(s => s.id);
        const resolved = seriesIds.length > 0 ? await getSeries(seriesIds) : [];
        setSeriesList(resolved);

        // Resolve all chapters from all series
        const allChapterIds = resolved.flatMap(s => (s.chapters || []).map(ch => ch.id));
        const chapters = allChapterIds.length > 0 ? await getChapters(allChapterIds) : [];

        // Resolve all contents from all chapters
        const allContentIds = chapters.flatMap(ch => (ch.contents || []).map(c => c.id));
        const contents = allContentIds.length > 0 ? await getContents(allContentIds) : [];

        // Build content map: chapterId -> first video content
        const contentByChapter = new Map<number, OAContent>();
        for (const c of contents) {
          if (c.type === 'video' && !contentByChapter.has(c.chapterId)) {
            contentByChapter.set(c.chapterId, c);
          }
        }

        // Resolve assessment content for chapters that have them
        const allAssessmentContentIds = chapters.flatMap(ch => (ch.assessments || []).map(a => a.id));
        let assessmentContents: OAAssessmentContent[] = [];
        if (allAssessmentContentIds.length > 0) {
          try {
            const res = await getContents(allAssessmentContentIds);
            assessmentContents = res.filter(c => c.type === 'assessment') as unknown as OAAssessmentContent[];
          } catch {}
        }

        // Build map: chapterId → assessment contents
        const assessmentsByChapter = new Map<number, OAAssessmentContent[]>();
        for (const a of assessmentContents) {
          const existing = assessmentsByChapter.get(a.chapterId) || [];
          existing.push(a);
          assessmentsByChapter.set(a.chapterId, existing);
        }

        // Build resolved chapters in series order
        const rChapters: ResolvedChapter[] = [];
        for (const s of resolved) {
          const sChapterIds = (s.chapters || []).map(ch => ch.id);
          const sChapters = chapters
            .filter(ch => sChapterIds.includes(ch.id))
            .sort((a, b) => a.seqNo - b.seqNo);

          for (const ch of sChapters) {
            const content = contentByChapter.get(ch.id);
            const chAssessments = assessmentsByChapter.get(ch.id) || [];
            rChapters.push({
              id: ch.id,
              seriesId: s.id,
              seriesTitle: s.title,
              seriesImage: s.image,
              title: ch.title,
              description: ch.description || '',
              duration: ch.duration,
              seqNo: ch.seqNo,
              isPremium: ch.isPremium,
              videoUrl: (content?.video?.source || '').replace('https://app.theopenacademy.org', ''),
              videoImage: content?.video?.image || content?.image || s.image,
              durationMinutes: content?.video?.durationMinutes || 0,
              hasAssessment: chAssessments.length > 0,
              assessments: chAssessments.sort((a, b) => a.seqNo - b.seqNo),
            });
          }
        }

        // Exclude test-only chapters (no video, only assessment)
        const videoChapters = rChapters.filter(ch => ch.videoUrl || !ch.hasAssessment);
        setResolvedChapters(videoChapters);

        // Resolve resources from series
        const allResourceIds = resolved.flatMap(s => (s.resources || []).map(r => r.id));
        if (allResourceIds.length > 0) {
          try {
            const resolvedResources = await getResources(allResourceIds);
            setResources(resolvedResources);
          } catch {}
        }

        // Fetch reviews (global pool — fetch first 10)
        try {
          const resolvedReviews = await getReviews([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          setReviews(resolvedReviews);
        } catch {}

        setIsLoading(false);
      })
      .catch((e) => { console.warn('useBundleDetail error:', e); setIsLoading(false); });
  }, [bundleId]);

  return { bundle, seriesList, resolvedChapters, resources, reviews, isLoading };
}

/** Fetch plan detail + resolve bundles for lesson detail page */
export function usePlanDetail(planId: number | null) {
  const [plan, setPlan] = useState<OAPlan | null>(null);
  const [planBundles, setPlanBundles] = useState<OABundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!planId) { setIsLoading(false); return; }
    setIsLoading(true);

    getPlans([planId])
      .then(async (plans) => {
        const p = plans[0];
        if (!p) { setIsLoading(false); return; }
        setPlan(p);

        // Resolve bundles
        const bundleIds = (p.bundles || []).map(b => b.id);
        if (bundleIds.length > 0) {
          const resolved = await getBundles(bundleIds);
          setPlanBundles(resolved);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [planId]);

  return { plan, planBundles, isLoading };
}
