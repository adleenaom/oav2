import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Share2, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import OAButton from '../components/OAButton';
import { useState } from 'react';

export default function Referral() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralCode = `OA-${user?.id ?? '0000'}`;
  const referralLink = `https://openacademy.org/join?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Invite Friends</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="max-w-[400px] flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 py-4">
              <Share2 size={40} className="text-action-secondary" />
              <h2 className="type-headline-medium text-text-primary text-center">Share the love of learning</h2>
              <p className="type-body-default text-text-secondary text-center">Invite friends and you both earn 50 credits when they sign up.</p>
            </div>
            <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col gap-4">
              <p className="type-description text-text-tertiary text-center">Your referral code</p>
              <p className="type-headline-large text-text-primary text-center tracking-[4px]">{referralCode}</p>
              <div className="bg-bg-base rounded-[8px] p-3 flex items-center gap-2">
                <span className="type-description text-text-secondary flex-1 truncate">{referralLink}</span>
                <button onClick={handleCopy} className="shrink-0 text-action-secondary hover:text-action-secondary/80 transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <OAButton variant="blue" size="medium" fullWidth onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Referral Link'}
            </OAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
