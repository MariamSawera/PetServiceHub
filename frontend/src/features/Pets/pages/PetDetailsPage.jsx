import { createElement, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Dog, HeartPulse, Scale } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPet } from '../services/petApi';

export default function PetDetailsPage() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    getPet(petId)
      .then(({ data }) => {
        setPet(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [petId]);

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
            <div className="mt-8 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 p-4 text-sm text-slate-600">Vaccination history and reminders will be available in a future update.</div>
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
