// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowRight, CalendarDays, Dog, Plus, Trash2 } from 'lucide-react';
// import PetForm from '../components/PetForm';
// import { createPet, deletePet, getPets, updatePet } from '../services/petApi';

// export default function PetsPage() {
//   const [pets, setPets] = useState([]);
//   const [editingPet, setEditingPet] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');

//   const loadPets = async () => {
//     try {
//       const { data } = await getPets();
//       setPets(data);
//     } catch {
//       setError('Could not load your pets. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPets();
//   }, []);

//   const handleSubmit = async (payload) => {
//     setSaving(true);
//     setError('');
//     try {
//       const response = editingPet ? await updatePet(editingPet._id, payload) : await createPet(payload);
//       setPets((current) => editingPet ? current.map((pet) => pet._id === response.data._id ? response.data : pet) : [response.data, ...current]);
//       setShowForm(false);
//       setEditingPet(null);
//     } catch {
//       setError('Could not save this pet. Check the details and try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (pet) => {
//     if (!window.confirm(`Remove ${pet.name} from your pets?`)) return;
//     try {
//       await deletePet(pet._id);
//       setPets((current) => current.filter((item) => item._id !== pet._id));
//     } catch {
//       setError('Could not delete this pet. Please try again.');
//     }
//   };

//   const openAdd = () => {
//     setEditingPet(null);
//     setShowForm(true);
//     setError('');
//   };

//   const openEdit = (pet) => {
//     setEditingPet(pet);
//     setShowForm(true);
//     setError('');
//   };

//   return (
//     <main className="min-h-[calc(100vh-80px)] bg-[var(--theme-bg)] px-6 py-10 md:px-12">
//       <div className="mx-auto max-w-6xl">
//         <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
//           <div>
//             <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Your companions</p>
//             <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">My pets</h1>
//             <p className="mt-3 max-w-xl text-slate-500">Keep each pet's essentials together for better everyday care.</p>
//           </div>
//           <button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"><Plus size={18} /> Add pet</button>
//         </div>

//         {error && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

//         {showForm && <div className="mb-8"><PetForm key={editingPet?._id || 'new'} pet={editingPet} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingPet(null); }} saving={saving} /></div>}

//         {loading ? <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">Loading your pets...</div> : pets.length === 0 ? (
//           <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 px-6 py-16 text-center">
//             <Dog className="mx-auto h-12 w-12 text-brand-600" />
//             <h2 className="mt-4 text-xl font-bold text-slate-900">Your pet list is empty</h2>
//             <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Add your first companion to start building their care profile.</p>
//             <button type="button" onClick={openAdd} className="mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">Add your first pet</button>
//           </div>
//         ) : (
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             {pets.map((pet) => (
//               <article key={pet._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
//                 <div className="flex h-48 items-center justify-center bg-teal-50">
//                   {pet.image ? <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" /> : <Dog size={64} className="text-brand-600" />}
//                 </div>
//                 <div className="p-5">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <h2 className="text-xl font-bold text-slate-900">{pet.name}</h2>
//                       <p className="mt-1 text-sm capitalize text-slate-500">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
//                     </div>
//                     <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">{pet.gender}</span>
//                   </div>
//                   <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} className="text-brand-600" />{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Birth date not added'}{pet.weight ? ` · ${pet.weight} kg` : ''}</div>
//                   <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
//                     <Link to={`/pets/${pet._id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-teal-100">View details <ArrowRight size={15} /></Link>
//                     <button type="button" onClick={() => openEdit(pet)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Edit</button>
//                     <button type="button" onClick={() => handleDelete(pet)} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${pet.name}`}><Trash2 size={16} /></button>
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  CalendarDays,
  HeartPulse,
  MoreVertical,
  PawPrint,
  Plus,
  Search,
  Trash2,
  Weight,
} from 'lucide-react';

import PetForm from '../components/PetForm';

import {
  createPet,
  deletePet,
  getPets,
  updatePet,
} from '../services/petApi';

import noPetsImage from '../../../assets/noPetsImage.png';

const getAgeLabel = (dateOfBirth) => {
  if (!dateOfBirth) return 'Age not added';

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime())) {
    return 'Age not added';
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (
    months < 0 ||
    (months === 0 && today.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  }

  const totalMonths =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  if (totalMonths > 0) {
    return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'} old`;
  }

  return 'Less than 1 month old';
};

const getHealthSummary = (pet) => {
  const medicalInfo = pet?.medicalInfo;

  if (!medicalInfo || typeof medicalInfo !== 'object') {
    return 'No known allergies or medical conditions';
  }

  const allergies = Array.isArray(medicalInfo.allergies)
    ? medicalInfo.allergies
    : [];

  const notes = medicalInfo.notes?.trim();

  if (allergies.length > 0) {
    return `${allergies.length} known ${
      allergies.length === 1 ? 'allergy' : 'allergies'
    }`;
  }

  if (notes) {
    return notes;
  }

  return 'No known allergies or medical conditions';
};

const getGenderStyles = (gender) => {
  if (gender === 'female') {
    return 'bg-rose-50 text-rose-500 border border-rose-100';
  }

  if (gender === 'male') {
    return 'bg-blue-50 text-blue-500 border border-blue-100';
  }

  return 'bg-slate-50 text-slate-500 border border-slate-100';
};

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadPets = async () => {
    try {
      const { data } = await getPets();
      setPets(data);
    } catch {
      setError('Could not load your pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError('');

    try {
      const response = editingPet
        ? await updatePet(editingPet._id, payload)
        : await createPet(payload);

      setPets((current) =>
        editingPet
          ? current.map((pet) =>
              pet._id === response.data._id ? response.data : pet
            )
          : [response.data, ...current]
      );

      setShowForm(false);
      setEditingPet(null);
    } catch {
      setError('Could not save this pet. Check the details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pet) => {
    if (!window.confirm(`Remove ${pet.name} from your pets?`)) return;

    try {
      await deletePet(pet._id);

      setPets((current) =>
        current.filter((item) => item._id !== pet._id)
      );
    } catch {
      setError('Could not delete this pet. Please try again.');
    }
  };

  const openAdd = () => {
    setEditingPet(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
    setError('');
  };

  const filteredPets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return pets;

    return pets.filter((pet) => {
      return (
        pet.name?.toLowerCase().includes(query) ||
        pet.species?.toLowerCase().includes(query) ||
        pet.breed?.toLowerCase().includes(query)
      );
    });
  }, [pets, search]);

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[var(--theme-bg)]">

      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute left-0 top-24 h-44 w-44 -translate-x-1/2 rounded-full bg-teal-100/60 blur-[1px]" />

      <div className="pointer-events-none absolute right-[-70px] top-16 h-52 w-52 rounded-full bg-teal-100/60" />

      <div className="pointer-events-none absolute right-10 top-28 rotate-12 text-teal-400/40">
        <PawPrint size={62} strokeWidth={1.5} />
      </div>

      <div className="pointer-events-none absolute bottom-[-90px] left-[-40px] h-56 w-[520px] rounded-[50%] bg-teal-50" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ================= HERO ================= */}
        <section className="mb-8 rounded-[28px] bg-gradient-to-r from-[#eefbf9] via-[#f4fcfb] to-[#e9f8f6] px-6 py-8 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            {/* Heading */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 sm:text-sm">
                Your companions
              </p>

              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  My Pets
                </h1>

                <div className="hidden rounded-full bg-teal-100 p-2 text-teal-600 sm:block">
                  <PawPrint size={24} />
                </div>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Keep all your pet&apos;s details, health records and care
                information in one place.
              </p>
            </div>

            {/* Search + Add */}
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 sm:w-[280px] lg:w-[330px]">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your pets..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
              >
                <Plus size={19} />
                Add Pet
              </button>
            </div>

          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* ================= FORM ================= */}
        {showForm && (
          <div className="mb-8">
            <PetForm
              key={editingPet?._id || 'new'}
              pet={editingPet}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPet(null);
              }}
              saving={saving}
            />
          </div>
        )}

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="rounded-[28px] border border-slate-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your pets...
            </p>
          </div>
        ) : pets.length === 0 && !showForm ? (

          /* ================= NO PETS ================= */
          <section className="relative overflow-hidden rounded-[28px] border border-teal-100 bg-gradient-to-br from-white via-[#f4fcfb] to-[#e8f8f5] px-6 py-12 shadow-sm sm:px-10 sm:py-16">

            {/* Decorative paw */}
            <PawPrint
              size={110}
              strokeWidth={1}
              className="pointer-events-none absolute -right-5 top-5 rotate-12 text-teal-100"
            />

            <PawPrint
              size={70}
              strokeWidth={1}
              className="pointer-events-none absolute bottom-6 left-6 -rotate-12 text-teal-100"
            />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">

              <div className="mb-6 overflow-hidden rounded-[30px] bg-white/60 p-4">
                <img
                  src={noPetsImage}
                  alt="Pets illustration"
                  className="h-48 w-64 object-contain sm:h-56 sm:w-72"
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                Start your pet journey
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                No pets yet?
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                Add your first companion to start tracking their health,
                appointments, vaccinations and everyday care information.
              </p>

              <button
                type="button"
                onClick={openAdd}
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
              >
                <Plus size={19} />
                Add Your First Pet
              </button>

            </div>
          </section>

        ) : filteredPets.length === 0 ? (

          /* ================= NO SEARCH RESULTS ================= */
          <section className="rounded-[28px] border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
              <Search size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No pets found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with another name, species or breed.
            </p>

            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-5 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              Clear search
            </button>
          </section>

        ) : (

          /* ================= PET LIST ================= */
          <section>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  Your Pets{' '}
                  <span className="text-teal-500">
                    ({pets.length})
                  </span>
                </h2>

                {search && (
                  <p className="mt-1 text-xs text-slate-400">
                    Showing {filteredPets.length} matching{' '}
                    {filteredPets.length === 1 ? 'pet' : 'pets'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {filteredPets.map((pet) => (
                <article
                  key={pet._id}
                  className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Pet image */}
                  <div className="relative mx-4 mt-4 h-44 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#e6f8f5] to-[#d4f0ec]">

                    {/* Decorative blob */}
                    <div className="absolute left-[-25px] top-[-25px] h-28 w-28 rounded-full bg-white/40" />

                    <div className="absolute bottom-[-35px] right-[-15px] h-32 w-32 rounded-full bg-white/40" />

                    {pet.image ? (
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="relative z-10 flex h-full flex-col items-center justify-center text-teal-500">
                        <PawPrint size={52} strokeWidth={1.5} />
                        <span className="mt-2 text-xs font-semibold">
                          No photo
                        </span>
                      </div>
                    )}

                    {/* Gender */}
                    <span
                      className={`absolute right-3 top-3 z-20 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${getGenderStyles(
                        pet.gender
                      )}`}
                    >
                      {pet.gender === 'female' && '♀'}
                      {pet.gender === 'male' && '♂'}
                      {pet.gender === 'unknown' && '•'}
                      <span className="ml-1">
                        {pet.gender || 'Unknown'}
                      </span>
                    </span>

                    {/* More button */}
                    <button
                      type="button"
                      className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-800"
                      aria-label={`More options for ${pet.name}`}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Card content */}
                  <div className="p-5">

                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {pet.name}
                      </h3>

                      <p className="mt-1 text-sm font-medium capitalize text-slate-400">
                        {pet.breed || pet.species}
                        {pet.breed && pet.species
                          ? ` · ${pet.species}`
                          : ''}
                      </p>
                    </div>

                    {/* Pet stats */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-teal-500"
                        />

                        <span>
                          {getAgeLabel(pet.dateOfBirth)}
                        </span>
                      </div>

                      {pet.weight && (
                        <div className="flex items-center gap-2">
                          <Weight
                            size={16}
                            className="text-teal-500"
                          />

                          <span>{pet.weight} kg</span>
                        </div>
                      )}

                    </div>

                    {/* Health information */}
                    <div className="mt-5 flex gap-3 rounded-2xl bg-[#eefaf8] px-4 py-3.5">

                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-teal-500 shadow-sm">
                        <HeartPulse size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                          Health
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {getHealthSummary(pet)}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">

                      <Link
                        to={`/pets/${pet._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-2.5 text-xs font-bold text-teal-600 transition hover:bg-teal-50 sm:text-sm"
                      >
                        View Profile
                        <ArrowRight size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEdit(pet)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 sm:text-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(pet)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                        aria-label={`Delete ${pet.name}`}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>
                </article>
              ))}

              {/* Add another pet card */}
              <button
                type="button"
                onClick={openAdd}
                className="group flex min-h-[430px] flex-col items-center justify-center rounded-[24px] border border-dashed border-teal-200 bg-gradient-to-br from-[#f4fcfb] to-[#edf9f7] px-6 text-center transition hover:border-teal-400 hover:bg-teal-50"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-500 shadow-sm transition group-hover:scale-105">
                  <Plus size={30} />
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-800">
                  Add another pet
                </h3>

                <p className="mt-2 max-w-[220px] text-sm leading-5 text-slate-500">
                  Create a profile for another furry companion.
                </p>

              </button>

            </div>
          </section>
        )}

        {/* Footer decoration */}
        <div className="mt-14 flex items-center gap-3 pb-6 text-sm font-medium text-teal-600">
          <PawPrint size={22} />
          <span>Healthy Pets</span>
          <span>♥</span>
          <span>Happier Lives</span>

          <div className="ml-2 h-px w-20 bg-teal-300" />
        </div>

      </div>
    </main>
  );
}
