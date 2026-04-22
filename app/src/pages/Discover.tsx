import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import LessonCard from '../components/LessonCard';
import BundleThumbnail from '../components/BundleThumbnail';
import PurchaseModal from '../components/PurchaseModal';
import { useHomepage, type DiscoverBundle } from '../hooks/useHomepage';
import { useCredits } from '../hooks/useCredits';
import { apiPost } from '../services/api';
import { getSeries, getBundles, getCreators, type OABundle, type OACreator, type OASeries, type OAPlan } from '../services/oa-api';
import type { ApiBundleSummary } from '../services/types';
import { bundleUrl, lessonUrl, creatorUrl } from '../utils/slug';

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { plans, discoverBundles } = useHomepage();
  const { isBundleAccessible } = useCredits();
  const lessonsScrollRef = useRef<HTMLDivElement>(null);
  const bundleScrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [modalBundle, setModalBundle] = useState<ApiBundleSummary | null>(null);

  /** Handle clicking a bundle section — modal if locked, navigate if accessible */
  const handleBundleClick = (db: DiscoverBundle) => {
    const isFree = db.creditsRequired === 0;
    if (isBundleAccessible(db.bundleId, isFree)) {
      navigate(bundleUrl(db.bundleId, db.bundleTitle));
    } else {
      setModalBundle({
        id: db.bundleId,
        plan_id: null,
        title: db.bundleTitle,
        subtitle: '',
        description: db.bundleDescription,
        category: '',
        credits_required: db.creditsRequired,
        duration_minutes: db.durationMinutes,
        is_free: isFree,
        thumbnail: db.allSeries[0]?.image || '',
        chapter_count: db.chapterCount,
        creator: null,
      });
    }
  };

  // Search — parallel search across bundles, creators, and learn-search (series)
  const [searchResults, setSearchResults] = useState<{
    plans: OAPlan[];
    bundles: OABundle[];
    series: OASeries[];
    creators: OACreator[];
  } | null>(null);
  const isSearching = query.length >= 2;

  useEffect(() => {
    if (!isSearching) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try {
        // Search all types in parallel
        const [bundleRes, creatorRes, learnRes] = await Promise.all([
          apiPost<{ items: { id: number }[] }>('/v3/bundles/search', { query, size: 10, index: 0 }).catch(() => ({ items: [] })),
          apiPost<{ items: { id: number }[] }>('/v3/creators/search', { query, size: 6, index: 0 }).catch(() => ({ items: [] })),
          apiPost<{ items: { id: number; type: string }[] }>('/v3/listings/learn-search', { query, size: 20, index: 0 }).catch(() => ({ items: [] })),
        ]);

        // Extract IDs by type from learn-search
        const seriesIds = (learnRes.items || []).filter(r => r.type === 'series').map(r => r.id);
        const bundleIds = (bundleRes.items || []).map(r => r.id);
        const creatorIds = (creatorRes.items || []).map(r => r.id);

        // Also match plans locally by title (no plans/search endpoint)
        const queryLower = query.toLowerCase();
        const matchedPlans = plans.filter(p => p.title.toLowerCase().includes(queryLower));

        // Resolve full objects in parallel
        const [resolvedBundles, resolvedSeries, resolvedCreators] = await Promise.all([
          bundleIds.length > 0 ? getBundles(bundleIds) : Promise.resolve([]),
          seriesIds.length > 0 ? getSeries(seriesIds) : Promise.resolve([]),
          creatorIds.length > 0 ? getCreators(creatorIds) : Promise.resolve([]),
        ]);

        setSearchResults({
          plans: matchedPlans,
          bundles: resolvedBundles,
          series: resolvedSeries,
          creators: resolvedCreators,
        });
      } catch {
        setSearchResults({ plans: [], bundles: [], series: [], creators: [] });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, isSearching, plans]);

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
            <h1 className="text-[28px] lg:text-[32px] font-bold text-text-primary leading-tight font-sans">Discover</h1>
            <div className="relative max-w-[480px] mt-2">
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
          /* Search results — grouped by type */
          <div className="bg-bg-base">
            <div className="container-content">
              {!searchResults ? (
                <p className="type-body-default text-text-tertiary text-center py-12">Searching...</p>
              ) : (searchResults.plans.length + searchResults.bundles.length + searchResults.series.length + searchResults.creators.length) === 0 ? (
                <p className="type-body-default text-text-tertiary text-center py-12">No results for "{query}"</p>
              ) : (
                <div className="flex flex-col gap-8 py-6">
                  {/* Lesson Plans */}
                  {searchResults.plans.length > 0 && (
                    <div>
                      <h3 className="type-headline-medium text-text-primary mb-4">Lesson Plans</h3>
                      <div className="flex flex-col gap-3">
                        {searchResults.plans.map(plan => (
                          <button
                            key={plan.id}
                            onClick={() => navigate(lessonUrl(plan.id, plan.title))}
                            className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                          >
                            <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-bg-base shrink-0">
                              <img src={plan.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="type-headline-small text-text-primary truncate">{plan.title}</p>
                              <p className="type-pre-text text-text-tertiary mt-0.5">{plan.bundles.length} bundles · {plan.duration}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bundles */}
                  {searchResults.bundles.length > 0 && (
                    <div>
                      <h3 className="type-headline-medium text-text-primary mb-4">Bundles</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {searchResults.bundles.map(b => (
                          <button
                            key={b.id}
                            onClick={() => navigate(bundleUrl(b.id, b.title))}
                            className="flex items-center gap-3 p-3 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-bg-base shrink-0">
                              {b.series?.[0] && (
                                <div className="w-full h-full bg-action-primary/10 flex items-center justify-center">
                                  <span className="type-pre-text text-action-primary font-bold">{(b.series || []).length}ch</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="type-description font-semibold text-text-primary truncate">{b.title}</p>
                              <p className="type-pre-text text-text-tertiary">{b.durationMinutes} mins</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Series (Chapters) */}
                  {searchResults.series.length > 0 && (
                    <div>
                      <h3 className="type-headline-medium text-text-primary mb-4">Chapters</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                        {searchResults.series.filter(s => s.bundle).map(s => (
                          <BundleThumbnail
                            key={s.id}
                            thumbnail={s.image}
                            alt={s.title}
                            size="big"
                            onClick={() => navigate(bundleUrl(s.bundle!.id))}
                            className="w-full h-auto aspect-[3/4]"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creators */}
                  {searchResults.creators.length > 0 && (
                    <div>
                      <h3 className="type-headline-medium text-text-primary mb-4">Creators</h3>
                      <div className="flex flex-col gap-3">
                        {searchResults.creators.map(c => (
                          <button
                            key={c.id}
                            onClick={() => navigate(creatorUrl(c.id, c.name))}
                            className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                          >
                            <img src={c.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="type-headline-small text-text-primary truncate">{c.name}</p>
                              <p className="type-pre-text text-text-tertiary">{c.jobTitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <SectionHeader title="Lessons" onSeeAll={() => navigate('/viewall/lessons')} scrollRef={lessonsScrollRef} />
                  <div ref={lessonsScrollRef} className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
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
                        onClick={() => navigate(lessonUrl(plan.id, plan.title))}
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
                  <SectionHeader
                    title={db.bundleTitle}
                    onSeeAll={() => handleBundleClick(db)}
                    scrollRef={{ current: bundleScrollRefs.current[db.bundleId] }}
                  />
                  <div
                    ref={el => { bundleScrollRefs.current[db.bundleId] = el; }}
                    className="flex gap-2 overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0"
                  >
                    {db.allSeries.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleBundleClick(db)}
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

      {/* Purchase modal — bottom sheet on mobile, centered modal on desktop */}
      {modalBundle && (
        <PurchaseModal
          bundle={modalBundle}
          isOpen={true}
          onClose={() => setModalBundle(null)}
        />
      )}
    </div>
  );
}
