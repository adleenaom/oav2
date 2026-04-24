import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import OAButton from './OAButton';
import CoinIcon from './CoinIcon';
import ChaptersRow from './ChaptersRow';
import { useCredits } from '../hooks/useCredits';
import type { ApiBundleSummary } from '../services/types';
import { bundleUrl } from '../utils/slug';

type ModalState = 'overview' | 'success' | 'error';

interface PurchaseModalProps {
  bundle: ApiBundleSummary;
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseModal({ bundle, isOpen, onClose }: PurchaseModalProps) {
  const navigate = useNavigate();
  const { credits, purchaseBundle } = useCredits();
  const [state, setState] = useState<ModalState>('overview');
  const [purchasing, setPurchasing] = useState(false);

  if (!isOpen) return null;

  const isFree = bundle.is_free || bundle.credits_required === 0;
  const canAfford = isFree || credits >= bundle.credits_required;

  const handlePurchase = async () => {
    setPurchasing(true);
    const success = await purchaseBundle(bundle.id, bundle.credits_required, bundle.title);
    setPurchasing(false);
    if (success) {
      setState('success');
    } else {
      setState('error');
    }
  };

  const handleClose = () => {
    setState('overview');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          'relative bg-bg-base rounded-t-[24px] md:rounded-[24px] w-full md:max-w-[420px] max-h-[85vh] flex flex-col',
          'animate-in slide-in-from-bottom duration-300'
        )}
      >
        {/* ---- Overview state ---- */}
        {state === 'overview' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <span className="type-tags text-text-category">{bundle.category}</span>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Title */}
            <div className="px-6 pt-2 pb-4">
              <h2 className="type-display-medium text-text-primary">{bundle.title}</h2>
              <p className="type-body-default text-text-secondary mt-2">{bundle.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="type-tags text-text-secondary">{bundle.chapter_count || 0} chapters</span>
                <span className="type-tags text-text-tertiary">•</span>
                <span className="type-tags text-text-secondary">{bundle.duration_minutes} mins</span>
              </div>
            </div>

            {/* Chapter thumbnails */}
            <div className="px-6 pb-4">
              <ChaptersRow bundleId={bundle.id} size="small" />
            </div>

            {/* Creator */}
            {bundle.creator && (
              <div className="px-6 pb-4">
                <p className="type-description text-text-tertiary mb-2">Creators</p>
                <div className="flex items-center gap-3">
                  <img src={bundle.creator.avatar} alt={bundle.creator.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="type-headline-small text-text-primary">{bundle.creator.name}</p>
                    {bundle.creator.job_title && (
                      <p className="type-pre-text text-text-tertiary">{bundle.creator.job_title}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            </div>{/* end scrollable content */}

            {/* CTA — sticky at bottom */}
            <div className="p-6 pt-4 border-t border-border-default shrink-0 bg-bg-base rounded-b-[24px]">
              {!canAfford && (
                <p className="type-description text-accent-magenta text-center mb-3">
                  Not enough credits ({credits} available, {bundle.credits_required} needed)
                </p>
              )}
              <OAButton
                variant="primary"
                size="medium"
                fullWidth
                state={purchasing || !canAfford ? 'disabled' : 'default'}
                onClick={handlePurchase}
              >
                {purchasing ? 'Processing...' : isFree ? 'ADD TO MY LEARNING  |  FREE' : <span className="flex items-center justify-center gap-1">ADD TO MY LEARNING  |  <CoinIcon size={14} /> {bundle.credits_required}</span>}
              </OAButton>
            </div>
          </div>
        )}

        {/* ---- Success state ---- */}
        {state === 'success' && (
          <div className="flex flex-col items-center p-6 gap-4">
            <button onClick={handleClose} className="self-start w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors">
              <X size={20} className="text-text-secondary" />
            </button>

            <div className="py-4 flex flex-col items-center gap-3">
              <h2 className="type-headline-large text-text-primary text-center">Successfully Added!</h2>
              <p className="type-body-default text-text-secondary text-center">
                You can access the bundle in your learning in your profile.
              </p>
            </div>

            <OAButton variant="primary" size="medium" fullWidth onClick={() => { handleClose(); navigate(bundleUrl(bundle.id, bundle.title)); }}>
              Go to Bundle
            </OAButton>

            <button onClick={handleClose} className="type-button text-text-secondary py-3 hover:text-text-primary transition-colors">
              BACK TO OA ORIGINALS
            </button>
          </div>
        )}

        {/* ---- Error state ---- */}
        {state === 'error' && (
          <div className="flex flex-col items-center p-6 gap-4">
            <button onClick={handleClose} className="self-start w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors">
              <X size={20} className="text-text-secondary" />
            </button>

            <div className="py-4 flex flex-col items-center gap-3">
              <h2 className="type-headline-large text-accent-magenta text-center">Purchase Failed</h2>
              <p className="type-body-default text-text-secondary text-center">
                Not enough credits. Top up your balance and try again.
              </p>
            </div>

            <OAButton variant="blue" size="medium" fullWidth onClick={() => { handleClose(); navigate('/subscription'); }}>
              Top Up Credits
            </OAButton>

            <button onClick={handleClose} className="type-button text-text-secondary py-3">
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
