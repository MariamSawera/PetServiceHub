// import { useState } from 'react';
// import { ImagePlus, Save, X } from 'lucide-react';
// import { uploadImage } from '../../../lib/uploadApi';

// const EMPTY_PET = {
//   name: '',
//   species: 'dog',
//   breed: '',
//   gender: 'unknown',
//   dateOfBirth: '',
//   weight: '',
//   image: '',
//   medicalInfo: '',
// };

// const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-teal-100';

// const getInitialForm = (pet) => ({
//   ...EMPTY_PET,
//   ...pet,
//   dateOfBirth: pet?.dateOfBirth ? pet.dateOfBirth.slice(0, 10) : '',
//   weight: pet?.weight ?? '',
//   medicalInfo: pet?.medicalInfo && Object.keys(pet.medicalInfo).length ? JSON.stringify(pet.medicalInfo, null, 2) : '',
// });

// export default function PetForm({ pet, onSubmit, onCancel, saving }) {
//   const [form, setForm] = useState(getInitialForm(pet));
//   const [error, setError] = useState('');
//   const [uploading, setUploading] = useState(false);

//   const handleChange = (field) => (event) => {
//     setForm((current) => ({ ...current, [field]: event.target.value }));
//   };

//   const handleImageChange = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       setError('Please choose an image file.');
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setError('Please choose an image smaller than 5 MB.');
//       return;
//     }

//     setUploading(true);
//     setError('');
//     try {
//       const { data } = await uploadImage(file);
//       setForm((current) => ({ ...current, image: data.imageUrl }));
//     } catch {
//       setError('Image upload failed. Please try again.');
//     } finally {
//       setUploading(false);
//       event.target.value = '';
//     }
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     setError('');

//     let medicalInfo = {};
//     if (form.medicalInfo.trim()) {
//       try {
//         medicalInfo = JSON.parse(form.medicalInfo);
//       } catch {
//         setError('Medical info must be valid JSON, for example: {"allergies": []}.');
//         return;
//       }
//     }

//     onSubmit({
//       name: form.name.trim(),
//       species: form.species.trim(),
//       breed: form.breed.trim(),
//       gender: form.gender,
//       dateOfBirth: form.dateOfBirth || undefined,
//       weight: form.weight === '' ? undefined : Number(form.weight),
//       image: form.image.trim(),
//       medicalInfo,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
//       <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
//         <div>
//           <h2 className="text-xl font-bold text-slate-900">{pet ? 'Edit pet' : 'Add a pet'}</h2>
//           <p className="mt-1 text-sm text-slate-500">Save the essentials now. Medical history can grow with your pet.</p>
//         </div>
//         {onCancel && <button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close form"><X size={19} /></button>}
//       </div>

//       <div className="grid gap-5 sm:grid-cols-2">
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Name *</span>
//           <input required value={form.name} onChange={handleChange('name')} className={inputClass} placeholder="e.g. Luna" />
//         </label>
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Species *</span>
//           <input required value={form.species} onChange={handleChange('species')} className={inputClass} placeholder="Dog, cat, rabbit..." />
//         </label>
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Breed</span>
//           <input value={form.breed} onChange={handleChange('breed')} className={inputClass} placeholder="e.g. Golden Retriever" />
//         </label>
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Gender</span>
//           <select value={form.gender} onChange={handleChange('gender')} className={inputClass}>
//             <option value="unknown">Unknown</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//         </label>
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Date of birth</span>
//           <input type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} className={inputClass} />
//         </label>
//         <label>
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Weight (kg)</span>
//           <input type="number" min="0" step="0.1" value={form.weight} onChange={handleChange('weight')} className={inputClass} placeholder="e.g. 12.5" />
//         </label>
//         <label className="sm:col-span-2">
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Pet image</span>
//           <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50 px-4 py-5 text-sm font-semibold text-brand-700 transition hover:bg-teal-100">
//             <ImagePlus size={18} />
//             {uploading ? 'Uploading image...' : form.image ? 'Choose a different image' : 'Choose an image'}
//             <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="sr-only" />
//           </label>
//           {form.image && <img src={form.image} alt="Pet preview" className="mt-3 h-32 w-32 rounded-xl object-cover" />}
//         </label>
//         <label className="sm:col-span-2">
//           <span className="mb-2 block text-sm font-semibold text-slate-700">Medical information (JSON)</span>
//           <textarea value={form.medicalInfo} onChange={handleChange('medicalInfo')} rows={4} className={`${inputClass} font-mono text-xs`} placeholder={'{"allergies": [], "notes": ""}'} />
//           <span className="mt-1 block text-xs text-slate-400">Vaccinations and reminders will be added in a later feature.</span>
//         </label>
//       </div>

//       {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
//       <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
//         <Save size={17} />
//         {saving ? 'Saving...' : pet ? 'Save changes' : 'Add pet'}
//       </button>
//     </form>
//   );
// }

import { useState } from 'react';

import {
  CalendarDays,
  Camera,
  ChevronRight,
  HeartPulse,
  PawPrint,
  Save,
  X,
} from 'lucide-react';

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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100';

const getInitialForm = (pet) => ({
  ...EMPTY_PET,
  ...pet,
  dateOfBirth: pet?.dateOfBirth ? pet.dateOfBirth.slice(0, 10) : '',
  weight: pet?.weight ?? '',
  medicalInfo: pet?.medicalInfo?.notes || '',
});

export default function PetForm({
  pet,
  onSubmit,
  onCancel,
  saving,
}) {
  const [form, setForm] = useState(getInitialForm(pet));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
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
      const imageUrl = await uploadImage(file);

      setForm((current) => ({
        ...current,
        image: imageUrl,
      }));
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

    onSubmit({
      name: form.name.trim(),
      species: form.species.trim(),
      breed: form.breed.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      weight: form.weight === '' ? undefined : Number(form.weight),
      image: form.image.trim(),
      medicalInfo: form.medicalInfo.trim()
        ? { notes: form.medicalInfo.trim() }
        : {},
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_45px_rgba(15,118,110,0.08)]"
    >
      {/* =========================================================
          HEADER
      ========================================================== */}
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <PawPrint size={23} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {pet ? 'Edit Pet Profile' : 'Add a New Pet'}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {pet
                  ? "Update your companion's information."
                  : "Let's create a profile for your companion."}
              </p>
            </div>

          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          )}

        </div>

        {/* =====================================================
            STEP INDICATOR
        ====================================================== */}
        {!pet && (
          <div className="mt-6 flex items-center">

            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm">
                1
              </div>

              <span className="text-xs font-bold text-brand-600 sm:text-sm">
                Basic Information
              </span>
            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                2
              </div>

              <span className="hidden text-xs font-semibold text-slate-400 sm:block sm:text-sm">
                Health Information
              </span>
            </div>

          </div>
        )}
      </div>

      {/* =========================================================
          FORM CONTENT
      ========================================================== */}
      <div className="px-5 py-6 sm:px-7 sm:py-7">

        {/* Section title */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-600">
            {pet ? 'Pet information' : 'Basic information'}
          </p>

          <h3 className="mt-1 text-lg font-extrabold text-slate-900">
            Tell us about your pet
          </h3>
        </div>

        <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">

          {/* =====================================================
              PET PHOTO
          ====================================================== */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Pet Photo
            </label>

            <label className="group flex h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-teal-300 bg-[#f3fbfa] px-4 text-center transition hover:border-teal-400 hover:bg-teal-50">

              {form.image ? (
                <div className="relative h-full w-full">

                  <img
                    src={form.image}
                    alt="Pet preview"
                    className="h-full w-full rounded-xl object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700">
                      Change photo
                    </span>
                  </div>

                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-500 shadow-sm">
                    <Camera size={19} />
                  </div>

                  <span className="mt-2 text-xs font-semibold text-slate-600">
                    Click to upload photo
                  </span>

                  <span className="mt-1 text-[10px] text-slate-400">
                    JPG, PNG (Max 5MB)
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="sr-only"
              />
            </label>

            {uploading && (
              <p className="mt-2 text-xs font-semibold text-teal-600">
                Uploading image...
              </p>
            )}
          </div>

          {/* =====================================================
              NAME
          ====================================================== */}
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Name <span className="text-teal-500">*</span>
            </span>

            <input
              required
              value={form.name}
              onChange={handleChange('name')}
              className={inputClass}
              placeholder="e.g. Luna"
            />
          </label>

          {/* =====================================================
              SPECIES
          ====================================================== */}
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Species <span className="text-teal-500">*</span>
            </span>

            <select
              required
              value={form.species}
              onChange={handleChange('species')}
              className={inputClass}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="rabbit">Rabbit</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>
          </label>

          {/* =====================================================
              BREED
          ====================================================== */}
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Breed
            </span>

            <input
              value={form.breed}
              onChange={handleChange('breed')}
              className={inputClass}
              placeholder="e.g. Golden Retriever"
            />
          </label>

          {/* =====================================================
              GENDER
          ====================================================== */}
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Gender <span className="text-teal-500">*</span>
            </span>

            <select
              required
              value={form.gender}
              onChange={handleChange('gender')}
              className={inputClass}
            >
              <option value="unknown">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          {/* =====================================================
              DATE OF BIRTH
          ====================================================== */}
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Date of Birth
            </span>

            <div className="relative">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                className={`${inputClass} pr-11`}
              />

              <CalendarDays
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </label>

          {/* =====================================================
              WEIGHT
          ====================================================== */}
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Weight (kg) <span className="text-teal-500">*</span>
            </span>

            <input
              type="number"
              min="0"
              step="0.1"
              value={form.weight}
              onChange={handleChange('weight')}
              className={inputClass}
              placeholder="e.g. 12.5"
            />
          </label>

        </div>

        {/* =====================================================
            HEALTH INFORMATION
        ====================================================== */}
        <div className="mt-8 border-t border-slate-100 pt-7">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <HeartPulse size={19} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-600">
                Health information
              </p>

              <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">
                Medical information
              </h3>
            </div>

          </div>

          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Medical notes
            </span>

            <textarea
              value={form.medicalInfo}
              onChange={handleChange('medicalInfo')}
              rows={5}
              className={`${inputClass} resize-none leading-6`}
              placeholder="Add allergies, medications, conditions, or other notes"
            />

            <span className="mt-2 block text-xs leading-5 text-slate-400">
              Vaccinations, medications and reminders can be added in a later
              feature.
            </span>
          </label>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            ACTIONS
        ====================================================== */}
        <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? 'Saving...'
              : pet
              ? 'Save Changes'
              : 'Add Pet'}

            {!saving && !pet && <ChevronRight size={16} />}
          </button>

        </div>

      </div>
    </form>
  );
}