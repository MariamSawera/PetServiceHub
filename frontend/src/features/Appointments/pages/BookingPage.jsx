import { useEffect, useState } from 'react';
import { CalendarDays, Check, Clock, PawPrint } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClinic } from '../../Clinics/services/clinicApi';
import { getPets } from '../../Pets/services/petApi';
import { createAppointment } from '../services/appointmentApi';

export default function BookingPage() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({ pet: '', service: '', date: '', time: '', notes: '' });
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getClinic(clinicId), getPets()])
      .then(([clinicResponse, petsResponse]) => {
        const services = clinicResponse.data.services?.length ? clinicResponse.data.services : clinicResponse.data.specialties || [];
        setClinic(clinicResponse.data);
        setPets(petsResponse.data);
        setForm((current) => ({ ...current, service: services[0] || '' }));
        setState('ready');
      })
      .catch(() => { setError('Could not load booking details.'); setState('error'); });
  }, [clinicId]);

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await createAppointment({ ...form, clinic: clinicId });
      navigate(`/appointments/${data._id}/confirmation`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create appointment.');
    }
  };

  if (state === 'loading') return <main className="min-h-[70vh] px-6 py-16 text-center text-sm text-slate-500">Loading booking details...</main>;
  if (state === 'error' || !clinic) return <main className="min-h-[70vh] px-6 py-16 text-center text-sm font-semibold text-red-700">Could not load this clinic.</main>;

  const serviceOptions = clinic.services?.length ? clinic.services : clinic.specialties || [];
  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Book an appointment</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{clinic.name}</h1>
        <p className="mt-2 text-slate-500">Choose a pet, service, and time that works for you.</p>
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Select pet<select required value={form.pet} onChange={handleChange('pet')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-teal-500"><option value="">Choose your pet</option>{pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Select service<select required value={form.service} onChange={handleChange('service')} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-teal-500"><option value="">Choose a service</option>{serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><CalendarDays size={16} className="text-teal-700" />Select date</span><input required type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={handleChange('date')} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500" /></label>
            <label className="text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><Clock size={16} className="text-teal-700" />Select time</span><input required type="time" value={form.time} onChange={handleChange('time')} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500" /></label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2"><span className="flex items-center gap-2"><PawPrint size={16} className="text-teal-700" />Notes for the clinic</span><textarea value={form.notes} onChange={handleChange('notes')} rows="3" placeholder="Anything the vet should know?" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500" /></label>
          </div>
          {pets.length === 0 && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">Add a pet before booking an appointment.</p>}
          {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={pets.length === 0} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"><Check size={17} />Confirm booking</button>
        </form>
      </div>
    </main>
  );
}