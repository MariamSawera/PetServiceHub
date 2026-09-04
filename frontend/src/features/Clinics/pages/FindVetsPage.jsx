import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, LocateFixed, MapPin, Search, Star, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClinicMap from '../components/ClinicMap';
import { getClinics, getNearbyClinics } from '../services/clinicApi';

function ClinicCard({ clinic }) {
  const specialty = clinic.specialties?.[0] || clinic.services?.[0] || 'Veterinary care';

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-teal-50">
        {clinic.image ? (
          <img src={clinic.image} alt={clinic.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#ccfbf1,#e0f2fe)]">
            <Stethoscope size={42} className="text-teal-700/70" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-800 shadow-sm">
          Open for care
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{clinic.name}</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={15} className="text-teal-600" />
              {clinic.city || clinic.state || 'Location available on request'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-700">
            <Star size={15} fill="currentColor" />
            {clinic.rating ?? 'New'}
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-teal-700">{specialty}</p>
        <Link
          to={`/find-vets/${clinic._id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors hover:text-teal-700"
        >
          View details <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function FindVetsPage() {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [radius, setRadius] = useState('25000');
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;

    getClinics()
      .then(({ data }) => {
        if (active) {
          setClinics(data);
          setState('ready');
        }
      })
      .catch(() => {
        if (active) setState('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const findNearby = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }

    setLocationMessage('Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude };
        setUserLocation(location);
        setLocationMessage('');
        setState('loading');
        getNearbyClinics({ ...location, maxDistance: Number(radius), specialty })
          .then(({ data }) => { setClinics(data); setState('ready'); })
          .catch(() => { setState('error'); setLocationMessage('Nearby search is unavailable right now.'); });
      },
      () => setLocationMessage('Location permission was not granted. You can still browse all clinics.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const refreshNearby = () => {
    if (!userLocation) return;
    setState('loading');
    getNearbyClinics({ ...userLocation, maxDistance: Number(radius), specialty })
      .then(({ data }) => { setClinics(data); setState('ready'); })
      .catch(() => setState('error'));
  };

  const changeRadius = (event) => {
    const nextRadius = event.target.value;
    setRadius(nextRadius);
    if (!userLocation) return;
    setState('loading');
    getNearbyClinics({ ...userLocation, maxDistance: Number(nextRadius), specialty })
      .then(({ data }) => { setClinics(data); setState('ready'); })
      .catch(() => setState('error'));
  };

  const filteredClinics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clinics;

    return clinics.filter((clinic) => [
      clinic.name,
      clinic.city,
      clinic.state,
      ...(clinic.specialties || []),
      ...(clinic.services || []),
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [clinics, search]);

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Care, close to home</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Find a vet you can trust.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Browse verified clinics and find the right care for your pet. Nearby search and maps are coming next.</p>
        </div>

        <div className="mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-700" size={20} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by clinic, specialty, or city"
            aria-label="Search clinics by clinic, specialty, or city"
            className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
          </div>
          <button type="button" onClick={findNearby} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"><LocateFixed size={18} /> Use my location</button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input value={specialty} onChange={(event) => setSpecialty(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') refreshNearby(); }} placeholder="Filter specialty" aria-label="Filter by specialty" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
          <select value={radius} onChange={changeRadius} aria-label="Nearby search radius" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"><option value="5000">Within 5 km</option><option value="25000">Within 25 km</option><option value="50000">Within 50 km</option><option value="100000">Within 100 km</option></select>
          {locationMessage && <span className="text-sm text-slate-500">{locationMessage}</span>}
        </div>

        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Available clinics</h2>
            {state === 'ready' && <p className="mt-1 text-sm text-slate-500">{filteredClinics.length} {filteredClinics.length === 1 ? 'clinic' : 'clinics'} found</p>}
          </div>
        </div>

        {state === 'loading' && <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading clinics...</div>}
        {state === 'error' && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-12 text-center text-sm font-semibold text-red-700">Could not load clinics. Please try again.</div>}
        {state === 'ready' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:items-start">
            {filteredClinics.length > 0 ? <div className="grid gap-6 md:grid-cols-2">{filteredClinics.map((clinic) => <ClinicCard key={clinic._id} clinic={clinic} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">No clinics match that search.</div>}
            <ClinicMap clinics={filteredClinics} userLocation={userLocation} />
          </div>
        )}
      </div>
    </main>
  );
}