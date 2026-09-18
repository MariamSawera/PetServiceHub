import { createElement, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Dog, HeartPulse, Pencil, Plus, Scale, Trash2, Syringe } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import VaccinationForm from '../components/VaccinationForm';
import { createVaccination, deleteVaccination, getPet, updateVaccination } from '../services/petApi';

export default function PetDetailsPage() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [state, setState] = useState('loading');
  const [editingVaccination, setEditingVaccination] = useState(null);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [savingVaccination, setSavingVaccination] = useState(false);
  const [vaccinationError, setVaccinationError] = useState('');

  useEffect(() => {
    getPet(petId)
      .then(({ data }) => {
        setPet(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [petId]);

  const handleVaccinationSubmit = async (payload) => {
    setSavingVaccination(true);
    setVaccinationError('');
    try {
      const response = editingVaccination
        ? await updateVaccination(petId, editingVaccination._id, payload)
        : await createVaccination(petId, payload);
      setPet((current) => ({
        ...current,
        vaccinations: editingVaccination
          ? current.vaccinations.map((item) => item._id === response.data._id ? response.data : item)
          : [response.data, ...current.vaccinations],
      }));
      setEditingVaccination(null);
      setShowVaccinationForm(false);
    } catch {
      setVaccinationError('Could not save this vaccination. Please check the details and try again.');
    } finally {
      setSavingVaccination(false);
    }
  };

  const handleVaccinationDelete = async (vaccination) => {
    if (!window.confirm(`Remove the ${vaccination.vaccineName} vaccination?`)) return;
    try {
      await deleteVaccination(petId, vaccination._id);
      setPet((current) => ({ ...current, vaccinations: current.vaccinations.filter((item) => item._id !== vaccination._id) }));
    } catch {
      setVaccinationError('Could not delete this vaccination. Please try again.');
    }
  };

  if (state === 'loading') return <main className="min-h-[60vh] bg-[var(--theme-bg)] px-6 py-12 text-center text-sm text-slate-500 md:px-12">Loading pet details...</main>;

  if (state === 'error' || !pet) {
    return <main className="min-h-[60vh] bg-[var(--theme-bg)] px-6 py-12 text-center"><h1 className="text-2xl font-bold text-slate-900">Pet not found</h1><Link to="/pets" className="mt-4 inline-flex text-sm font-semibold text-brand-600 hover:underline">Back to my pets</Link></main>;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[var(--theme-bg)] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/pets" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"><ArrowLeft size={16} /> Back to my pets</Link>
        <div className="mt-7 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-teal-50 shadow-sm">
            {pet.image ? <img src={pet.image} alt={pet.name} className="h-full min-h-[280px] w-full object-cover" /> : <Dog size={88} className="text-brand-600" />}
          </div>
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Pet details</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">{pet.name}</h1><p className="mt-1 text-slate-500 capitalize">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p></div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold capitalize text-brand-700">{pet.gender}</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <InfoItem Icon={CalendarDays} label="Date of birth" value={pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Not added'} />
              <InfoItem Icon={Scale} label="Weight" value={pet.weight ? `${pet.weight} kg` : 'Not added'} />
              <InfoItem Icon={HeartPulse} label="Vaccinations" value={`${pet.vaccinations?.length || 0} recorded`} />
            </div>
            <div className="mt-8"><h2 className="text-lg font-bold text-slate-900">Medical information</h2>{pet.medicalInfo && Object.keys(pet.medicalInfo).length ? <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">{JSON.stringify(pet.medicalInfo, null, 2)}</pre> : <p className="mt-2 text-sm text-slate-500">No medical information has been added yet.</p>}</div>
            <section className="mt-8 border-t border-slate-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Syringe size={19} className="text-brand-600" /> Vaccination history</h2><p className="mt-1 text-sm text-slate-500">Track completed vaccines and upcoming due dates.</p></div>
                {!showVaccinationForm && !editingVaccination && <button type="button" onClick={() => setShowVaccinationForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700"><Plus size={16} /> Add vaccination</button>}
              </div>
              {vaccinationError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{vaccinationError}</p>}
              <ReminderLegend />
              {(showVaccinationForm || editingVaccination) && <VaccinationForm vaccination={editingVaccination} onSubmit={handleVaccinationSubmit} onCancel={() => { setShowVaccinationForm(false); setEditingVaccination(null); }} saving={savingVaccination} />}
              {pet.vaccinations?.length ? <div className="mt-4 space-y-3">{[...pet.vaccinations].sort((first, second) => new Date(second.dateAdministered) - new Date(first.dateAdministered)).map((vaccination) => <article key={vaccination._id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-800">{vaccination.vaccineName}</h3><ReminderStatus nextDueDate={vaccination.nextDueDate} /></div><p className="mt-1 text-sm text-slate-500">Given {formatDate(vaccination.dateAdministered)}{vaccination.nextDueDate ? ` · Due ${formatDate(vaccination.nextDueDate)}` : ''}</p>{vaccination.veterinarian && <p className="mt-1 text-sm text-slate-500">{vaccination.veterinarian}</p>}{vaccination.notes && <p className="mt-2 text-sm text-slate-600">{vaccination.notes}</p>}</div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => { setEditingVaccination(vaccination); setShowVaccinationForm(false); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label={`Edit ${vaccination.vaccineName}`}><Pencil size={16} /></button><button type="button" onClick={() => handleVaccinationDelete(vaccination)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${vaccination.vaccineName}`}><Trash2 size={16} /></button></div></div></article>)}</div> : !showVaccinationForm && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No vaccinations recorded yet.</p>}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ Icon, label, value }) {
  const icon = createElement(Icon, { size: 18, className: 'text-brand-600' });
  return <div className="rounded-xl bg-slate-50 p-4">{icon}<p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}

const REMINDER_STYLES = {
  upToDate: { label: 'Up to date', className: 'bg-emerald-50 text-emerald-700' },
  dueSoon: { label: 'Due soon', className: 'bg-yellow-50 text-yellow-700' },
  dueToday: { label: 'Due today', className: 'bg-orange-50 text-orange-700' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700' },
};

function getReminderStatus(nextDueDate) {
  if (!nextDueDate) return null;

  const today = new Date();
  const dueDate = new Date(`${nextDueDate.slice(0, 10)}T00:00:00`);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilDue = Math.round((dueDate - todayStart) / 86400000);

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue === 0) return 'dueToday';
  if (daysUntilDue <= 30) return 'dueSoon';
  return 'upToDate';
}

function ReminderStatus({ nextDueDate }) {
  const status = getReminderStatus(nextDueDate);
  if (!status) return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">No reminder</span>;

  const reminder = REMINDER_STYLES[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${reminder.className}`}>{reminder.label}</span>;
}

function ReminderLegend() {
  return <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="font-semibold text-slate-600">Reminder status:</span>{Object.entries(REMINDER_STYLES).map(([status, reminder]) => <span key={status} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${reminder.className.split(' ')[0]}`} />{reminder.label}</span>)}</div>;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
