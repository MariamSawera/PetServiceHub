import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PawPrint, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Vets', to: '/vets' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
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

        {/* Desktop auth button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Log in
          </Link>
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
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
