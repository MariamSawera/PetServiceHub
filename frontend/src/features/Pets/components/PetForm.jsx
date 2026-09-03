import { useState } from 'react';
import { ImagePlus, Save, X } from 'lucide-react';
import { uploadImage } from '../../../lib/uploadApi';

const EMPTY_PET = {
  name: '',
  species: 'dog',
  breed: '',
  gender: 'unknown',
  dateOfBirth: '',
  weight: '',
  image: '',
  medicalInfo: '',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-teal-100';

const getInitialForm = (pet) => ({
  ...EMPTY_PET,
  ...pet,
  dateOfBirth: pet?.dateOfBirth ? pet.dateOfBirth.slice(0, 10) : '',
  weight: pet?.weight ?? '',
  medicalInfo: pet?.medicalInfo && Object.keys(pet.medicalInfo).length ? JSON.stringify(pet.medicalInfo, null, 2) : '',
});

export default function PetForm({ pet, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(getInitialForm(pet));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image smaller than 5 MB.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const { data } = await uploadImage(file);
      setForm((current) => ({ ...current, image: data.imageUrl }));
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    let medicalInfo = {};
    if (form.medicalInfo.trim()) {
      try {
        medicalInfo = JSON.parse(form.medicalInfo);
      } catch {
        setError('Medical info must be valid JSON, for example: {"allergies": []}.');
        return;
      }
    }

    onSubmit({
      name: form.name.trim(),
      species: form.species.trim(),
      breed: form.breed.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      weight: form.weight === '' ? undefined : Number(form.weight),
      image: form.image.trim(),
      medicalInfo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{pet ? 'Edit pet' : 'Add a pet'}</h2>
          <p className="mt-1 text-sm text-slate-500">Save the essentials now. Medical history can grow with your pet.</p>
        </div>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close form"><X size={19} /></button>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Name *</span>
          <input required value={form.name} onChange={handleChange('name')} className={inputClass} placeholder="e.g. Luna" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Species *</span>
          <input required value={form.species} onChange={handleChange('species')} className={inputClass} placeholder="Dog, cat, rabbit..." />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Breed</span>
          <input value={form.breed} onChange={handleChange('breed')} className={inputClass} placeholder="e.g. Golden Retriever" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Gender</span>
          <select value={form.gender} onChange={handleChange('gender')} className={inputClass}>
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Date of birth</span>
          <input type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} className={inputClass} />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700">Weight (kg)</span>
          <input type="number" min="0" step="0.1" value={form.weight} onChange={handleChange('weight')} className={inputClass} placeholder="e.g. 12.5" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Pet image</span>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50 px-4 py-5 text-sm font-semibold text-brand-700 transition hover:bg-teal-100">
            <ImagePlus size={18} />
            {uploading ? 'Uploading image...' : form.image ? 'Choose a different image' : 'Choose an image'}
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="sr-only" />
          </label>
          {form.image && <img src={form.image} alt="Pet preview" className="mt-3 h-32 w-32 rounded-xl object-cover" />}
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Medical information (JSON)</span>
          <textarea value={form.medicalInfo} onChange={handleChange('medicalInfo')} rows={4} className={`${inputClass} font-mono text-xs`} placeholder={'{"allergies": [], "notes": ""}'} />
          <span className="mt-1 block text-xs text-slate-400">Vaccinations and reminders will be added in a later feature.</span>
        </label>
      </div>

      {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
        <Save size={17} />
        {saving ? 'Saving...' : pet ? 'Save changes' : 'Add pet'}
      </button>
    </form>
  );
}
