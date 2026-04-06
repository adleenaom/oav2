import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import BundleThumbnail from '../components/BundleThumbnail';
import LessonCard from '../components/LessonCard';
import type { ApiHomeListings } from '../services/types';

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
  const creators = searchResults?.creators ?? [];
  const isSearching = query.length >= 2;

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        {/* Search header */}
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <h1 className="type-headline-large text-text-primary mb-4 md:text-[24px]">Discover</h1>
            <div className="relative">
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

        <div className="container-content">
          {/* Search results */}
          {isSearching ? (
            <div className="section-tight flex flex-col gap-8">
              {/* Lesson results */}
              {(searchResults?.plans?.length ?? 0) > 0 && (
                <div>
                  <h2 className="type-headline-medium text-text-primary mb-4">Lesson Plans</h2>
                  <div className="flex flex-col gap-4">
                    {searchResults!.plans.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => navigate(`/lesson/${plan.id}`)}
                        className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                      >
                        <img src={plan.image} alt="" className="w-16 h-16 rounded-[8px] object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="type-tags text-text-category">{plan.category}</span>
                          <p className="type-headline-small text-text-primary mt-0.5 truncate">{plan.title}</p>
                          <p className="type-description text-text-secondary mt-0.5 line-clamp-1">{plan.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bundle results */}
              {(searchResults?.bundles?.length ?? 0) > 0 && (
                <div>
                  <h2 className="type-headline-medium text-text-primary mb-4">Bundles</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap">
                    {searchResults!.bundles.map(bundle => (
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
              )}

              {/* Creator results */}
              {creators.length > 0 && (
                <div>
                  <h2 className="type-headline-medium text-text-primary mb-4">Creators</h2>
                  <div className="flex flex-col gap-3">
                    {creators.map(creator => (
                      <button
                        key={creator.id}
                        onClick={() => navigate(`/creator/${creator.id}`)}
                        className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                      >
                        <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="type-headline-small text-text-primary">{creator.name}</p>
                          <p className="type-description text-text-tertiary">{creator.job_title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {searchResults && !searchResults.plans.length && !searchResults.bundles.length && !searchResults.creators.length && (
                <div className="py-12 text-center">
                  <p className="type-body-default text-text-tertiary">No results for "{query}"</p>
                </div>
              )}
            </div>
          ) : (
            /* Browse mode */
            <div className="section-tight flex flex-col gap-8">
              {/* Explore Lessons */}
              <div>
                <h2 className="type-headline-medium text-text-primary mb-4">Explore Lesson Plans</h2>
                <div className="flex flex-col gap-4">
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
                      className="w-full"
                    />
                  ))}
                </div>
              </div>

              {/* Suggested Creators */}
              <div>
                <h2 className="type-headline-medium text-text-primary mb-4">Suggested Creators</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {(data?.originals ?? []).slice(0, 4).map((b, i) => (
                    <button
                      key={i}
                      onClick={() => b.creator && navigate(`/creator/${b.creator.id}`)}
                      className="flex flex-col items-center gap-2 shrink-0"
                    >
                      <img src={b.creator?.avatar || ''} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-accent-yellow" />
                      <span className="type-description text-text-primary text-center w-[72px] truncate">{b.creator?.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
