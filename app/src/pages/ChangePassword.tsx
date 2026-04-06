import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import OAButton from '../components/OAButton';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { setError('Passwords do not match'); return; }
    if (newPw.length < 6) { setError('Minimum 6 characters'); return; }
    // TODO: API call
    setSaved(true);
    setTimeout(() => navigate(-1), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Change Password</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <form onSubmit={handleSubmit} className="max-w-[400px] flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Current password</label>
              <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Confirm new password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20" />
            </div>
            {error && <p className="type-description text-accent-magenta">{error}</p>}
            {saved && <p className="type-description text-accent-green">Password changed!</p>}
            <OAButton variant="primary" size="medium" fullWidth className="mt-2">Update Password</OAButton>
          </form>
        </div>
      </div>
    </div>
  );
}
