import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  vaccineName: '',
  dateAdministered: '',
  nextDueDate: '',
  veterinarian: '',
  notes: '',
};

const getInitialForm = (vaccination) => ({
  ...EMPTY_FORM,
  ...vaccination,
  dateAdministered: vaccination?.dateAdministered ? vaccination.dateAdministered.slice(0, 10) : '',
  nextDueDate: vaccination?.nextDueDate ? vaccination.nextDueDate.slice(0, 10) : '',
});

export default function VaccinationForm({ vaccination, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(getInitialForm(vaccination));

  useEffect(() => {
    setForm(getInitialForm(vaccination));
  }, [vaccination]);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      nextDueDate: form.nextDueDate || undefined,
      veterinarian: form.veterinarian.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Vaccine name<input required name="vaccineName" value={form.vaccineName} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="Rabies" /></label>
        <label className="text-sm font-semibold text-slate-700">Date administered<input required type="date" name="dateAdministered" value={form.dateAdministered} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} /></label>
        <label className="text-sm font-semibold text-slate-700">Next due date<input type="date" name="nextDueDate" value={form.nextDueDate} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} /></label>
        <label className="text-sm font-semibold text-slate-700">Veterinarian<input name="veterinarian" value={form.veterinarian} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="Dr. Taylor" /></label>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate-700">Notes<textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className={`${inputClass} mt-1 font-normal`} placeholder="Optional notes" /></label>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Cancel</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : vaccination ? 'Save changes' : 'Add vaccination'}</button>
      </div>
    </form>
  );
}