import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Grid2X2,
  HeartPulse,
  Info,
  LogOut,
  Mail,
  Menu,
  PawPrint,
  Search,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/Auth/context/useAuth';
import { useTenant } from '../../app/providers/tenantContext';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../features/Notifications/services/notificationApi';

const GUEST_LINKS = [
  { label: 'Home', to: '/', icon: HeartPulse },
  { label: 'Services', to: '/services', icon: Grid2X2 },
  { label: 'Community', to: '/community', icon: UsersRound },
  { label: 'Vets', to: '/find-vets', icon: Stethoscope },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Contact', to: '/contact', icon: Mail },
];

const USER_LINKS = [
  ...GUEST_LINKS.slice(0, 3),
  { label: 'My Pets', to: '/pets', icon: PawPrint },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays },
  ...GUEST_LINKS.slice(4),
];

const PROVIDER_LINKS = [
  { label: 'Home', to: '/provider/dashboard', icon: HeartPulse },
  { label: 'Services', to: '/services', icon: Grid2X2 },
  { label: 'Appointments', to: '/provider/appointments', icon: CalendarDays },
  { label: 'My Profile', to: '/profile', icon: UserRound },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Contact', to: '/contact', icon: Mail },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tenantSlug, setTenantSlug } = useTenant();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    const loadNotifications = () => getNotifications()
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedNotification = notificationRef.current?.contains(event.target)
        || mobileNotificationRef.current?.contains(event.target);
      if (!clickedNotification) setNotificationOpen(false);
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const visibleNotifications = user ? notifications : [];
  const visibleUnreadCount = user ? unreadCount : 0;
  const visibleNavLinks = user?.role === 'provider' ? PROVIDER_LINKS : user ? USER_LINKS : GUEST_LINKS;
  const displayName = user?.name || (user?.role === 'provider' ? 'Provider' : 'User');
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTenantChange = () => {
    const nextTenant = window.prompt('Enter your workspace slug', tenantSlug);
    if (nextTenant) setTenantSlug(nextTenant);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.readAt) {
      await markNotificationRead(notification._id).catch(() => {});
      setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((current) => Math.max(0, current - 1));
    }
    setNotificationOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt || new Date().toISOString() })));
    setUnreadCount(0);
  };

  const isProvider = user?.role === 'provider';

  return (
    <header className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur ${isProvider ? 'border-indigo-100' : 'border-teal-100'}`}>
      <div className="mx-auto flex min-h-[76px] max-w-[1400px] items-center justify-between gap-5 px-5 md:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isProvider ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-700'}`}>
            <PawPrint size={27} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[19px] font-black tracking-tight text-slate-900">PetService<span className={isProvider ? 'text-indigo-600' : 'text-teal-600'}>Hub</span></span>
            <span className="block text-[10px] font-semibold tracking-wide text-slate-400">Healthy Pets <span className="mx-1 text-teal-400">•</span> Happy Lives</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.to}
              end={link.to === '/'}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                  isActive
                    ? `${isProvider ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'}`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <link.icon size={15} strokeWidth={2.5} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <button type="button" className="rounded-full p-2.5 text-slate-500 hover:bg-slate-50 hover:text-teal-700" aria-label="Search">
                <Search size={19} />
              </button>
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((current) => !current)}
                  className="relative rounded-full p-2.5 text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                  aria-label={`Notifications${visibleUnreadCount ? `, ${visibleUnreadCount} unread` : ''}`}
                  aria-expanded={notificationOpen}
                >
                  <Bell size={20} />
                  {visibleUnreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{visibleUnreadCount > 99 ? '99+' : visibleUnreadCount}</span>}
                </button>
                {notificationOpen && <NotificationPanel notifications={visibleNotifications} onNotificationClick={handleNotificationClick} onMarkAllRead={handleMarkAllRead} />}
              </div>
              <div ref={profileRef} className="relative">
                <button type="button" onClick={() => setProfileOpen((current) => !current)} className={`flex items-center gap-2 rounded-full px-2 py-1.5 ${isProvider ? 'bg-indigo-50' : 'bg-teal-50'}`} aria-expanded={profileOpen}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${isProvider ? 'bg-indigo-500' : 'bg-teal-600'}`}>{initials}</span>
                  <span className="max-w-28 truncate text-xs font-bold text-slate-700">{isProvider ? (user.clinicName || 'Your Clinic') : `Hi, ${displayName}`}</span>
                  <ChevronDown size={15} className="text-slate-500" />
                </button>
                {profileOpen && <ProfilePanel user={user} tenantSlug={tenantSlug} onTenantChange={handleTenantChange} onLogout={handleLogout} />}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-teal-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-teal-400 hover:text-teal-700">Log in</Link>
              <Link to="/signup" className="rounded-full bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-700">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-3 md:hidden sm:px-6">
          <nav className="flex flex-col gap-1">
            {visibleNavLinks.map((link) => (
              <NavLink
                key={link.to}
                end={link.to === '/'}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? `${isProvider ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <link.icon size={17} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div ref={mobileNotificationRef}>
                  <button type="button" onClick={() => setNotificationOpen((current) => !current)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50" aria-label="Open notifications">
                    <span className="flex items-center gap-2"><Bell size={18} /> Notifications</span>
                    {visibleUnreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{visibleUnreadCount}</span>}
                  </button>
                  {notificationOpen && <NotificationPanel notifications={visibleNotifications} onNotificationClick={handleNotificationClick} onMarkAllRead={handleMarkAllRead} mobile />}
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white ${isProvider ? 'bg-indigo-500' : 'bg-teal-600'}`}>{initials}</span>{displayName}</div>
                <button type="button" onClick={handleTenantChange} className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700" title="Change workspace">Workspace: {tenantSlug}</button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700"
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

function ProfilePanel({ user, tenantSlug, onTenantChange, onLogout }) {
  const provider = user.role === 'provider';
  return (
    <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
      <div className={`border-b px-4 py-3 ${provider ? 'bg-indigo-50' : 'bg-teal-50'}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{provider ? 'Provider account' : 'Pet parent account'}</p>
        <p className="mt-1 truncate text-sm font-black text-slate-800">{user.name || 'User'}</p>
      </div>
      <div className="p-2">
        <Link to={provider ? '/profile' : '/profile'} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700">
          <UserRound size={16} /> My Profile
        </Link>
        <Link to={provider ? '/provider/appointments' : '/appointments'} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700">
          <CalendarDays size={16} /> Appointments
        </Link>
        {!provider && <Link to="/pets" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700"><PawPrint size={16} /> My Pets</Link>}
        <button type="button" onClick={onTenantChange} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700" title="Change workspace">
          <span>Workspace</span><span className="max-w-24 truncate text-slate-400">{tenantSlug}</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}

function NotificationPanel({ notifications, onNotificationClick, onMarkAllRead, mobile = false }) {
  return <div className={`${mobile ? 'mt-1' : 'absolute right-0 top-12 z-50 w-96'} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg`}>
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p className="text-sm font-bold text-slate-900">Notifications</p><button type="button" onClick={onMarkAllRead} className="text-xs font-semibold text-teal-700 hover:underline">Mark all read</button></div>
    <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p> : notifications.map((notification) => <button type="button" key={notification._id} onClick={() => onNotificationClick(notification)} className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-teal-50 ${notification.readAt ? 'bg-white' : 'bg-teal-50/60'}`}><div className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-teal-600'}`} /><span><span className="block text-sm font-bold text-slate-800">{notification.title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{notification.message}</span><span className="mt-1 block text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span></span></div></button>)}
    </div>
  </div>;
}
