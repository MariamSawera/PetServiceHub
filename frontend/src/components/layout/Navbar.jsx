import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PawPrint, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/useAuth';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Vets', to: '/vets' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
<Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-[#0B8F87]">   
       <PawPrint size={24} className="text-teal-600" fill="currentColor" strokeWidth={0} />
          PawCare
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'
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
              <span className="text-sm font-semibold text-slate-700">Hi, {user.name || 'User'}</span>
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
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
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
