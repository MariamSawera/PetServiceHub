import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, PawPrint } from 'lucide-react';
import { TrustRow, PetImagePanel } from './AuthShared';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { googleLoginUrl } from '../services/authApi';

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('error') === 'google_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === 'provider' ? '/provider/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid items-center gap-10 min-[861px]:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="mb-2 text-[32px] font-extrabold text-[var(--theme-text)]">
          Welcome <span>back!</span>
        </h1>
        <p className="mb-7 text-[15px] leading-6 text-[var(--theme-text-muted)]">Log in to continue caring for your pets.</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="mb-3.5 text-[13px] font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-[13.5px] font-semibold text-[var(--theme-text-strong)]" htmlFor="loginEmail">Email Address</label>
            <div className="relative flex items-center [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:text-[var(--theme-text-soft)]">
              <Mail size={18} />
              <input
                id="loginEmail"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange('email')}
                required className="box-border w-full rounded-[10px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] px-[42px] py-3 text-[14.5px] text-[var(--theme-text)] outline-none transition focus:border-[var(--theme-primary)] focus:ring-[3px] focus:ring-[var(--theme-primary)]/15"
              />
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-[13.5px] font-semibold text-[var(--theme-text-strong)]" htmlFor="loginPassword">Password</label>
            <div className="relative flex items-center [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:text-[var(--theme-text-soft)]">
              <Lock size={18} />
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                required className="box-border w-full rounded-[10px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] pl-[42px] pr-14 py-3 text-[14.5px] text-[var(--theme-text)] outline-none transition focus:border-[var(--theme-primary)] focus:ring-[3px] focus:ring-[var(--theme-primary)]/15"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--theme-text-soft)] hover:bg-[var(--theme-primary-pale)] hover:text-[var(--theme-primary)]"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between text-[13.5px]">
            <label className="flex items-center gap-2 text-[var(--theme-text-muted)]">
              <input className="mt-0.5 h-[17px] w-[17px] shrink-0 cursor-pointer appearance-none rounded border border-[var(--theme-border)] bg-[var(--theme-surface)] checked:border-[var(--theme-primary)] checked:bg-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20" type="checkbox" checked={form.remember} onChange={handleChange('remember')} />
              Remember me
            </label>
            <Link className="font-semibold text-[var(--theme-primary)] hover:underline" to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--theme-primary)] p-3.5 text-[15.5px] font-bold text-white transition hover:bg-[var(--theme-primary-hover)] active:scale-[0.99]" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
            <PawPrint size={16} fill="currentColor" strokeWidth={0} />
          </button>
        </form>

        <div className="my-[22px] flex items-center gap-3 text-[13px] text-[var(--theme-text-soft)] before:h-px before:flex-1 before:bg-[var(--theme-border)] after:h-px after:flex-1 after:bg-[var(--theme-border)]">or continue with</div>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-sm font-semibold text-[var(--theme-text-strong)] transition hover:bg-[var(--theme-surface-muted)]"
            onClick={() => {
              window.location.href = googleLoginUrl;
            }}
          >
            <GoogleIcon /> Google
          </button>
          <button type="button" className="flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-sm font-semibold text-[var(--theme-text-strong)] transition hover:bg-[var(--theme-surface-muted)]" onClick={() => console.log('facebook login')}>
            <FacebookIcon /> Facebook
          </button>
        </div>

        <TrustRow />
      </div>

      <PetImagePanel />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.6 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="9" fill="#1877F2" />
      <path
        fill="#fff"
        d="M12.1 9h-1.9v6H7.8V9H6.4V7.1h1.4V5.9c0-1.4.7-2.4 2.3-2.4h1.7v1.9h-1.1c-.4 0-.6.2-.6.6v1.1h1.7L12.1 9z"
      />
    </svg>
  );
}
