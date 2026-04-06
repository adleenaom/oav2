import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import OAButton from '../components/OAButton';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] flex flex-col gap-8">

          {/* Logo + header */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-accent-yellow rounded-full p-3 border-2 border-white" style={{ boxShadow: 'var(--shadow-button)' }}>
              <GraduationCap size={32} className="text-text-primary" />
            </div>
            <div className="text-center">
              <h1 className="type-display-large text-text-primary">Create account</h1>
              <p className="type-body-default text-text-secondary mt-2">
                Start your learning journey today
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={cn(
                  'w-full px-4 py-3 rounded-[12px] border bg-bg-base type-body-default text-text-primary',
                  'placeholder:text-text-tertiary outline-none transition-colors',
                  'focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20',
                  error && error.toLowerCase().includes('email') ? 'border-accent-magenta' : 'border-border-default'
                )}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-[12px] border border-border-default bg-bg-base type-body-default text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="type-description font-semibold text-text-primary">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className={cn(
                  'w-full px-4 py-3 rounded-[12px] border bg-bg-base type-body-default text-text-primary',
                  'placeholder:text-text-tertiary outline-none transition-colors',
                  'focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20',
                  error && error.toLowerCase().includes('match') ? 'border-accent-magenta' : 'border-border-default'
                )}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="type-description text-accent-magenta text-center py-1">{error}</p>
            )}

            {/* Submit */}
            <OAButton
              variant="primary"
              size="medium"
              fullWidth
              state={loading ? 'disabled' : 'default'}
              className="mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </OAButton>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-3">
            <p className="type-body-default text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-action-secondary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
