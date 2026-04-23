/**
 * OpenAcademy API service — wraps the existing Laravel v3 endpoints.
 *
 * The API uses a two-step pattern:
 * 1. POST /v3/listings/learn → returns { forYou: [{id, type}], recommended: [...], ... }
 * 2. POST /v3/daily-videos/retrieve → { items: [full objects] }
 *
 * This service combines both steps into single calls.
 */

import { apiPost } from './api';

// ---- Types matching the existing API responses ----

export interface OAVideo {
  image: string;
  source: string;
  sourceType: string;
  subtitle: string | null;
  width: number;
  height: number;
  durationMinutes: number;
}

export interface OADailyVideo {
  id: number;
  title: string;
  updatedAt: number;
  video: OAVideo;
  banner: { id: number; type: string } | null;
  tags: { id: number; type: string }[];
}

export interface OASeries {
  id: number;
  title: string;
  description: string;
  image: string;
  updatedAt: number;
  bundle: { id: number; type: string } | null;
  creator: { id: number; type: string } | null;
  chapters: { id: number; type: string }[];
  tags: { id: number; type: string }[];
  resources: { id: number; type: string }[];
  info: string[][];
  introVideo: OAVideo | null;
}

export interface OAPlan {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  isLesson: boolean;
  updatedAt: number;
  creditsRequired: number;
  info: string[][];
  learnings: string[];
  bundles: { id: number; type: string }[];
  badges: { id: number; type: string }[];
  tags: { id: number; type: string }[];
}

export interface OABundle {
  id: number;
  title: string;
  description: string;
  seqNo: number;
  creditsRequired: number;
  durationMinutes: number;
  isNew: boolean;
  updatedAt: number;
  plan: { id: number; type: string } | null;
  series: { id: number; type: string }[];
}

export interface OACreator {
  id: number;
  name: string;
  avatar: string;
  homepage: string;
  jobTitle: string;
  bio: string;
  offerings: string[];
  updatedAt: number;
}

export interface OAChapter {
  id: number;
  seriesId: number;
  title: string;
  description: string;
  duration: string;
  seqNo: number;
  isPremium: boolean;
  contents: { id: number; type: string }[];
  assessments: { id: number; type: string }[];
  updatedAt: number;
}

export interface OAContent {
  id: number;
  seqNo: number;
  chapterId: number;
  seriesId: number;
  type: string;
  title: string;
  ready: boolean;
  video: OAVideo | null;
  image: string;
  updatedAt: number;
}

export interface OAAssessmentOption {
  id: number;
  answer: string;
  answered: boolean;
  totalAnswered: number;
  isCorrect: boolean;
}

export interface OAAssessmentContent {
  id: number;
  seqNo: number;
  chapterId: number;
  seriesId: number;
  type: 'assessment';
  title: string;
  ready: boolean;
  assessments: OAAssessmentOption[];
  updatedAt: number;
}

export interface OAResource {
  id: number;
  name: string;
  updatedAt: number;
}

export interface OAReview {
  id: number;
  content: string;
  avatar: string;
  name: string;
  rating: number;
  updatedAt: number;
}

export interface OAListingRef {
  id: number;
  updatedAt: number;
  type: string;
}

// ---- API functions ----

/** Get homepage learn listings (IDs) */
export async function getLearnListings(size = 10) {
  return apiPost<{
    forYou: OAListingRef[];
    recommended: OAListingRef[];
    trending: OAListingRef[];
    featured: OAListingRef[];
    newFromCreators: OAListingRef[];
    plans: OAListingRef[];
  }>('/v3/listings/learn', { size });
}

/** Get full daily video objects by IDs */
export async function getDailyVideos(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OADailyVideo[] }>('/v3/daily-videos/retrieve', { items: ids });
  return res.items || [];
}

/** Get full series objects by IDs */
export async function getSeries(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OASeries[] }>('/v3/series/retrieve', { items: ids });
  return res.items || [];
}

/** Get full plan objects by IDs */
export async function getPlans(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OAPlan[] }>('/v3/plans/retrieve', { items: ids });
  return res.items || [];
}

/** Get full bundle objects by IDs */
export async function getBundles(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OABundle[] }>('/v3/bundles/retrieve', { items: ids });
  return res.items || [];
}

/** Get full chapter objects by IDs */
export async function getChapters(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OAChapter[] }>('/v3/chapters/retrieve', { items: ids });
  return res.items || [];
}

/** Get full content objects by IDs */
export async function getContents(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OAContent[] }>('/v3/contents/retrieve', { items: ids });
  return res.items || [];
}

/** Get full resource objects by IDs */
export async function getResources(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OAResource[] }>('/v3/resources/retrieve', { items: ids });
  return res.items || [];
}

/** Get review objects by IDs */
export async function getReviews(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OAReview[] }>('/v3/reviews/retrieve', { items: ids });
  return res.items || [];
}

/** Get full creator objects by IDs */
export async function getCreators(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OACreator[] }>('/v3/creators/retrieve', { items: ids });
  return res.items || [];
}

/** Get lessons (lesson plans) listing */
export async function getLessonsListing(size = 10) {
  return apiPost<{
    lessons: OAListingRef[];
    suggested: OAListingRef[];
  }>('/v3/listings/lessons', { size });
}

/** Get discover page content */
export async function getDiscoverListing(size = 10) {
  return apiPost<{
    lessons: OAListingRef[];
    creators: OAListingRef[];
    magazines: OAListingRef[];
  }>('/v3/listings/discover', { size });
}

/** Convenience: get homepage with full data resolved */
export async function getHomepageData() {
  // Step 1: Fetch both listings in parallel
  const [listings, lessonListing] = await Promise.all([
    getLearnListings(10),
    getLessonsListing(10).catch(() => ({ lessons: [] as OAListingRef[], suggested: [] as OAListingRef[] })),
  ]);

  // Step 2: Resolve ForYou, plans, and series ALL in parallel
  const forYouIds = (listings.forYou || []).map(r => r.id);
  const planIds = (lessonListing.lessons || []).map(r => r.id);
  const seriesIds = [...new Set([
    ...(listings.recommended || []).filter(r => r.type === 'series').map(r => r.id),
    ...(listings.trending || []).filter(r => r.type === 'series').map(r => r.id),
  ])];

  const [forYouVideos, plans, series] = await Promise.all([
    forYouIds.length > 0 ? getDailyVideos(forYouIds).catch(() => [] as OADailyVideo[]) : Promise.resolve([] as OADailyVideo[]),
    planIds.length > 0 ? getPlans(planIds).catch(() => [] as OAPlan[]) : Promise.resolve([] as OAPlan[]),
    seriesIds.length > 0 ? getSeries(seriesIds).catch(() => [] as OASeries[]) : Promise.resolve([] as OASeries[]),
  ]);

  return {
    forYou: forYouVideos,
    plans,
    series,
  };
}

/** Resolve discover bundles separately */
export async function resolveDiscoverBundles(series: OASeries[]) {
  const bundleIds = [...new Set(series.filter(s => s.bundle).map(s => s.bundle!.id))];
  if (bundleIds.length === 0) return [];

  const bundles = await getBundles(bundleIds);
  const allSeriesIds = [...new Set(bundles.flatMap(b => (b.series || []).map(s => s.id)))];
  const allSeries = allSeriesIds.length > 0 ? await getSeries(allSeriesIds) : [];

  const result: { bundleId: number; bundleTitle: string; bundleDescription: string; creditsRequired: number; durationMinutes: number; chapterCount: number; allSeries: OASeries[] }[] = [];
  for (const b of bundles) {
    const bSeriesIds = (b.series || []).map(s => s.id);
    const bSeries = bSeriesIds
      .map(id => allSeries.find(s => s.id === id))
      .filter(Boolean) as OASeries[];
    result.push({
      bundleId: b.id,
      bundleTitle: b.title,
      bundleDescription: b.description,
      creditsRequired: b.creditsRequired,
      durationMinutes: b.durationMinutes,
      chapterCount: bSeries.length,
      allSeries: bSeries,
    });
  }
  return result;
}
