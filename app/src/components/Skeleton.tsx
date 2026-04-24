import { cn } from '@/lib/utils';

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-bg-secondary rounded-[8px]', className)} />
  );
}

/** Skeleton for a horizontal card row (ForYou, Continue Watching) */
export function SkeletonCardRow() {
  return (
    <div className="flex scroll-gap overflow-hidden mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 flex flex-col gap-2">
          <Shimmer className="w-[160px] h-[240px] md:w-[140px] md:h-[210px] rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a lesson card row */
export function SkeletonLessonRow() {
  return (
    <div className="flex scroll-gap overflow-hidden mt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[257px] md:w-[300px] rounded-[12px] overflow-hidden border border-border-card">
          <Shimmer className="w-full h-[145px] md:h-[170px] rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-full" />
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-24 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the originals grid */
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 card-grid-gap mt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Shimmer key={i} className="w-full aspect-[2/3]" />
      ))}
    </div>
  );
}

/** Skeleton for section header */
export function SkeletonSection({ hasCards = true }: { hasCards?: boolean }) {
  return (
    <div className="section-tight">
      <Shimmer className="h-6 w-40" />
      {hasCards && <SkeletonCardRow />}
    </div>
  );
}

/** Full homepage skeleton */
export function HomepageSkeleton() {
  return (
    <div className="container-content">
      {/* ForYou section */}
      <div className="section-tight">
        <Shimmer className="h-6 w-24" />
        <SkeletonCardRow />
      </div>

      {/* Lessons section */}
      <div className="section-tight">
        <Shimmer className="h-6 w-40" />
        <SkeletonLessonRow />
      </div>

      {/* Originals section */}
      <div className="section-tight">
        <Shimmer className="h-7 w-52" />
        <SkeletonGrid />
      </div>
    </div>
  );
}

/** Bundle detail skeleton */
export function BundleDetailSkeleton() {
  return (
    <div>
      {/* Hero */}
      <Shimmer className="w-full min-h-[300px] rounded-none" />
      <div className="container-content py-8">
        <div className="flex gap-10">
          <div className="flex-1 flex flex-col gap-4">
            <Shimmer className="h-7 w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-5 py-5 border-b border-border-default">
                <Shimmer className="w-6 h-6 rounded-full" />
                <Shimmer className="w-[80px] h-[120px]" />
                <div className="flex-1 flex flex-col gap-2">
                  <Shimmer className="h-5 w-3/4" />
                  <Shimmer className="h-3 w-24" />
                  <Shimmer className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex flex-col gap-5 w-[340px] shrink-0">
            <Shimmer className="h-[180px] rounded-[16px]" />
            <Shimmer className="h-[120px] rounded-[16px]" />
            <Shimmer className="h-[100px] rounded-[16px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
