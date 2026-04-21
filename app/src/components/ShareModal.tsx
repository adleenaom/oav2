import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const SHARE_OPTIONS = [
  {
    name: 'WhatsApp',
    color: 'bg-[#25D366]',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: 'Facebook',
    color: 'bg-[#1877F2]',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X',
    color: 'bg-[#000000]',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Email',
    color: 'bg-[#6B7280]',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    getUrl: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

export default function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (getUrl: (url: string, title: string) => string) => {
    window.open(getUrl(url, title), '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'relative bg-[#1a1a1a] rounded-t-[20px] md:rounded-[20px] w-full md:max-w-[400px] p-6',
          'animate-in slide-in-from-bottom duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="type-headline-medium text-white">Share</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Share options */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar mb-6">
          {SHARE_OPTIONS.map(opt => (
            <button
              key={opt.name}
              onClick={() => handleShare(opt.getUrl)}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', opt.color)}>
                <opt.icon />
              </div>
              <span className="type-pre-text text-white/70">{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 bg-white/10 rounded-[12px] p-2 pl-4">
          <span className="type-description text-white/60 truncate flex-1">{url}</span>
          <button
            onClick={handleCopy}
            className={cn(
              'shrink-0 px-4 py-2 rounded-[8px] type-button text-[13px] transition-colors',
              copied ? 'bg-accent-green text-white' : 'bg-accent-blue text-white'
            )}
          >
            {copied ? (
              <span className="flex items-center gap-1"><Check size={14} /> Copied</span>
            ) : (
              <span className="flex items-center gap-1"><Copy size={14} /> Copy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
