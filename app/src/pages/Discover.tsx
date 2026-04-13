import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import SectionHeader from '../components/SectionHeader';
import LessonCard from '../components/LessonCard';
import BundleThumbnail from '../components/BundleThumbnail';
import type { ApiHomeListings, ApiBundleDetail } from '../services/types';

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data } = useApi<ApiHomeListings>('/listings/home');
  const { data: searchResults } = useApi<{
    plans: { id: number; title: string; description: string; image: string; category: string; rating: number }[];
    bundles: { id: number; title: string; thumbnail: string; category: string; is_free: boolean; credits_required: number }[];
    creators: { id: number; name: string; avatar: string; job_title: string }[];
  }>(query.length >= 2 ? `/search?q=${encodeURIComponent(query)}` : null);

  const lessons = data?.lessons ?? [];
  const standaloneBundles = data?.originals ?? [];
  const isSearching = query.length >= 2;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[103px] md:pb-0">

        {/* Mobile search — same pattern as SearchHeader on homepage */}
        <div className="md:hidden bg-bg-secondary px-6 pt-14 pb-6">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border-default bg-bg-base type-body-default text-text-primary placeholder:text-text-tertiary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20 transition-colors text-[14px]"
            />
          </div>
        </div>

        {/* Desktop hero — same pattern as homepage section-hero */}
        <div className="hidden md:block bg-bg-secondary">
          <div className="container-content section-hero">
            <h1 className="text-[36px] lg:text-[40px] font-bold text-text-primary leading-tight font-sans">
              Discover
            </h1>
            <div className="relative max-w-[480px] mt-3">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search lessons, bundles, creators..."
                className="w-full pl-11 pr-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary placeholder:text-text-tertiary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {isSearching ? (
          <SearchResults results={searchResults} query={query} navigate={navigate} />
        ) : (
          <>
            {/* Lessons — same pattern as homepage For You / Explore Lessons */}
            {lessons.length > 0 && (
              <div className="bg-bg-base section-tight">
                <div className="container-content">
                  <SectionHeader title="Lessons" onSeeAll={() => navigate('/viewall/lessons')} />
                  <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                    {lessons.map(plan => (
                      <LessonCard
                        key={plan.id}
                        lesson={{
                          id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                          category: plan.category, description: plan.description, keywords: [],
                          seriesCount: 0, totalMinutes: 0, rating: plan.rating,
                          reviews: plan.review_count, lessonPlanCoins: plan.credits_required,
                          thumbnail: plan.image, background: plan.background || plan.image,
                          bundles: [], targetAudience: [], learningPoints: [],
                          certificateOnCompletion: plan.certificate_on_completion,
                        }}
                        onClick={() => navigate(`/lesson/${plan.id}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standalone bundles — each as its own section-tight */}
            {standaloneBundles.map(bundle => (
              <BundleDiscoverSection
                key={bundle.id}
                bundleId={bundle.id}
                title={bundle.title}
                price={bundle.is_free ? null : bundle.credits_required}
                navigate={navigate}
              />
            ))}
          </>
        )}

        {/* Footer spacer */}
        <div className="hidden md:block h-20" />
      </div>
    </div>
  );
}

/* ---- Bundle section with chapter thumbnails ---- */

function BundleDiscoverSection({
  bundleId,
  title,
  price,
  navigate,
}: {
  bundleId: number;
  title: string;
  price: number | null;
  navigate: (path: string) => void;
}) {
  const { data: bundle } = useApi<ApiBundleDetail>(`/bundles/${bundleId}`);
  const chapters = bundle?.series?.flatMap(s => s.chapters) ?? [];

  if (chapters.length === 0) return null;

  return (
    <div className="bg-bg-base section-tight">
      <div className="container-content">
        {/* Title row — bundle name + price badge */}
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => navigate(`/bundle/${bundleId}`)}
            className="type-headline-medium text-text-primary text-left hover:underline"
          >
            {title}
          </button>
          {price !== null && (
            <div className="bg-action-primary rounded-full px-3 py-1 flex items-center gap-1 shrink-0">
              <div className="w-3 h-3 rounded-full bg-accent-yellow" />
              <span className="type-tags text-text-on-dark normal-case">{price}</span>
            </div>
          )}
        </div>

        {/* Chapter thumbnails — horizontal scroll, same scroll pattern as homepage */}
        <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
          {chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => navigate(`/bundle/${bundleId}`)}
              className="card-interactive relative w-[120px] h-[160px] md:w-[150px] md:h-[200px] rounded-[8px] overflow-hidden shrink-0"
            >
              <img
                src={chapter.thumbnail}
                alt={chapter.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-8">
                <p className="type-tags text-text-on-dark leading-tight line-clamp-2 normal-case text-[9px]">
                  {chapter.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Search results ---- */

function SearchResults({
  results,
  query,
  navigate,
}: {
  results: {
    plans: { id: number; title: string; description: string; image: string; category: string; rating: number }[];
    bundles: { id: number; title: string; thumbnail: string; category: string; is_free: boolean; credits_required: number }[];
    creators: { id: number; name: string; avatar: string; job_title: string }[];
  } | undefined;
  query: string;
  navigate: (path: string) => void;
}) {
  if (!results) return <div className="bg-bg-base section-tight"><div className="container-content"><p className="type-body-default text-text-tertiary text-center py-8">Searching...</p></div></div>;

  const hasResults = results.plans.length > 0 || results.bundles.length > 0 || results.creators.length > 0;

  if (!hasResults) {
    return (
      <div className="bg-bg-base section-tight">
        <div className="container-content">
          <p className="type-body-default text-text-tertiary text-center py-8">No results for "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {results.plans.length > 0 && (
        <div className="bg-bg-base section-tight">
          <div className="container-content">
            <h2 className="type-headline-medium text-text-primary mb-4">Lesson Plans</h2>
            <div className="flex flex-col gap-3">
              {results.plans.map(plan => (
                <button key={plan.id} onClick={() => navigate(`/lesson/${plan.id}`)} className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left">
                  <img src={plan.image} alt="" className="w-16 h-16 rounded-[8px] object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="type-tags text-text-category">{plan.category}</span>
                    <p className="type-headline-small text-text-primary mt-0.5 truncate">{plan.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {results.bundles.length > 0 && (
        <div className="bg-bg-base section-tight">
          <div className="container-content">
            <h2 className="type-headline-medium text-text-primary mb-4">Bundles</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
              {results.bundles.map(bundle => (
                <BundleThumbnail
                  key={bundle.id}
                  thumbnail={bundle.thumbnail}
                  alt={bundle.title}
                  size="big"
                  price={bundle.is_free ? 'free' : bundle.credits_required}
                  onClick={() => navigate(`/bundle/${bundle.id}`)}
                  className="w-full h-auto aspect-[3/4]"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {results.creators.length > 0 && (
        <div className="bg-bg-base section-tight">
          <div className="container-content">
            <h2 className="type-headline-medium text-text-primary mb-4">Creators</h2>
            <div className="flex flex-col gap-3">
              {results.creators.map(creator => (
                <button key={creator.id} onClick={() => navigate(`/creator/${creator.id}`)} className="flex items-center gap-4 p-6 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left">
                  <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="type-headline-small text-text-primary">{creator.name}</p>
                    <p className="type-description text-text-tertiary">{creator.job_title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
