/** API response types — matches Python backend JSON shapes */

export interface ApiCreator {
  id: number;
  name: string;
  avatar: string;
  job_title?: string;
  bio?: string;
}

export interface ApiForYouVideo {
  id: number;
  title: string;
  full_title: string;
  category: string;
  description: string;
  video_url: string;
  thumbnail: string;
  series_count: number;
  total_minutes: number;
  creator: ApiCreator | null;
}

export interface ApiBundleSummary {
  id: number;
  plan_id: number | null;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  credits_required: number;
  duration_minutes: number;
  is_free: boolean;
  thumbnail: string;
  chapter_count?: number;
  creator: ApiCreator | null;
}

export interface ApiChapter {
  id: number;
  title: string;
  description: string;
  duration: string;
  seq_no: number;
  is_premium: boolean;
  thumbnail: string;
  parts: ApiContentPart[];
}

export interface ApiContentPart {
  type: 'video' | 'survey' | 'image';
  url: string;
  caption: string;
  question: string;
  options_json: string;
}

export interface ApiSeries {
  id: number;
  title: string;
  description: string;
  image: string;
  chapters: ApiChapter[];
  resources: { id: number; title: string; url: string }[];
}

export interface ApiBundleDetail extends ApiBundleSummary {
  series: ApiSeries[];
}

export interface ApiPlanSummary {
  id: number;
  title: string;
  description: string;
  image: string;
  background: string;
  category: string;
  credits_required: number;
  rating: number;
  review_count: number;
  bundle_count: number;
  certificate_on_completion: boolean;
}

export interface ApiPlanDetail extends ApiPlanSummary {
  learning_points: string[];
  target_audience: string[];
  bundles: ApiBundleSummary[];
  reviews: { id: number; name: string; avatar: string; content: string; rating: number }[];
  badges: { id: number; title: string; description: string; image: string }[];
}

export interface ApiBanner {
  id: number;
  title: string;
  image: string;
  color: string;
}

export interface ApiHomeListings {
  for_you: ApiForYouVideo[];
  originals: ApiBundleSummary[];
  lessons: ApiPlanSummary[];
  banners: ApiBanner[];
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
