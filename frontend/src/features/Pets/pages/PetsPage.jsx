import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Dog, Plus, Trash2 } from 'lucide-react';
import PetForm from '../components/PetForm';
import { createPet, deletePet, getPets, updatePet } from '../services/petApi';

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      const response = editingPet ? await updatePet(editingPet._id, payload) : await createPet(payload);
      setPets((current) => editingPet ? current.map((pet) => pet._id === response.data._id ? response.data : pet) : [response.data, ...current]);
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
      setPets((current) => current.filter((item) => item._id !== pet._id));
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

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[var(--theme-bg)] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Your companions</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">My pets</h1>
            <p className="mt-3 max-w-xl text-slate-500">Keep each pet's essentials together for better everyday care.</p>
          </div>
          <button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"><Plus size={18} /> Add pet</button>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

        {showForm && <div className="mb-8"><PetForm key={editingPet?._id || 'new'} pet={editingPet} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingPet(null); }} saving={saving} /></div>}

        {loading ? <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">Loading your pets...</div> : pets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 px-6 py-16 text-center">
            <Dog className="mx-auto h-12 w-12 text-brand-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Your pet list is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Add your first companion to start building their care profile.</p>
            <button type="button" onClick={openAdd} className="mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">Add your first pet</button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <article key={pet._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex h-48 items-center justify-center bg-teal-50">
                  {pet.image ? <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" /> : <Dog size={64} className="text-brand-600" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{pet.name}</h2>
                      <p className="mt-1 text-sm capitalize text-slate-500">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">{pet.gender}</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} className="text-brand-600" />{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Birth date not added'}{pet.weight ? ` · ${pet.weight} kg` : ''}</div>
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link to={`/pets/${pet._id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-teal-100">View details <ArrowRight size={15} /></Link>
                    <button type="button" onClick={() => openEdit(pet)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => handleDelete(pet)} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${pet.name}`}><Trash2 size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
