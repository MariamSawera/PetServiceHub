import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, PawPrint, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/useAuth';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../features/Notifications/services/notificationApi';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Community', to: '/community' },
  { label: 'Vets', to: '/find-vets' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'My Pets', to: '/pets' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
  const visibleNotifications = user ? notifications : [];
  const visibleUnreadCount = user ? unreadCount : 0;
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((current) => !current)}
                  className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                  aria-label={`Notifications${visibleUnreadCount ? `, ${visibleUnreadCount} unread` : ''}`}
                  aria-expanded={notificationOpen}
                >
                  <Bell size={20} />
                  {visibleUnreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{visibleUnreadCount > 99 ? '99+' : visibleUnreadCount}</span>}
                </button>
                {notificationOpen && <NotificationPanel notifications={visibleNotifications} onNotificationClick={handleNotificationClick} onMarkAllRead={handleMarkAllRead} />}
              </div>
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
                <button type="button" onClick={() => setNotificationOpen((current) => !current)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50" aria-label="Open notifications">
                  <span className="flex items-center gap-2"><Bell size={18} /> Notifications</span>
                  {visibleUnreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{visibleUnreadCount}</span>}
                </button>
                {notificationOpen && <NotificationPanel notifications={visibleNotifications} onNotificationClick={handleNotificationClick} onMarkAllRead={handleMarkAllRead} mobile />}
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

function NotificationPanel({ notifications, onNotificationClick, onMarkAllRead, mobile = false }) {
  return <div className={`${mobile ? 'mt-1' : 'absolute right-0 top-12 z-50 w-96'} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg`}>
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p className="text-sm font-bold text-slate-900">Notifications</p><button type="button" onClick={onMarkAllRead} className="text-xs font-semibold text-teal-700 hover:underline">Mark all read</button></div>
    <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p> : notifications.map((notification) => <button type="button" key={notification._id} onClick={() => onNotificationClick(notification)} className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-teal-50 ${notification.readAt ? 'bg-white' : 'bg-teal-50/60'}`}><div className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-teal-600'}`} /><span><span className="block text-sm font-bold text-slate-800">{notification.title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{notification.message}</span><span className="mt-1 block text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span></span></div></button>)}
    </div>
  </div>;
}
