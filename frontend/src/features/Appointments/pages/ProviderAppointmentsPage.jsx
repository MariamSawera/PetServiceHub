import { useEffect, useState } from 'react';
import { createElement } from 'react';
import { CalendarDays, Dog, HeartPulse, Scale, Syringe, X } from 'lucide-react';
import { getProviderAppointments, updateAppointmentStatus } from '../services/appointmentApi';

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const load = () => getProviderAppointments().then(({ data }) => { setAppointments(data); setState('ready'); }).catch(() => setState('error'));
  useEffect(() => { load(); }, []);

  const changeStatus = async (appointmentId, status) => {
    await updateAppointmentStatus(appointmentId, status);
    setAppointments((current) => current.map((appointment) => appointment._id === appointmentId ? { ...appointment, status } : appointment));
  };

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Provider workspace</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Appointments</h1>
        <p className="mt-3 text-slate-600">Review and update appointments for your clinics.</p>
        {state === 'loading' && <p className="mt-8 text-sm text-slate-500">Loading appointments...</p>}
        {state === 'error' && <p className="mt-8 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">Could not load appointments.</p>}
        {state === 'ready' && appointments.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-teal-200 bg-white p-12 text-center text-sm text-slate-500">No appointments yet.</p>}
        {state === 'ready' && appointments.length > 0 && (
          <div className="mt-8 space-y-4">
            {appointments.map((appointment) => (
              <article key={appointment._id} className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-slate-950">{appointment.pet?.name} · {appointment.service}</h2>
                  <p className="mt-1 text-sm text-slate-600">{appointment.clinic?.name} · {appointment.user?.name || appointment.user?.email}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} className="text-teal-700" />{new Date(appointment.date).toLocaleDateString()} · {appointment.time}</p>
                  <button type="button" onClick={() => setSelectedAppointment(appointment)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-50"><Dog size={15} /> View pet profile</button>
                </div>
                <select value={appointment.status} onChange={(event) => changeStatus(appointment._id, event.target.value)} aria-label={`Status for ${appointment.pet?.name}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedAppointment && <PetProfileDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
    </main>
  );
}

function PetProfileDialog({ appointment, onClose }) {
  const pet = appointment.pet;
  const medicalEntries = pet?.medicalInfo && typeof pet.medicalInfo === 'object'
    ? Object.entries(pet.medicalInfo).filter(([, value]) => value !== null && value !== undefined && value !== '')
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 sm:p-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="dialog" aria-modal="true" aria-labelledby="provider-pet-profile-title">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 id="provider-pet-profile-title" className="mt-1 text-2xl font-black text-slate-950">{pet?.name || 'Pet profile'}</h2>
            <p className="mt-1 capitalize text-slate-500">{pet?.species}{pet?.breed ? ` · ${pet.breed}` : ''}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close pet profile"><X size={20} /></button>
        </div>
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-teal-50 p-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-teal-700">
            {pet?.image ? <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" /> : <Dog size={32} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{pet?.name}</p>
            <p className="mt-1 text-sm text-slate-600">Appointment with {appointment.clinic?.name}</p>
            <p className="mt-1 text-xs text-slate-500">Owner: {appointment.user?.name || appointment.user?.email}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <PetInfo Icon={HeartPulse} label="Gender" value={pet?.gender || 'Unknown'} />
          <PetInfo Icon={CalendarDays} label="Date of birth" value={pet?.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Not added'} />
          <PetInfo Icon={Scale} label="Weight" value={pet?.weight ? `${pet.weight} kg` : 'Not added'} />
        </div>
        <section className="mt-7">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><HeartPulse size={18} className="text-teal-700" /> Medical information</h3>
          {medicalEntries.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{medicalEntries.map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{formatLabel(key)}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{formatValue(value)}</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No medical information has been added.</p>}
        </section>
        <section className="mt-7 border-t border-slate-100 pt-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Syringe size={18} className="text-teal-700" /> Vaccination history</h3>
          {pet?.vaccinations?.length ? <div className="mt-3 space-y-3">{pet.vaccinations.map((vaccination) => <div key={vaccination._id} className="rounded-xl border border-slate-100 p-4"><p className="font-bold text-slate-800">{vaccination.vaccineName}</p><p className="mt-1 text-sm text-slate-500">Given {new Date(vaccination.dateAdministered).toLocaleDateString()}{vaccination.nextDueDate ? ` · Due ${new Date(vaccination.nextDueDate).toLocaleDateString()}` : ''}</p>{vaccination.notes && <p className="mt-2 text-sm text-slate-600">{vaccination.notes}</p>}</div>)}</div> : <p className="mt-2 text-sm text-slate-500">No vaccinations recorded.</p>}
        </section>
      </div>
    </div>
  );
}

function PetInfo({ Icon, label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4">{createElement(Icon, { size: 18, className: 'text-teal-700' })}<p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold capitalize text-slate-800">{value}</p></div>;
}

function formatLabel(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^\w|\s\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value && typeof value === 'object') return Object.entries(value).map(([key, nestedValue]) => `${formatLabel(key)}: ${formatValue(nestedValue)}`).join('\n');
  return String(value);
}