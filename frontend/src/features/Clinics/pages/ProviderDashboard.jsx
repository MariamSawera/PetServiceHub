import { createElement, useEffect, useState } from 'react';
import { ArrowRight, Building2, CalendarDays, CheckCircle2, ClipboardPlus, Clock3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Auth/context/useAuth';
import { getProviderAppointments } from '../../Appointments/services/appointmentApi';
import { getOwnedClinics } from '../services/clinicApi';
import dashboardImage from '../../../assets/vets-dashboard-female.png';

const formatAppointmentDate = (appointment) => `${new Date(appointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${appointment.time}`;

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    Promise.all([getOwnedClinics(), getProviderAppointments()])
      .then(([clinicResponse, appointmentResponse]) => {
        setClinics(clinicResponse.data);
        setAppointments(appointmentResponse.data);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status !== 'cancelled' && new Date(appointment.date) >= new Date())
    .sort((first, second) => new Date(first.date) - new Date(second.date));
  const nextAppointment = upcomingAppointments[0];
  const activeAppointments = appointments.filter((appointment) => ['pending', 'confirmed'].includes(appointment.status)).length;
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed').length;
  const uniqueClients = new Set(appointments.map((appointment) => appointment.user?._id || appointment.user?.email).filter(Boolean)).size;
  const providerName = user?.name || 'Provider';

  return (
    <main className="min-h-[70vh] overflow-hidden bg-[var(--theme-bg)] px-6 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-[1400px]">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-[#effcfb] via-white to-[#e7f8f7] px-7 py-8 shadow-sm md:px-12 md:py-10 lg:min-h-[500px] lg:px-14">
          <div className="relative z-10 max-w-2xl lg:max-w-[58%]">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-sm font-bold text-teal-700"><Building2 size={17} /> Provider Dashboard</div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem]">Welcome back, <span className="text-slate-900">{providerName}!</span><br /><span className="text-teal-600">Your patients are in good hands.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Manage appointments, stay connected with clients, and provide the best care, all in one place.</p>
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <StatCard icon={CalendarDays} value={activeAppointments} label="Active appointments" color="teal" />
              <StatCard icon={UsersRound} value={uniqueClients} label="Active clients" color="blue" />
              <StatCard icon={CheckCircle2} value={completedAppointments} label="Completed visits" color="amber" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/provider/appointments" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-700"><CalendarDays size={18} /> View appointments <ArrowRight size={17} /></Link>
              <Link to="/provider/clinics" className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-500 bg-white/60 px-5 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50"><Building2 size={18} /> Manage clinic profile <ArrowRight size={17} /></Link>
            </div>
          </div>
          {nextAppointment && <div className="absolute right-8 top-8 z-20 hidden w-72 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-teal-900/10 backdrop-blur lg:block"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600"><CalendarDays size={22} /></span><div className="min-w-0"><p className="text-sm font-bold text-teal-600">Next appointment</p><p className="mt-1 truncate text-base font-black text-slate-800">{nextAppointment.pet?.name || 'Patient visit'}{nextAppointment.pet?.species ? ` (${nextAppointment.pet.species})` : ''}</p><p className="mt-1 text-xs font-semibold text-slate-500">{formatAppointmentDate(nextAppointment)} · {nextAppointment.service}</p></div><ArrowRight size={18} className="mt-1 shrink-0 text-teal-500" /></div></div>}
          <img src={dashboardImage} alt="Veterinarian caring for a dog and cat" className="pointer-events-none absolute bottom-[6%] right-[-3%] z-0 hidden h-[108%] w-[55%] object-contain object-bottom lg:block" />
          <div className="absolute -right-20 -top-20 -z-0 h-64 w-64 rounded-full bg-teal-100/60 blur-3xl" />
        </section>

        {state === 'error' && <p className="mt-6 rounded-xl bg-red-50 p-5 text-sm font-semibold text-red-700">Could not load your dashboard data.</p>}
        {state === 'loading' && <p className="mt-6 text-sm text-slate-500">Loading your dashboard...</p>}
        {state === 'ready' && <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Next appointment</p><h2 className="mt-2 text-2xl font-black text-slate-950">{nextAppointment ? nextAppointment.pet?.name || 'Patient visit' : 'Your schedule is clear'}</h2></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-700">{nextAppointment?.status || 'Available'}</span></div>
            {nextAppointment ? <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-5 text-sm text-slate-600"><span className="flex items-center gap-2 font-semibold"><CalendarDays size={18} className="text-teal-600" />{formatAppointmentDate(nextAppointment)}</span><span className="flex items-center gap-2"><Clock3 size={18} className="text-teal-600" />{nextAppointment.service}</span></div> : <p className="mt-5 text-sm text-slate-500">New bookings will appear here as soon as pet parents schedule a visit.</p>}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><ClipboardPlus size={22} /></div><h2 className="mt-5 text-xl font-black text-slate-950">Your clinics</h2><p className="mt-2 text-sm leading-6 text-slate-600">{clinics.length ? `${clinics.length} clinic${clinics.length === 1 ? '' : 's'} connected to your provider account.` : 'Set up your first clinic to start accepting appointments.'}</p><Link to="/provider/clinics" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800">Open clinics <ArrowRight size={16} /></Link></div>
        </section>}
      </div>
    </main>
  );
}

function StatCard({ icon: StatIcon, value, label, color }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-sky-50 text-sky-500',
    amber: 'bg-amber-50 text-amber-500',
  };
  return <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[color]}`}>{createElement(StatIcon, { size: 20 })}</div><p className="mt-4 text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>;
}
