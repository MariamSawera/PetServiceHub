import { useLocation, useNavigate } from 'react-router-dom';
import { PawCareLogo } from '../components/AuthShared';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

/**
 * Renders /login or /signup depending on the current route.
 * The top-right button toggles between the two by navigating.
 */
export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] px-4 py-8 font-sans">
      <div className="relative w-full max-w-[960px] rounded-[20px] bg-[var(--theme-surface)] p-6 shadow-[0_20px_50px_var(--theme-shadow)] sm:p-10">
        <div className="mb-8 flex items-center justify-between">
          <PawCareLogo />
          <div className="flex items-center gap-3 text-sm text-[var(--theme-text-muted)]">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              type="button"
              className="cursor-pointer rounded-lg border-[1.5px] border-[var(--theme-primary)] bg-transparent px-[18px] py-2 text-sm font-semibold text-[var(--theme-primary)] transition-colors hover:bg-[var(--theme-primary)] hover:text-white"
              onClick={() => navigate(isLogin ? '/signup' : '/login')}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}
