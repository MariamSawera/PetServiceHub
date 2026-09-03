import { Link } from 'react-router-dom';
import { Mail, MapPin, PawPrint, Phone } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Vets', to: '/vets' },
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const SUPPORT_LINKS = [
  { label: 'Help center', to: '/contact' },
  { label: 'Log in', to: '/login' },
  { label: 'Create an account', to: '/signup' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-2 md:px-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-white">
            <PawPrint size={24} className="text-teal-400" fill="currentColor" strokeWidth={0} />
            PawCare
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
            Trusted pet care, thoughtfully brought together for every wag, purr, and paw.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Explore</h2>
          <nav className="mt-5 flex flex-col gap-3" aria-label="Footer navigation">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="w-fit text-sm transition-colors hover:text-teal-300">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Support</h2>
          <nav className="mt-5 flex flex-col gap-3" aria-label="Support navigation">
            {SUPPORT_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="w-fit text-sm transition-colors hover:text-teal-300">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Get in touch</h2>
          <div className="mt-5 flex flex-col gap-4 text-sm text-slate-400">
            <a href="mailto:hello@pawcare.com" className="flex items-center gap-3 transition-colors hover:text-teal-300">
              <Mail size={17} className="shrink-0 text-teal-400" />
              hello@pawcare.com
            </a>
            <a href="tel:+15550142729" className="flex items-center gap-3 transition-colors hover:text-teal-300">
              <Phone size={17} className="shrink-0 text-teal-400" />
              +1 (555) 014-2729
            </a>
            <span className="flex items-center gap-3">
              <MapPin size={17} className="shrink-0 text-teal-400" />
              Available wherever you are
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-12">
          <span>© {new Date().getFullYear()} PawCare. All rights reserved.</span>
          <span>Made with care for pets and their people.</span>
        </div>
      </div>
    </footer>
  );
}
