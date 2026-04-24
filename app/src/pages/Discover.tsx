import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowUp } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import LessonCard from '../components/LessonCard';
import PurchaseModal from '../components/PurchaseModal';
import { useHomepage } from '../hooks/useHomepage';
import { useCredits } from '../hooks/useCredits';
import { apiPost } from '../services/api';
import { getSeries, getBundles, getCreators, type OABundle, type OACreator, type OASeries, type OAPlan } from '../services/oa-api';
import type { ApiBundleSummary } from '../services/types';
import { bundleUrl, lessonUrl, creatorUrl } from '../utils/slug';

/** Resolved bundle with its series for display */
interface DiscoverBundleRow {
  bundle: OABundle;
  series: OASeries[];
}

const BATCH_SIZE = 3;

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { plans } = useHomepage();
  const { isBundleAccessible } = useCredits();
  const lessonsScrollRef = useRef<HTMLDivElement>(null);
  const bundleScrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [modalBundle, setModalBundle] = useState<ApiBundleSummary | null>(null);

  // Paginated bundle loading
  const [allBundleIds, setAllBundleIds] = useState<number[]>([]);
  const [bundleRows, setBundleRows] = useState<DiscoverBundleRow[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Fetch all bundle IDs once
  useEffect(() => {
    apiPost<{ items: { id: number }[] }>('/v3/bundles/search', { query: '', size: 100, index: 0 })
      .then(res => {
        const ids = (res.items || []).map(i => i.id);
        setAllBundleIds(ids);
        setHasMore(ids.length > 0);
      })
      .catch(() => {});
  }, []);

  // Load a batch of bundles with their series
  const loadBatch = useCallback(async () => {
    if (loadingMore || !hasMore || allBundleIds.length === 0) return;
    setLoadingMore(true);

    const batchIds = allBundleIds.slice(loadedCount, loadedCount + BATCH_SIZE);
    if (batchIds.length === 0) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    try {
      const bundles = await getBundles(batchIds);
      // Resolve series for each bundle
      const allSeriesIds = [...new Set(bundles.flatMap(b => (b.series || []).map(s => s.id)))];
      const allSeries = allSeriesIds.length > 0 ? await getSeries(allSeriesIds) : [];

      const newRows: DiscoverBundleRow[] = bundles.map(b => {
        const bSeriesIds = (b.series || []).map(s => s.id);
        const bSeries = bSeriesIds
          .map(id => allSeries.find(s => s.id === id))
          .filter(Boolean) as OASeries[];
        return { bundle: b, series: bSeries };
      });

      setBundleRows(prev => [...prev, ...newRows]);
      setLoadedCount(prev => prev + batchIds.length);
      setHasMore(loadedCount + batchIds.length < allBundleIds.length);
    } catch {}
    setLoadingMore(false);
  }, [allBundleIds, loadedCount, loadingMore, hasMore]);

  // Load first batch when IDs arrive
  useEffect(() => {
    if (allBundleIds.length > 0 && loadedCount === 0) loadBatch();
  }, [allBundleIds]);

  // Back to top visibility
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowBackToTop(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Infinite scroll — load more when sentinel is visible
  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadBatch(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadBatch]);

  /** Handle clicking a bundle section — modal if locked, navigate if accessible */
  const handleBundleClick = (row: DiscoverBundleRow) => {
    const b = row.bundle;
    const isFree = b.creditsRequired === 0;
    if (isBundleAccessible(b.id, isFree)) {
      navigate(bundleUrl(b.id, b.title));
    } else {
      setModalBundle({
        id: b.id,
        plan_id: b.plan?.id || null,
        title: b.title,
        subtitle: '',
        description: b.description,
        category: '',
        credits_required: b.creditsRequired,
        duration_minutes: b.durationMinutes,
        is_free: isFree,
        thumbnail: row.series[0]?.image || '',
        chapter_count: (b.series || []).length,
        creator: null,
      });
    }
  };

  // Search — bundles and creators only
  const [searchResults, setSearchResults] = useState<{
    lessons: OAPlan[];
    bundles: { bundle: OABundle; thumbnail: string }[];
    creators: OACreator[];
  } | null>(null);
  const isSearching = query.length >= 2;

  useEffect(() => {
    if (!isSearching) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try {
        const [bundleRes, creatorRes] = await Promise.all([
          apiPost<{ items: { id: number }[] }>('/v3/bundles/search', { query, size: 12, index: 0 }).catch(() => ({ items: [] })),
          apiPost<{ items: { id: number }[] }>('/v3/creators/search', { query, size: 6, index: 0 }).catch(() => ({ items: [] })),
        ]);

        const bundleIds = (bundleRes.items || []).map(r => r.id);
        const creatorIds = (creatorRes.items || []).map(r => r.id);

        // Match lesson plans locally by title
        const queryLower = query.toLowerCase();
        const matchedLessons = plans.filter(p => p.title.toLowerCase().includes(queryLower));

        const [resolvedBundles, resolvedCreators] = await Promise.all([
          bundleIds.length > 0 ? getBundles(bundleIds) : Promise.resolve([]),
          creatorIds.length > 0 ? getCreators(creatorIds) : Promise.resolve([]),
        ]);

        // Resolve first series image for each bundle thumbnail
        const allFirstSeriesIds = resolvedBundles.map(b => b.series?.[0]?.id).filter(Boolean) as number[];
        const firstSeries = allFirstSeriesIds.length > 0 ? await getSeries(allFirstSeriesIds) : [];
        const seriesImageMap = new Map(firstSeries.map(s => [s.id, s.image]));

        setSearchResults({
          lessons: matchedLessons,
          bundles: resolvedBundles.map(b => ({
            bundle: b,
            thumbnail: seriesImageMap.get(b.series?.[0]?.id || 0) || '',
          })),
          creators: resolvedCreators,
        });
      } catch {
        setSearchResults({ lessons: [], bundles: [], creators: [] });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, isSearching, plans]);

  return (
    <div className="flex flex-col h-full relative">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto hide-scrollbar pb-[103px] md:pb-0">

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
              ) : (searchResults.lessons.length + searchResults.bundles.length + searchResults.creators.length) === 0 ? (
                <p className="type-body-default text-text-tertiary text-center py-12">No results for "{query}"</p>
              ) : (
                <div className="flex flex-col gap-8 py-6">
                  {/* Lessons */}
                  {searchResults.lessons.length > 0 && (
                    <div>
                      <h3 className="type-headline-medium text-text-primary mb-4">Lessons</h3>
                      <div className="flex flex-col gap-3">
                        {searchResults.lessons.map(plan => (
                          <button
                            key={plan.id}
                            onClick={() => navigate(lessonUrl(plan.id, plan.title))}
                            title={plan.title}
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
                        {searchResults.bundles.map(({ bundle: b, thumbnail }) => (
                          <button
                            key={b.id}
                            onClick={() => navigate(bundleUrl(b.id, b.title))}
                            title={b.title}
                            className="card-interactive rounded-[12px] overflow-hidden bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                          >
                            <div className="w-full aspect-[3/4] bg-bg-base">
                              {thumbnail && <img src={thumbnail} alt={b.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="p-3">
                              <p className="type-description font-semibold text-text-primary truncate">{b.title}</p>
                              <p className="type-pre-text text-text-tertiary mt-0.5">{(b.series || []).length} chapters · {b.durationMinutes} mins</p>
                            </div>
                          </button>
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

            {/* Bundle sections — loaded incrementally from API */}
            {bundleRows.map(row => (
              <div key={row.bundle.id} className="bg-bg-base section-tight">
                <div className="container-content">
                  <SectionHeader
                    title={row.bundle.title}
                    onSeeAll={() => handleBundleClick(row)}
                    scrollRef={{ current: bundleScrollRefs.current[row.bundle.id] }}
                  />
                  <div
                    ref={el => { bundleScrollRefs.current[row.bundle.id] = el; }}
                    className="flex gap-2 overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0"
                  >
                    {row.series.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleBundleClick(row)}
                        title={s.title}
                        className="card-interactive relative w-[120px] h-[160px] md:w-[150px] md:h-[200px] rounded-[8px] overflow-hidden shrink-0"
                      >
                        <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite scroll sentinel + loading indicator */}
            <div ref={scrollSentinelRef} className="py-4">
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse type-body-default text-text-tertiary">Loading more...</div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="hidden md:block h-20" />
      </div>

      {/* Back to top — desktop only */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="hidden md:flex fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full bg-action-primary text-white items-center justify-center shadow-lg hover:bg-[#333] transition-colors"
          title="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

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
