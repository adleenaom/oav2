import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import LessonCard from '../components/LessonCard';
import BundleThumbnail from '../components/BundleThumbnail';
import { useHomepage } from '../hooks/useHomepage';
import { apiPost } from '../services/api';
import { getSeries } from '../services/oa-api';

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { plans, discoverBundles } = useHomepage();

  // Search — uses /v3/listings/learn-search or /v3/bundles/search
  const [searchResults, setSearchResults] = useState<{ plans: any[]; bundles: any[]; creators: any[] } | null>(null);
  const isSearching = query.length >= 2;

  useEffect(() => {
    if (!isSearching) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await apiPost<{ items: any[] }>('/v3/listings/learn-search', { query, size: 20 });
        // Resolve the IDs to get full data
        const seriesIds = (res.items || []).filter((r: any) => r.type === 'series').map((r: any) => r.id);
        const resolvedSeries = seriesIds.length > 0 ? await getSeries(seriesIds) : [];
        setSearchResults({
          plans: [],
          bundles: resolvedSeries.map(s => ({ id: s.id, title: s.title, thumbnail: s.image, category: '', is_free: false, credits_required: 0 })),
          creators: [],
        });
      } catch {
        setSearchResults({ plans: [], bundles: [], creators: [] });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, isSearching]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[103px] md:pb-0">

        {/* Mobile search */}
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

        {/* Desktop header */}
        <div className="hidden md:block bg-bg-secondary">
          <div className="container-content section-hero">
            <h1 className="text-[36px] lg:text-[40px] font-bold text-text-primary leading-tight font-sans">Discover</h1>
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
          /* Search results */
          <div className="bg-bg-base section-tight">
            <div className="container-content">
              {!searchResults ? (
                <p className="type-body-default text-text-tertiary text-center py-8">Searching...</p>
              ) : searchResults.bundles.length === 0 ? (
                <p className="type-body-default text-text-tertiary text-center py-8">No results for "{query}"</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                  {searchResults.bundles.map((b: any) => (
                    <BundleThumbnail
                      key={b.id}
                      thumbnail={b.thumbnail}
                      alt={b.title}
                      size="big"
                      onClick={() => navigate(`/bundle/${b.id}`)}
                      className="w-full h-auto aspect-[3/4]"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Lessons */}
            {plans.length > 0 && (
              <div className="bg-bg-base section-tight">
                <div className="container-content">
                  <SectionHeader title="Lessons" onSeeAll={() => navigate('/viewall/lessons')} />
                  <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                    {plans.map(plan => (
                      <LessonCard
                        key={plan.id}
                        lesson={{
                          id: plan.id, type: 'lesson', title: plan.title, fullTitle: plan.title,
                          category: '', description: plan.description, keywords: [],
                          seriesCount: plan.bundles.length, totalMinutes: 0, rating: 0,
                          reviews: 0, lessonPlanCoins: plan.creditsRequired,
                          thumbnail: plan.image, background: plan.image,
                          bundles: plan.bundles as any[], targetAudience: [], learningPoints: plan.learnings || [],
                          certificateOnCompletion: true,
                        }}
                        onClick={() => navigate(`/lesson/${plan.id}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bundle sections — bundle title + ALL chapter (series) thumbnails in a row */}
            {discoverBundles.map(db => (
              <div key={db.bundleId} className="bg-bg-base section-tight">
                <div className="container-content">
                  <button
                    onClick={() => navigate(`/bundle/${db.bundleId}`)}
                    className="type-headline-medium text-text-primary text-left hover:underline"
                  >
                    {db.bundleTitle}
                  </button>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
                    {db.allSeries.map(s => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/bundle/${db.bundleId}`)}
                        className="card-interactive relative w-[120px] h-[160px] md:w-[150px] md:h-[200px] rounded-[8px] overflow-hidden shrink-0"
                      >
                        <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="hidden md:block h-20" />
      </div>
    </div>
  );
}
