import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart } from 'lucide-react';

export default function Liked() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Liked Content</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="flex flex-col items-center gap-4 py-12">
            <Heart size={40} className="text-text-tertiary" />
            <p className="type-body-default text-text-tertiary text-center">No liked content yet</p>
            <p className="type-description text-text-tertiary text-center max-w-[260px]">Tap the heart icon on any video or bundle to save it here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
