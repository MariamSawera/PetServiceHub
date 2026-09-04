import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { getProviderAppointments, updateAppointmentStatus } from '../services/appointmentApi';

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');

  const load = () => getProviderAppointments().then(({ data }) => { setAppointments(data); setState('ready'); }).catch(() => setState('error'));
  useEffect(() => { load(); }, []);

  const changeStatus = async (appointmentId, status) => {
    await updateAppointmentStatus(appointmentId, status);
    setAppointments((current) => current.map((appointment) => appointment._id === appointmentId ? { ...appointment, status } : appointment));
  };

  return <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16"><div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Provider workspace</p><h1 className="mt-3 text-4xl font-black text-slate-950">Appointments</h1><p className="mt-3 text-slate-600">Review and update appointments for your clinics.</p>{state === 'loading' && <p className="mt-8 text-sm text-slate-500">Loading appointments...</p>}{state === 'error' && <p className="mt-8 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">Could not load appointments.</p>}{state === 'ready' && appointments.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-teal-200 bg-white p-12 text-center text-sm text-slate-500">No appointments yet.</p>}{state === 'ready' && appointments.length > 0 && <div className="mt-8 space-y-4">{appointments.map((appointment) => <article key={appointment._id} className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"><div><h2 className="font-bold text-slate-950">{appointment.pet?.name} · {appointment.service}</h2><p className="mt-1 text-sm text-slate-600">{appointment.clinic?.name} · {appointment.user?.name || appointment.user?.email}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} className="text-teal-700" />{new Date(appointment.date).toLocaleDateString()} · {appointment.time}</p></div><select value={appointment.status} onChange={(event) => changeStatus(appointment._id, event.target.value)} aria-label={`Status for ${appointment.pet?.name}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></article>)}</div>}</div></main>;
}