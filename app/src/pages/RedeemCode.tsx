import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift } from 'lucide-react';
import OAButton from '../components/OAButton';
import { useAuth } from '../hooks/useAuth';

export default function RedeemCode() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call POST /credits/redeem
    if (code.trim().length > 3) {
      setStatus('success');
      refreshUser();
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Redeem Gift Code</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="max-w-[400px] flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 py-4">
              <Gift size={40} className="text-accent-yellow" />
              <p className="type-body-default text-text-secondary text-center">Enter your gift code to receive credits or unlock content.</p>
            </div>
            <form onSubmit={handleRedeem} className="flex flex-col gap-4">
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter code" required className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-headline-medium text-text-primary text-center tracking-[4px] placeholder:tracking-normal placeholder:text-text-tertiary placeholder:type-body-default outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20 uppercase" />
              {status === 'success' && <p className="type-description text-accent-green text-center">Code redeemed successfully!</p>}
              {status === 'error' && <p className="type-description text-accent-magenta text-center">Invalid code. Please try again.</p>}
              <OAButton variant="primary" size="medium" fullWidth>Redeem</OAButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
