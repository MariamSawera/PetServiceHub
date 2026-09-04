import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import ClinicLocationPicker from '../components/ClinicLocationPicker';
import { createClinic, deleteClinic, getOwnedClinics, updateClinic } from '../services/clinicApi';

const EMPTY_FORM = { name: '', description: '', city: '', address: '', phone: '', specialty: '', longitude: '', latitude: '' };

const toPayload = (form) => ({
  name: form.name,
  description: form.description,
  city: form.city,
  address: form.address,
  phone: form.phone,
  specialties: form.specialty ? [form.specialty] : [],
  location: { type: 'Point', coordinates: [Number(form.longitude), Number(form.latitude)] },
});

export default function ProviderDashboard() {
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');

  const loadClinics = () => getOwnedClinics().then(({ data }) => { setClinics(data); setState('ready'); }).catch(() => setState('error'));

  useEffect(() => { loadClinics(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.latitude || !form.longitude) {
      setMessage('Pick the clinic location on the map before saving.');
      return;
    }
    try {
      if (editingId) await updateClinic(editingId, toPayload(form));
      else await createClinic(toPayload(form));
      setForm(EMPTY_FORM);
      setEditingId(null);
      setMessage('Clinic saved successfully.');
      await loadClinics();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save clinic.');
    }
  };

  const handleEdit = (clinic) => {
    setEditingId(clinic._id);
    setForm({ ...EMPTY_FORM, ...clinic, specialty: clinic.specialties?.[0] || '', longitude: clinic.location?.coordinates?.[0] ?? '', latitude: clinic.location?.coordinates?.[1] ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (clinicId) => {
    if (!window.confirm('Delete this clinic?')) return;
    try { await deleteClinic(clinicId); setClinics((current) => current.filter((clinic) => clinic._id !== clinicId)); }
    catch { setMessage('Could not delete clinic.'); }
  };

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Provider workspace</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Your clinics</h1>
        <p className="mt-3 text-slate-600">Create and manage the clinics your provider account owns.</p>
        <a href="/provider/appointments" className="mt-4 inline-flex rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50">View appointments</a>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3"><Building2 className="text-teal-700" /><h2 className="text-xl font-bold text-slate-950">{editingId ? 'Edit clinic' : 'Create clinic'}</h2></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[['name', 'Clinic name', true], ['city', 'City', true], ['address', 'Address', false], ['phone', 'Phone', false], ['specialty', 'Primary specialty', false]].map(([field, label, required]) => <label key={field} className="text-sm font-semibold text-slate-700">{label}<input required={required} type="text" value={form[field]} onChange={handleChange(field)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>)}
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">Description<textarea value={form.description} onChange={handleChange('description')} rows="3" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>
          </div>
          <div className="mt-7"><ClinicLocationPicker latitude={form.latitude} longitude={form.longitude} onChange={({ latitude, longitude }) => setForm((current) => ({ ...current, latitude, longitude }))} /></div>
          <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-bold text-slate-700">Advanced location</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Latitude<input type="number" step="any" value={form.latitude} onChange={handleChange('latitude')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-teal-500" /></label><label className="text-sm font-semibold text-slate-700">Longitude<input type="number" step="any" value={form.longitude} onChange={handleChange('longitude')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-teal-500" /></label></div></details>
          {message && <p className="mt-4 text-sm font-semibold text-teal-700">{message}</p>}
          <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"><Plus size={17} />{editingId ? 'Save changes' : 'Create clinic'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button>}</div>
        </form>

        {state === 'error' && <p className="mt-8 rounded-xl bg-red-50 p-5 text-sm font-semibold text-red-700">Could not load your clinics.</p>}
        {state === 'ready' && <div className="mt-8 grid gap-4 md:grid-cols-2">{clinics.map((clinic) => <article key={clinic._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-bold text-slate-950">{clinic.name}</h2><p className="mt-1 text-sm text-slate-500">{clinic.city}</p><p className="mt-2 text-xs text-teal-700">Owner: your provider account</p></div><div className="flex gap-2"><button type="button" onClick={() => handleEdit(clinic)} aria-label={`Edit ${clinic.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700"><Pencil size={17} /></button><button type="button" onClick={() => handleDelete(clinic._id)} aria-label={`Delete ${clinic.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div></article>)}</div>}
      </div>
    </main>
  );
}