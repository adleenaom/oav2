import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Trash2 } from 'lucide-react';
import { useLikes } from '../hooks/useLikes';
import { useHomepage } from '../hooks/useHomepage';

export default function Liked() {
  const navigate = useNavigate();
  const { likes, removeLike } = useLikes();
  const { forYou } = useHomepage();

  // Sort liked videos by most recent
  const sortedLikes = [...likes].sort((a, b) => b.likedAt - a.likedAt);

  // Find the forYou index for a liked video so we can navigate to it
  const getForYouIndex = (videoId: number): number => {
    const idx = forYou.findIndex(v => v.id === videoId);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-display-large text-text-primary">My Likes</h1>
          </div>
        </div>

        <div className="container-content section-tight">
          {sortedLikes.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <Heart size={48} className="text-text-tertiary" />
              <p className="type-headline-medium text-text-tertiary">No liked videos yet</p>
              <p className="type-body-default text-text-tertiary text-center max-w-[300px]">
                Tap the heart icon on any For You video to save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedLikes.map(video => (
                <div key={video.id} className="relative group">
                  <button
                    onClick={() => navigate(`/foryou/${getForYouIndex(video.id)}`)}
                    className="card-interactive relative aspect-[9/16] rounded-[12px] overflow-hidden bg-bg-secondary w-full"
                  >
                    <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="type-description text-white font-semibold line-clamp-2">{video.title}</p>
                    </div>
                  </button>
                  {/* Remove button — visible on hover (desktop) or always (mobile) */}
                  <button
                    onClick={() => removeLike(video.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
