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

/** Get full creator objects by IDs */
export async function getCreators(ids: number[]) {
  if (ids.length === 0) return [];
  const res = await apiPost<{ items: OACreator[] }>('/v3/creators/retrieve', { items: ids });
  return res.items || [];
}

/** Get lessons (lesson plans) listing */
export async function getLessonsListing(size = 10) {
  return apiPost<{
    items: OAListingRef[];
    total: number;
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
  const listings = await getLearnListings(10);

  // Resolve ForYou videos
  const forYouIds = listings.forYou.map(r => r.id);
  const forYouVideos = await getDailyVideos(forYouIds);

  // Resolve lesson plan IDs
  const lessonListing = await getLessonsListing(10);
  const planIds = lessonListing.items.map(r => r.id);
  const plans = planIds.length > 0 ? await getPlans(planIds) : [];

  // Resolve trending/recommended series
  const seriesIds = [
    ...listings.recommended.filter(r => r.type === 'series').map(r => r.id),
    ...listings.trending.filter(r => r.type === 'series').map(r => r.id),
  ];
  const uniqueSeriesIds = [...new Set(seriesIds)];
  const series = uniqueSeriesIds.length > 0 ? await getSeries(uniqueSeriesIds) : [];

  return {
    forYou: forYouVideos,
    plans,
    series,
    listings,
  };
}
