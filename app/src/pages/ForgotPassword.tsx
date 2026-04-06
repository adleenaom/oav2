import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import OAButton from '../components/OAButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call
    setSent(true);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-accent-yellow rounded-full p-3 border-2 border-white" style={{ boxShadow: 'var(--shadow-button)' }}>
              <GraduationCap size={32} className="text-text-primary" />
            </div>
            <h1 className="type-display-large text-text-primary">Reset password</h1>
            <p className="type-body-default text-text-secondary text-center">Enter your email and we'll send you a reset link</p>
          </div>
          {sent ? (
            <div className="bg-accent-green/10 rounded-[12px] p-6 text-center">
              <p className="type-headline-small text-accent-green mb-2">Check your email</p>
              <p className="type-description text-text-secondary">We've sent a reset link to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="type-description font-semibold text-text-primary">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary placeholder:text-text-tertiary outline-none focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20" />
              </div>
              <OAButton variant="primary" size="medium" fullWidth className="mt-2">Send Reset Link</OAButton>
            </form>
          )}
          <p className="type-body-default text-text-secondary text-center">
            <Link to="/login" className="text-action-secondary font-semibold hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
