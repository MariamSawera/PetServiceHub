import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PawPrint, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/useAuth';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Vets', to: '/find-vets' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'My Pets', to: '/pets' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const visibleNavLinks = user
    ? [
        ...NAV_LINKS.filter((link) => user.role === 'provider' ? link.to !== '/pets' : true),
        { label: 'Appointments', to: user.role === 'provider' ? '/provider/appointments' : '/appointments' },
      ]
    : NAV_LINKS.filter((link) => link.to !== '/pets');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-slate-100">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
<Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-[#0B8F87]">   
       <PawPrint size={24} className="text-teal-600" fill="currentColor" strokeWidth={0} />
          PawCare
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.to}
              end={link.to === '/'}
              to={link.to}
              className={({ isActive }) =>
                `border-b-2 border-transparent pb-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                    : 'text-slate-600 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to={user.role === 'provider' ? '/provider/dashboard' : '/profile'} className="text-sm font-semibold text-slate-700 hover:text-teal-600">Hi, {user.name || 'User'}</Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden text-slate-700"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-2 sm:px-6">
          <nav className="flex flex-col gap-1">
            {visibleNavLinks.map((link) => (
              <NavLink
                key={link.to}
                end={link.to === '/'}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-[var(--theme-primary)] bg-teal-50 text-[var(--theme-primary)]'
                      : 'border-transparent text-slate-600 hover:border-[var(--theme-primary)] hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-sm font-semibold text-slate-700">Hi, {user.name || 'User'}</div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
