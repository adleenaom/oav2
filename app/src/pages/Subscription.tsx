import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import OAButton from '../components/OAButton';
import CoinIcon from '../components/CoinIcon';

const PACKAGES = [
  { id: 1, credits: 100, price: 'RM 9.90', popular: false },
  { id: 2, credits: 500, price: 'RM 39.90', popular: true },
  { id: 3, credits: 1000, price: 'RM 69.90', popular: false },
  { id: 4, credits: 2500, price: 'RM 149.90', popular: false },
];

export default function Subscription() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { credits } = useCredits();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Top Up Credits</h1>
            {isLoggedIn && (
              <div className="flex items-center gap-2 mt-2">
                <CoinIcon size={16} />
                <span className="type-headline-small text-text-primary">{credits}</span>
                <span className="type-description text-text-tertiary">current balance</span>
              </div>
            )}
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[600px]">
            {PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                className={`relative p-6 rounded-[16px] border-2 text-left transition-colors hover:border-action-secondary ${pkg.popular ? 'border-action-secondary bg-action-secondary/5' : 'border-border-default bg-bg-secondary'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-6 bg-action-secondary text-white type-tags px-3 py-1 rounded-full">Most Popular</span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <CoinIcon size={20} />
                  <span className="type-headline-large text-text-primary">{pkg.credits.toLocaleString()}</span>
                  <span className="type-description text-text-tertiary">credits</span>
                </div>
                <p className="type-headline-medium text-text-primary">{pkg.price}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 max-w-[600px]">
            <OAButton variant="primary" size="medium" fullWidth state="disabled">
              Payment coming soon
            </OAButton>
            <p className="type-description text-text-tertiary text-center mt-3">Stripe integration in progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
