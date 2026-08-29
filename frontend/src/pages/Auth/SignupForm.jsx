import { useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, PawPrint } from 'lucide-react';
import { TrustRow, PetImagePanel } from './AuthShared';

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreed: false,
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.agreed) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    // TODO: call your signup API here
    console.log('Signup payload:', form);
  };

  return (
    <div className="pc-body">
      <div className="pc-form-col">
        <h1>
          Create <span>your account</span>
        </h1>
        <p className="pc-subtitle">Join PawCare and give your pets the best care.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="pc-field">
            <label className="pc-label" htmlFor="fullName">Full Name</label>
            <div className="pc-input-wrap">
              <User size={18} />
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange('fullName')}
                required
              />
            </div>
          </div>

          <div className="pc-field">
            <label className="pc-label" htmlFor="email">Email Address</label>
            <div className="pc-input-wrap">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </div>
          </div>

          <div className="pc-field-row">
            <div className="pc-field">
              <label className="pc-label" htmlFor="password">Password</label>
              <div className="pc-input-wrap">
                <Lock size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="pc-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pc-field">
              <label className="pc-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="pc-input-wrap">
                <Lock size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  required
                />
                <button
                  type="button"
                  className="pc-eye-btn"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pc-field">
            <label className="pc-label" htmlFor="phone">Phone Number (Optional)</label>
            <div className="pc-input-wrap">
              <Phone size={18} />
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange('phone')}
              />
            </div>
          </div>

          <label className="pc-checkbox-row">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={handleChange('agreed')}
              required
            />
            <span>
              I agree to the <a className="pc-link" href="/terms">Terms of Service</a> and{' '}
              <a className="pc-link" href="/privacy">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" className="pc-submit-btn">
            Create Account
            <PawPrint size={16} fill="currentColor" strokeWidth={0} />
          </button>
        </form>

        <div className="pc-divider">or sign up with</div>

        <div className="pc-social-row">
          <button type="button" className="pc-social-btn" onClick={() => console.log('google signup')}>
            <GoogleIcon /> Google
          </button>
          <button type="button" className="pc-social-btn" onClick={() => console.log('facebook signup')}>
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
