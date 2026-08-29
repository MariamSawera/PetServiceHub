import { useLocation, useNavigate } from 'react-router-dom';
import { PawCareLogo } from './AuthShared';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthPage.css';

/**
 * Renders /login or /signup depending on the current route.
 * The top-right button toggles between the two by navigating.
 */
export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';

  return (
    <div className="pc-auth-page">
      <div className="pc-auth-card">
        <div className="pc-topbar">
          <PawCareLogo />
          <div className="pc-toggle-hint">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              type="button"
              className="pc-toggle-btn"
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
