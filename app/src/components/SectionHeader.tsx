import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <h2 className="type-headline-large text-text-primary">{title}</h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className="p-0.5">
          <ChevronRight size={20} className="text-text-primary" />
        </button>
      )}
    </div>
  );
}
