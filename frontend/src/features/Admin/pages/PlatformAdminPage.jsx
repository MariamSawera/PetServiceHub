import { useEffect, useState } from 'react';
import { Building2, Globe2, Plus, ShieldCheck, Trash2, UsersRound, ClipboardList, Stethoscope, MessageSquareText } from 'lucide-react';
import {
  createPlatformTenant,
  deletePlatformClinic,
  deletePlatformPost,
  deletePlatformTenant,
  getPlatformAuditLogs,
  getPlatformClinics,
  getPlatformMemberships,
  getPlatformOverview,
  getPlatformPosts,
  getPlatformTenants,
  getPlatformUsers,
  updatePlatformTenant,
  updatePlatformUser,
  updatePlatformAccountStatus,
  updatePlatformMembershipStatus,
} from '../services/platformAdminApi';

export default function PlatformAdminPage() {
  const [tab, setTab] = useState('tenants');
  const [overview, setOverview] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0d9488');
  const [secondaryColor, setSecondaryColor] = useState('#7c3aed');
  const [supportEmail, setSupportEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [clinics, setClinics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [editingTenant, setEditingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setOverview((await getPlatformOverview()).data);
        setTenants((await getPlatformTenants()).data);
        setUsers((await getPlatformUsers()).data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Could not load platform admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (tab === 'clinics') getPlatformClinics().then(({ data }) => setClinics(data)).catch((e) => setError(e.response?.data?.message || 'Could not load clinics'));
    if (tab === 'posts') getPlatformPosts().then(({ data }) => setPosts(data)).catch((e) => setError(e.response?.data?.message || 'Could not load posts'));
    if (tab === 'audit') getPlatformAuditLogs().then(({ data }) => setAuditLogs(data)).catch((e) => setError(e.response?.data?.message || 'Could not load audit logs'));
    if (tab === 'memberships') getPlatformMemberships().then(({ data }) => setMemberships(data)).catch((e) => setError(e.response?.data?.message || 'Could not load memberships'));
  }, [tab]);

  const submitTenant = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await createPlatformTenant({
        name,
        slug,
        subdomain,
        customDomain,
        branding: { logoUrl, primaryColor, secondaryColor, supportEmail },
      });
      setTenants((current) => [data, ...current]);
      setOverview((current) => current ? {
        ...current,
        stats: { ...current.stats, tenants: current.stats.tenants + 1, activeTenants: current.stats.activeTenants + 1 },
      } : current);
      setName('');
      setSlug('');
      setSubdomain('');
      setCustomDomain('');
      setLogoUrl('');
      setSupportEmail('');
    } catch (createError) {
      setError(createError.response?.data?.message || 'Could not create tenant');
    }
  };

  const saveTenantChanges = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = {
        name: editingTenant.name,
        subdomain: editingTenant.subdomain || '',
        customDomain: editingTenant.customDomain || '',
        branding: editingTenant.branding || {},
      };
      const { data } = await updatePlatformTenant(editingTenant._id, payload);
      setTenants((current) => current.map((tenant) => tenant._id === data._id ? data : tenant));
      setEditingTenant(null);
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Could not update tenant');
    }
  };

  const stats = overview?.stats || {};
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Platform control</p><h1 className="mt-1 text-3xl font-black text-slate-950">Platform Administration</h1></div>
          <a href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-teal-200">Open tenant admin</a>
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
        {loading ? <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Loading...</div> : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Tenants', stats.tenants, Building2],
                ['Active tenants', stats.activeTenants, Globe2],
                ['Platform users', stats.users, UsersRound],
                ['Tenant admins', stats.admins, ShieldCheck],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value || 0}</p></div><Icon className="text-violet-600" size={22} /></div></div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setTab('tenants')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'tenants' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Tenants</button>
              <button type="button" onClick={() => setTab('users')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'users' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Users</button>
              <button type="button" onClick={() => setTab('clinics')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'clinics' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Clinics</button>
              <button type="button" onClick={() => setTab('posts')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'posts' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Community</button>
              <button type="button" onClick={() => setTab('audit')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'audit' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Audit logs</button>
              <button type="button" onClick={() => setTab('memberships')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === 'memberships' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>Memberships</button>
            </div>

            {tab === 'tenants' && (
              <div className="mt-4 grid gap-5 lg:grid-cols-[320px_1fr]">
                <form onSubmit={submitTenant} className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="flex items-center gap-2 font-black text-slate-950"><Plus size={18} />Create tenant</h2>
                  <label className="mt-5 block text-sm font-bold text-slate-700">Name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="PawCare East" /></label>
                  <label className="mt-4 block text-sm font-bold text-slate-700">Slug<input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} required pattern="[a-z0-9-]+" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="pawcare-east" /></label>
                  <label className="mt-4 block text-sm font-bold text-slate-700">Subdomain<input value={subdomain} onChange={(event) => setSubdomain(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} pattern="[a-z0-9-]*" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="east" /></label>
                  <label className="mt-4 block text-sm font-bold text-slate-700">Custom domain<input value={customDomain} onChange={(event) => setCustomDomain(event.target.value.toLowerCase())} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="pawcare-east.com" /></label>
                  <label className="mt-4 block text-sm font-bold text-slate-700">Logo URL<input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} type="url" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="https://..." /></label>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-sm font-bold text-slate-700">Primary<input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} type="color" className="mt-2 h-11 w-full rounded-lg border border-slate-200 p-1" /></label>
                    <label className="text-sm font-bold text-slate-700">Secondary<input value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} type="color" className="mt-2 h-11 w-full rounded-lg border border-slate-200 p-1" /></label>
                  </div>
                  <label className="mt-4 block text-sm font-bold text-slate-700">Support email<input value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" placeholder="support@example.com" /></label>
                  <button type="submit" className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Create tenant</button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Tenant</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Actions</th></tr></thead>
                    <tbody>{tenants.map((tenant) => (
                      <tr key={tenant._id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-bold text-slate-900">{tenant.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{tenant.slug}</td>
                        <td className="px-5 py-4"><button type="button" onClick={async () => { try { const { data } = await updatePlatformTenant(tenant._id, { active: !tenant.active }); setTenants((current) => current.map((item) => item._id === tenant._id ? data : item)); } catch (e) { setError(e.response?.data?.message || 'Could not update tenant'); } }} className={`rounded-full px-3 py-1 text-xs font-bold ${tenant.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{tenant.active ? 'Active' : 'Inactive'}</button></td>
                        <td className="px-5 py-4 text-slate-500">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => setEditingTenant({ ...tenant, branding: tenant.branding || {} })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">Edit</button>{tenant.slug !== 'default' && <button type="button" aria-label={`Delete ${tenant.name}`} onClick={async () => { if (!window.confirm(`Permanently delete ${tenant.name} and all tenant-owned data? This cannot be undone.`)) return; try { await deletePlatformTenant(tenant._id); setTenants((current) => current.filter((item) => item._id !== tenant._id)); } catch (e) { setError(e.response?.data?.message || 'Could not delete tenant'); } }} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={15} /></button>}</div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Tenant</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody>{users.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="text-xs text-slate-400">{item.email}</p></td>
                      <td className="px-5 py-4"><select value={item.tenantId?._id || ''} onChange={async (event) => { try { const { data } = await updatePlatformUser(item._id, { tenantId: event.target.value }); setUsers((current) => current.map((user) => user._id === item._id ? data : user)); } catch (e) { setError(e.response?.data?.message || 'Could not reassign user'); } }} className="max-w-48 rounded-lg border border-slate-200 px-2 py-2">{tenants.map((tenant) => <option key={tenant._id} value={tenant._id}>{tenant.name}</option>)}</select></td>
                      <td className="px-5 py-4"><select value={item.role} onChange={async (event) => { try { const { data } = await updatePlatformUser(item._id, { role: event.target.value }); setUsers((current) => current.map((user) => user._id === item._id ? data : user)); } catch (e) { setError(e.response?.data?.message || 'Could not update role'); } }} className="rounded-lg border border-slate-200 px-2 py-2"><option value="user">User</option><option value="provider">Provider</option><option value="admin">Tenant admin</option><option value="platform_admin">Platform admin</option></select></td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.isVerified ? 'Verified' : 'Not verified'}</span><button type="button" onClick={async () => { try { const { data } = await updatePlatformAccountStatus(item._id, !item.suspended); setUsers((current) => current.map((user) => user._id === item._id ? { ...user, suspended: data.suspended } : user)); } catch (e) { setError(e.response?.data?.message || 'Could not update account'); } }} className={`rounded-full px-3 py-1 text-xs font-bold ${item.suspended ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{item.suspended ? 'Account suspended' : 'Suspend account'}</button></div></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              </div>
            )}

            {tab === 'clinics' && (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {clinics.map((clinic) => (
                  <article key={clinic._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="flex items-center gap-2"><Stethoscope size={17} className="text-violet-600" /><h2 className="font-black text-slate-950">{clinic.name}</h2></div><p className="mt-2 text-sm text-slate-500">{clinic.tenantId?.name || 'Unknown tenant'}</p><p className="mt-1 text-xs text-slate-400">{clinic.owner?.name} • {clinic.owner?.email}</p></div>
                      <button type="button" aria-label={`Delete ${clinic.name}`} onClick={async () => { if (!window.confirm(`Delete ${clinic.name} and its appointments/reviews?`)) return; try { await deletePlatformClinic(clinic._id); setClinics((current) => current.filter((item) => item._id !== clinic._id)); } catch (e) { setError(e.response?.data?.message || 'Could not delete clinic'); } }} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={17} /></button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {tab === 'posts' && (
              <div className="mt-4 space-y-3">
                {posts.map((post) => (
                  <article key={post._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <div><div className="flex items-center gap-2"><MessageSquareText size={17} className="text-violet-600" /><h2 className="font-black text-slate-950">{post.title}</h2></div><p className="mt-1 text-xs text-slate-400">{post.tenantId?.name} • {post.author?.name}</p><p className="mt-3 line-clamp-3 text-sm text-slate-700">{post.content}</p></div>
                    <button type="button" aria-label={`Delete ${post.title}`} onClick={async () => { if (!window.confirm(`Delete "${post.title}" and its comments?`)) return; try { await deletePlatformPost(post._id); setPosts((current) => current.filter((item) => item._id !== post._id)); } catch (e) { setError(e.response?.data?.message || 'Could not delete post'); } }} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={17} /></button>
                  </article>
                ))}
              </div>
            )}

            {tab === 'audit' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Time</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Details</th></tr></thead>
                  <tbody>{auditLogs.map((log) => (
                    <tr key={log._id} className="border-t border-slate-100"><td className="whitespace-nowrap px-5 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td><td className="px-5 py-4"><p className="font-bold text-slate-900">{log.actorName}</p><p className="text-xs text-slate-400">{log.actorRole}</p></td><td className="px-5 py-4 font-mono text-xs text-violet-700">{log.action}</td><td className="px-5 py-4 text-slate-600">{log.targetType}</td><td className="max-w-xs truncate px-5 py-4 text-xs text-slate-500">{JSON.stringify(log.details || {})}</td></tr>
                  ))}</tbody>
                </table></div>
              </div>
            )}
            {tab === 'memberships' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Tenant</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Membership</th><th className="px-5 py-3">Account</th></tr></thead>
                  <tbody>{memberships.map((membership) => (
                    <tr key={membership._id} className="border-t border-slate-100">
                      <td className="px-5 py-4"><p className="font-bold text-slate-900">{membership.userId?.name}</p><p className="text-xs text-slate-400">{membership.userId?.email}</p></td>
                      <td className="px-5 py-4 text-slate-700">{membership.tenantId?.name}</td>
                      <td className="px-5 py-4 text-slate-700">{membership.role}</td>
                      <td className="px-5 py-4"><select value={membership.status} onChange={async (event) => { try { const { data } = await updatePlatformMembershipStatus(membership._id, event.target.value); setMemberships((current) => current.map((item) => item._id === membership._id ? data : item)); } catch (e) { setError(e.response?.data?.message || 'Could not update membership'); } }} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold"><option value="active">Active</option><option value="suspended">Suspended</option><option value="revoked">Revoked</option></select></td>
                      <td className="px-5 py-4"><button type="button" onClick={async () => { try { await updatePlatformAccountStatus(membership.userId._id, !membership.userId.suspended); setMemberships((current) => current.map((item) => item.userId?._id === membership.userId._id ? { ...item, userId: { ...item.userId, suspended: !membership.userId.suspended } } : item)); } catch (e) { setError(e.response?.data?.message || 'Could not update account'); } }} className={`rounded-full px-3 py-1 text-xs font-bold ${membership.userId?.suspended ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{membership.userId?.suspended ? 'Suspended' : 'Active'}</button></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              </div>
            )}
          </>
        )}
        {editingTenant && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-5" onMouseDown={(event) => event.target === event.currentTarget && setEditingTenant(null)}>
            <form onSubmit={saveTenantChanges} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-black text-slate-950">Edit tenant</h2>
              <label className="mt-5 block text-sm font-bold text-slate-700">Name<input value={editingTenant.name} onChange={(event) => setEditingTenant((current) => ({ ...current, name: event.target.value }))} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" /></label>
              <label className="mt-4 block text-sm font-bold text-slate-700">Subdomain<input value={editingTenant.subdomain || ''} onChange={(event) => setEditingTenant((current) => ({ ...current, subdomain: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" /></label>
              <label className="mt-4 block text-sm font-bold text-slate-700">Custom domain<input value={editingTenant.customDomain || ''} onChange={(event) => setEditingTenant((current) => ({ ...current, customDomain: event.target.value.toLowerCase() }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" /></label>
              <label className="mt-4 block text-sm font-bold text-slate-700">Logo URL<input value={editingTenant.branding?.logoUrl || ''} onChange={(event) => setEditingTenant((current) => ({ ...current, branding: { ...current.branding, logoUrl: event.target.value } }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" /></label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm font-bold text-slate-700">Primary<input value={editingTenant.branding?.primaryColor || '#0d9488'} onChange={(event) => setEditingTenant((current) => ({ ...current, branding: { ...current.branding, primaryColor: event.target.value } }))} type="color" className="mt-2 h-11 w-full rounded-lg border p-1" /></label>
                <label className="text-sm font-bold text-slate-700">Secondary<input value={editingTenant.branding?.secondaryColor || '#7c3aed'} onChange={(event) => setEditingTenant((current) => ({ ...current, branding: { ...current.branding, secondaryColor: event.target.value } }))} type="color" className="mt-2 h-11 w-full rounded-lg border p-1" /></label>
              </div>
              <label className="mt-4 block text-sm font-bold text-slate-700">Support email<input value={editingTenant.branding?.supportEmail || ''} onChange={(event) => setEditingTenant((current) => ({ ...current, branding: { ...current.branding, supportEmail: event.target.value } }))} type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3" /></label>
              <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditingTenant(null)} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">Save changes</button></div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
