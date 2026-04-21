import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string; // if undefined, it's the current page (not clickable)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex items-center gap-1.5 mb-3">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-text-tertiary" />}
            {item.path && !isLast ? (
              <button
                onClick={() => navigate(item.path!)}
                className="type-description text-text-tertiary hover:text-text-primary transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="type-description text-text-secondary">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
