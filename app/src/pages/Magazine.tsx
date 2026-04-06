import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// TODO: Wire to API when articles endpoint is ready
const MOCK_ARTICLES = [
  { id: 1, title: 'The Rise of Digital Learning in Southeast Asia', description: 'How the region is embracing online education', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', category: 'EDUCATION' },
  { id: 2, title: 'Financial Literacy for Gen Z', description: 'What young Malaysians need to know about money', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600', category: 'FINANCE' },
  { id: 3, title: 'Content Creation as a Career', description: 'From hobby to full-time income', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600', category: 'CAREER' },
];

export default function Magazine() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4 md:hidden">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Magazine</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="flex flex-col gap-4 max-w-[720px]">
            {MOCK_ARTICLES.map(article => (
              <button key={article.id} onClick={() => window.open('#', '_blank')} className="flex gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left">
                <img src={article.image} alt="" className="w-24 h-24 md:w-32 md:h-24 rounded-[8px] object-cover shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="type-tags text-text-category">{article.category}</span>
                  <h3 className="type-headline-small text-text-primary line-clamp-2">{article.title}</h3>
                  <p className="type-description text-text-secondary line-clamp-2">{article.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
