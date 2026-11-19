import { useEffect, useState } from 'react';
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  PawPrint,
  ClipboardList,
  ShieldCheck,
  Star,
  Trash2,
  UsersRound,
} from 'lucide-react';
import {
  deleteAdminClinic,
  deleteAdminPost,
  deleteAdminReview,
  getAdminAppointments,
  getAdminClinics,
  getAdminOverview,
  getAdminPosts,
  getAdminReviews,
  getAdminUsers,
  updateAdminAppointment,
  updateAdminUser,
  getTenantAuditLogs,
} from '../services/adminApi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: UsersRound },
  { id: 'clinics', label: 'Clinics', icon: Building2 },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'posts', label: 'Community', icon: MessageSquareText },
  { id: 'audit', label: 'Audit logs', icon: ClipboardList },
];

const dateLabel = (value) => value
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '-';

const StatusBadge = ({ value }) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${colors[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (tab === 'overview') setOverview((await getAdminOverview()).data);
        if (tab === 'users') setUsers((await getAdminUsers()).data);
        if (tab === 'clinics') setClinics((await getAdminClinics()).data);
        if (tab === 'appointments') setAppointments((await getAdminAppointments()).data);
        if (tab === 'reviews') setReviews((await getAdminReviews()).data);
        if (tab === 'posts') setPosts((await getAdminPosts()).data);
        if (tab === 'audit') setAuditLogs((await getTenantAuditLogs()).data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Could not load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const removeWithConfirm = async (message, action, onSuccess) => {
    if (!window.confirm(message)) return;
    try {
      await action();
      onSuccess();
      setError('');
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Could not complete the action');
    }
  };

  const stats = overview?.stats || {};
  const cards = [
    { label: 'Users', value: stats.users, icon: UsersRound, color: 'bg-sky-50 text-sky-700' },
    { label: 'Providers', value: stats.providers, icon: ShieldCheck, color: 'bg-violet-50 text-violet-700' },
    { label: 'Clinics', value: stats.clinics, icon: Building2, color: 'bg-teal-50 text-teal-700' },
    { label: 'Pets', value: stats.pets, icon: PawPrint, color: 'bg-amber-50 text-amber-700' },
    { label: 'Appointments', value: stats.appointments, icon: CalendarDays, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pending', value: stats.pendingAppointments, icon: CalendarDays, color: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white"><PawPrint size={21} /></div>
          <div><p className="font-black text-slate-950">PetServiceHub</p><p className="text-xs font-semibold text-slate-400">Admin Panel</p></div>
        </div>
        <nav className="space-y-1">
          {TABS.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${tab === item.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="lg:ml-64">
        <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Administration</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{TABS.find((item) => item.id === tab)?.label || 'Admin'}</h1>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {TABS.map((item) => (
              <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${tab === item.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <item.icon size={14} />{item.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="mx-auto max-w-7xl p-5 lg:p-8">
          {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading...</div>
          ) : (
            <>
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                      <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div><p className="text-sm font-semibold text-slate-500">{card.label}</p><p className="mt-2 text-3xl font-black text-slate-950">{card.value ?? 0}</p></div>
                          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}><card.icon size={21} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-950">Recent appointments</h2></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm"><tbody>
                        {overview?.recentAppointments?.map((appointment) => (
                          <tr key={appointment._id} className="border-b border-slate-100 last:border-0">
                            <td className="whitespace-nowrap px-5 py-4"><p className="font-bold text-slate-900">{appointment.user?.name || 'Unknown user'}</p><p className="text-xs text-slate-400">{appointment.pet?.name || 'Unknown pet'}</p></td>
                            <td className="px-5 py-4 text-slate-600">{appointment.clinic?.name || '-'}</td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dateLabel(appointment.date)}</td>
                            <td className="px-5 py-4"><StatusBadge value={appointment.status} /></td>
                          </tr>
                        ))}
                      </tbody></table>
                    </div>
                  </section>
                </div>
              )}

              {tab === 'users' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Verified</th><th className="px-5 py-3">Membership</th><th className="px-5 py-3">Joined</th></tr></thead>
                    <tbody>{users.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="text-xs text-slate-400">{item.email}</p></td>
                        <td className="px-5 py-4"><select value={item.membership?.role === 'tenant_admin' ? 'admin' : (item.membership?.role || item.role)} onChange={async (event) => { try { const { data } = await updateAdminUser(item._id, { role: event.target.value }); setUsers((current) => current.map((user) => user._id === item._id ? data : user)); } catch (e) { setError(e.response?.data?.message || 'Could not update role'); } }} className="rounded-lg border border-slate-200 px-2 py-2 font-semibold"><option value="user">User</option><option value="provider">Provider</option><option value="admin">Tenant admin</option></select></td>
                        <td className="px-5 py-4"><button type="button" onClick={async () => { try { const { data } = await updateAdminUser(item._id, { isVerified: !item.isVerified }); setUsers((current) => current.map((user) => user._id === item._id ? data : user)); } catch (e) { setError(e.response?.data?.message || 'Could not update verification'); } }} className={`rounded-full px-3 py-1 text-xs font-bold ${item.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.isVerified ? 'Verified' : 'Not verified'}</button></td>
                        <td className="px-5 py-4"><select value={item.membership?.status || 'active'} onChange={async (event) => { try { const { data } = await updateAdminUser(item._id, { membershipStatus: event.target.value }); setUsers((current) => current.map((user) => user._id === item._id ? data : user)); } catch (e) { setError(e.response?.data?.message || 'Could not update membership'); } }} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold"><option value="active">Active</option><option value="suspended">Suspended</option><option value="revoked">Revoked</option></select></td>
                        <td className="px-5 py-4 text-slate-500">{dateLabel(item.createdAt)}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {tab === 'clinics' && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {clinics.map((clinic) => (
                    <article key={clinic._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-950">{clinic.name}</h2><p className="mt-1 text-sm text-slate-500">{clinic.city || clinic.address || 'Location unavailable'}</p></div><button type="button" aria-label={`Delete ${clinic.name}`} onClick={() => removeWithConfirm(`Delete ${clinic.name} and its appointments/reviews?`, () => deleteAdminClinic(clinic._id), () => setClinics((current) => current.filter((item) => item._id !== clinic._id)))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} /></button></div>
                      <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500"><p>Owner: <strong className="text-slate-700">{clinic.owner?.name || 'Unknown'}</strong></p><p className="mt-1">{clinic.owner?.email}</p></div>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'appointments' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">User / Pet</th><th className="px-5 py-3">Clinic</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead>
                    <tbody>{appointments.map((appointment) => (
                      <tr key={appointment._id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-bold text-slate-900">{appointment.user?.name}</p><p className="text-xs text-slate-400">{appointment.pet?.name}</p></td><td className="px-5 py-4 text-slate-600">{appointment.clinic?.name}</td><td className="px-5 py-4 text-slate-500">{dateLabel(appointment.date)}</td><td className="px-5 py-4"><select value={appointment.status} onChange={async (event) => { try { const { data } = await updateAdminAppointment(appointment._id, event.target.value); setAppointments((current) => current.map((item) => item._id === appointment._id ? data : item)); } catch (e) { setError(e.response?.data?.message || 'Could not update appointment'); } }} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold capitalize"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {tab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <article key={review._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                      <div><div className="flex items-center gap-2"><p className="font-bold text-slate-900">{review.user?.name || 'Unknown user'}</p><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{review.rating}/5</span></div><p className="mt-1 text-sm text-slate-500">{review.clinic?.name}</p><p className="mt-3 text-sm text-slate-700">{review.comment || 'No comment'}</p></div>
                      <button type="button" aria-label="Delete review" onClick={() => removeWithConfirm('Delete this review?', () => deleteAdminReview(review._id), () => setReviews((current) => current.filter((item) => item._id !== review._id)))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} /></button>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'posts' && (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <article key={post._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                      <div><div className="flex items-center gap-2"><h2 className="font-black text-slate-950">{post.title}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{post.category}</span></div><p className="mt-1 text-xs text-slate-400">by {post.author?.name || 'Unknown'} • {dateLabel(post.createdAt)}</p><p className="mt-3 line-clamp-3 text-sm text-slate-700">{post.content}</p></div>
                      <button type="button" aria-label={`Delete ${post.title}`} onClick={() => removeWithConfirm(`Delete "${post.title}" and its comments?`, () => deleteAdminPost(post._id), () => setPosts((current) => current.filter((item) => item._id !== post._id)))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} /></button>
                    </article>
                  ))}
                </div>
              )}
              {tab === 'audit' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Time</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Details</th></tr></thead>
                    <tbody>{auditLogs.map((log) => (
                      <tr key={log._id} className="border-t border-slate-100"><td className="whitespace-nowrap px-5 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td><td className="px-5 py-4"><p className="font-bold text-slate-900">{log.actorName}</p><p className="text-xs text-slate-400">{log.actorRole}</p></td><td className="px-5 py-4 font-mono text-xs text-teal-700">{log.action}</td><td className="px-5 py-4 text-slate-600">{log.targetType}</td><td className="max-w-xs truncate px-5 py-4 text-xs text-slate-500">{JSON.stringify(log.details || {})}</td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
