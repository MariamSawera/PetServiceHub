import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getAppointment } from '../services/appointmentApi';

export default function BookingConfirmationPage() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => { getAppointment(appointmentId).then(({ data }) => setAppointment(data)).catch(() => setError(true)); }, [appointmentId]);
  if (error) return <main className="min-h-[70vh] px-6 py-16 text-center text-sm font-semibold text-red-700">Booking confirmation not found.</main>;
  if (!appointment) return <main className="min-h-[70vh] px-6 py-16 text-center text-sm text-slate-500">Loading confirmation...</main>;

  return <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-16"><div className="mx-auto max-w-xl rounded-2xl border border-teal-100 bg-white p-8 text-center shadow-sm"><CheckCircle2 size={58} className="mx-auto text-teal-600" /><p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Booking confirmed</p><h1 className="mt-3 text-3xl font-black text-slate-950">We saved your appointment.</h1><div className="mt-7 space-y-3 text-left text-sm text-slate-600"><p className="flex items-center gap-3"><MapPin size={17} className="text-teal-600" />{appointment.clinic?.name}</p><p className="flex items-center gap-3"><CalendarCheck size={17} className="text-teal-600" />{new Date(appointment.date).toLocaleDateString()} · {appointment.time}</p><p className="flex items-center gap-3"><Clock size={17} className="text-teal-600" />{appointment.service} for {appointment.pet?.name}</p></div><Link to="/" className="mt-8 inline-flex rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">Return home</Link></div></main>;
}