import { Search, ChevronDown } from 'lucide-react';

export default function SearchHeader() {
  return (
    <div className="relative bg-bg-secondary overflow-hidden px-6 pt-14 pb-6">
      {/* Background logo (decorative) */}
      <div className="absolute top-[53px] right-0 w-[204px] h-[192px] opacity-10">
        <svg viewBox="0 0 204 192" fill="none" className="w-full h-full">
          <circle cx="102" cy="96" r="90" stroke="#202020" strokeWidth="2" />
          <ellipse cx="62" cy="80" rx="13" ry="8" transform="rotate(26 62 80)" fill="#F1B100" />
          <ellipse cx="92" cy="62" rx="13" ry="8" transform="rotate(69 92 62)" fill="#D80A57" />
          <ellipse cx="128" cy="62" rx="13" ry="8" transform="rotate(107 128 62)" fill="#8DC0E7" />
          <ellipse cx="152" cy="78" rx="13" ry="8" transform="rotate(153 152 78)" fill="#A6C311" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="type-title-medium text-text-primary">Start Learning</h1>
        <Search size={22} className="text-text-primary" />
      </div>

      <div className="bg-bg-elevated border-2 border-border-input rounded-[16px] px-6 py-4 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-button)' }}>
        <span className="type-title-medium italic text-text-tertiary">All Categories</span>
        <ChevronDown size={16} className="text-text-tertiary" />
      </div>
    </div>
  );
}
