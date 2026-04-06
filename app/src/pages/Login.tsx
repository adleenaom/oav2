import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import OAButton from '../components/OAButton';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail || 'Invalid email or password';
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
              <h1 className="type-display-large text-text-primary">Welcome back</h1>
              <p className="type-body-default text-text-secondary mt-2">
                Sign in to continue learning
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  error ? 'border-accent-magenta' : 'border-border-default'
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
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className={cn(
                    'w-full px-4 py-3 pr-12 rounded-[12px] border bg-bg-base type-body-default text-text-primary',
                    'placeholder:text-text-tertiary outline-none transition-colors',
                    'focus:border-action-secondary focus:ring-2 focus:ring-action-secondary/20',
                    error ? 'border-accent-magenta' : 'border-border-default'
                  )}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </OAButton>

            {/* Demo hint */}
            <div className="bg-bg-secondary rounded-[12px] p-4 mt-2">
              <p className="type-description text-text-tertiary text-center">
                Demo account: <span className="text-text-primary font-semibold">demo@openacademy.org</span> / <span className="text-text-primary font-semibold">demo1234</span>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-3">
            <p className="type-body-default text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-action-secondary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
