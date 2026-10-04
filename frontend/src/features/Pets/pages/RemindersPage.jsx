import { useEffect, useState } from 'react';
import { Bell, CalendarDays, ChevronRight, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReminders } from '../services/petApi';

const STATUS_STYLES = {
  overdue: 'bg-red-50 text-red-700',
  dueToday: 'bg-orange-50 text-orange-700',
  dueSoon: 'bg-amber-50 text-amber-700',
};

const STATUS_LABELS = {
  overdue: 'Overdue',
  dueToday: 'Due today',
  dueSoon: 'Due soon',
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [windowDays, setWindowDays] = useState(30);
  const [state, setState] = useState('loading');

  useEffect(() => {
    getReminders()
      .then(({ data }) => {
        setReminders(data.reminders || data);
        setWindowDays(data.windowDays || 30);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-teal-700"><Bell size={17} /> Care reminders</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Upcoming vaccinations</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Stay ahead of vaccinations due within the next {windowDays} days.</p>
          </div>
          <Link to="/pets" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900">Manage pets <ChevronRight size={16} /></Link>
        </div>

        {state === 'loading' && <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading reminders...</div>}
        {state === 'error' && <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">Could not load your vaccination reminders.</div>}
        {state === 'ready' && reminders.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-teal-200 bg-white p-12 text-center"><PawPrint className="mx-auto text-teal-600" size={38} /><h2 className="mt-4 text-xl font-bold text-slate-950">You are all caught up</h2><p className="mt-2 text-sm text-slate-500">No vaccinations are due within the reminder window.</p></div>}
        {state === 'ready' && reminders.length > 0 && <div className="mt-8 grid gap-4 md:grid-cols-2">{reminders.map((reminder) => <article key={`${reminder.pet._id}-${reminder.vaccinationId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{reminder.pet.name}</p><h2 className="mt-2 text-xl font-bold text-slate-950">{reminder.vaccineName}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[reminder.status] || 'bg-slate-100 text-slate-600'}`}>{STATUS_LABELS[reminder.status] || reminder.status}</span></div><p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} className="text-teal-600" /> Due {new Date(reminder.nextDueDate).toLocaleDateString()}</p><p className="mt-2 text-xs text-slate-500">{reminder.daysUntilDue < 0 ? `${Math.abs(reminder.daysUntilDue)} days overdue` : reminder.daysUntilDue === 0 ? 'Due today' : `Due in ${reminder.daysUntilDue} days`}</p><Link to={`/pets/${reminder.pet._id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900">View pet record <ChevronRight size={15} /></Link></article>)}</div>}
      </div>
    </main>
  );
}
