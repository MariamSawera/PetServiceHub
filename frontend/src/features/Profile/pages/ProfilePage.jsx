import { useEffect, useState } from 'react';
import { Check, ImagePlus, UserRound } from 'lucide-react';
import { useAuth } from '../../Auth/context/useAuth';
import { getProfile, saveProfile } from '../services/profileApi';
import { uploadImage } from '../../../lib/uploadApi';

const EMPTY_PROFILE = {
  phone: '',
  avatar: '',
  bio: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
};

const PROFILE_FIELDS = [
  ['phone', 'Phone number', 'tel'],
  ['address', 'Address', 'text'],
  ['city', 'City', 'text'],
  ['state', 'State', 'text'],
  ['postalCode', 'Postal code', 'text'],
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;

    getProfile()
      .then(({ data }) => {
        if (active) setForm({ ...EMPTY_PROFILE, ...data });
      })
      .catch((error) => {
        if (active && error.response?.status !== 404) {
          setStatus({ type: 'error', message: 'Could not load your profile.' });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Choose an image smaller than 5 MB.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });
    try {
      const { data } = await uploadImage(file);
      setForm((current) => ({ ...current, avatar: data.imageUrl }));
    } catch {
      setStatus({ type: 'error', message: 'Avatar upload failed. Please try again.' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await saveProfile(form);
      setForm({ ...EMPTY_PROFILE, ...data });
      setStatus({ type: 'success', message: 'Profile saved successfully.' });
    } catch {
      setStatus({ type: 'error', message: 'Could not save your profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[var(--theme-bg)] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Your account</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Profile settings</h1>
          <p className="mt-3 max-w-xl text-slate-500">Keep your contact details ready for appointments and pet care.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-teal-50 text-3xl font-bold text-brand-600">
              {form.avatar ? <img src={form.avatar} alt="Profile" className="h-full w-full object-cover" /> : <UserRound size={34} />}
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{user?.name || 'Pet parent'}</h2>
            <p className="mt-1 break-words text-sm text-slate-500">{user?.email}</p>
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <ImagePlus size={15} />
              {uploading ? 'Uploading...' : 'Change photo'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} className="sr-only" />
            </label>
            <span className="mt-5 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-brand-700">{user?.role || 'user'}</span>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-bold text-slate-900">Personal details</h2>
              <p className="mt-1 text-sm text-slate-500">Your name and email come from your account and cannot be changed here.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {PROFILE_FIELDS.map(([field, label, type]) => (
                <label key={field} className={field === 'address' || field === 'avatar' ? 'sm:col-span-2' : ''}>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
                  <input type={type} value={form[field]} onChange={handleChange(field)} maxLength={field === 'bio' ? 500 : undefined} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-teal-100" />
                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
                <textarea value={form.bio} onChange={handleChange('bio')} maxLength={500} rows={4} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-teal-100" />
              </label>
            </div>

            {status.message && <p className={`mt-5 text-sm font-semibold ${status.type === 'error' ? 'text-red-600' : 'text-brand-700'}`}>{status.message}</p>}
            <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Check size={17} />
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
