import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import CoinIcon from '../components/CoinIcon';
import { useCredits } from '../hooks/useCredits';

export default function CreditHistory() {
  const navigate = useNavigate();
  const { credits, transactions } = useCredits();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            {/* Mobile back */}
            <button onClick={() => navigate(-1)} className="md:hidden flex items-center gap-1 mb-4">
              <ChevronLeft size={14} className="text-text-primary" />
              <span className="type-button text-text-primary">Back</span>
            </button>
            <Breadcrumb items={[
              { label: 'Home', path: '/' },
              { label: 'Profile', path: '/profile' },
              { label: 'Credit History' },
            ]} />
            <div className="flex items-center justify-between">
              <h1 className="type-display-large text-text-primary">Credit History</h1>
              <div className="flex items-center gap-2 bg-bg-base rounded-lg px-4 py-2">
                <CoinIcon size={16} />
                <span className="type-headline-medium text-text-primary">{credits}</span>
                <span className="type-description text-text-tertiary">credits</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container-content section-tight">
          {transactions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {transactions.map(txn => (
                <div key={txn.id} className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    txn.type === 'topup' ? 'bg-accent-green/15' : 'bg-accent-magenta/10'
                  }`}>
                    <span className={`text-[14px] font-bold ${
                      txn.type === 'topup' ? 'text-accent-green' : 'text-accent-magenta'
                    }`}>
                      {txn.type === 'topup' ? '+' : '−'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="type-description font-semibold text-text-primary truncate">{txn.label}</p>
                    <p className="type-pre-text text-text-tertiary">
                      {new Date(txn.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      Balance: {txn.balance}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CoinIcon size={14} />
                    <span className={`type-headline-small ${
                      txn.type === 'topup' ? 'text-accent-green' : 'text-text-primary'
                    }`}>
                      {txn.type === 'topup' ? '+' : ''}{txn.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-secondary rounded-[12px] p-8 flex flex-col items-center gap-3">
              <CoinIcon size={40} />
              <p className="type-headline-medium text-text-tertiary">No transactions yet</p>
              <p className="type-body-default text-text-tertiary text-center">Your credit purchases and top-ups will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
