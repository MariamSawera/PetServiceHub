import { useEffect, useState } from 'react';
import { uploadImage } from '../../../lib/uploadApi';
import { getClinics } from '../../Clinics/services/clinicApi';

const EMPTY_FORM = {
  vaccineName: '',
  dateAdministered: '',
  nextDueDate: '',
  veterinarian: '',
  notes: '',
  doseNumber: '',
  totalDoses: '',
  recurrenceMonths: '',
  certificateUrl: '',
};

const getInitialForm = (vaccination) => ({
  ...EMPTY_FORM,
  ...vaccination,
  dateAdministered: vaccination?.dateAdministered ? vaccination.dateAdministered.slice(0, 10) : '',
  nextDueDate: vaccination?.nextDueDate ? vaccination.nextDueDate.slice(0, 10) : '',
});

export default function VaccinationForm({ vaccination, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(getInitialForm(vaccination));
  const [clinics, setClinics] = useState([]);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(vaccination));
  }, [vaccination]);

  useEffect(() => {
    getClinics().then(({ data }) => setClinics(data)).catch(() => setClinics([]));
  }, []);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      nextDueDate: form.nextDueDate || undefined,
      doseNumber: form.doseNumber ? Number(form.doseNumber) : undefined,
      totalDoses: form.totalDoses ? Number(form.totalDoses) : undefined,
      recurrenceMonths: form.recurrenceMonths ? Number(form.recurrenceMonths) : undefined,
      clinic: form.clinic || undefined,
      veterinarian: form.veterinarian.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const handleCertificateChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploadingCertificate(true);
    try {
      const certificateUrl = await uploadImage(file);
      setForm((current) => ({ ...current, certificateUrl }));
    } finally {
      setUploadingCertificate(false);
      event.target.value = '';
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

  return (
    <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-8 sm:py-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Vaccine name<input required name="vaccineName" value={form.vaccineName} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="Rabies" /></label>
        <label className="text-sm font-semibold text-slate-700">Date administered<input required type="date" name="dateAdministered" value={form.dateAdministered} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} /></label>
        <label className="text-sm font-semibold text-slate-700">Next due date<input type="date" name="nextDueDate" value={form.nextDueDate} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} /></label>
        <label className="text-sm font-semibold text-slate-700">Veterinarian<input name="veterinarian" value={form.veterinarian} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="Dr. Taylor" /></label>
        <label className="text-sm font-semibold text-slate-700">Dose number<input type="number" min="1" name="doseNumber" value={form.doseNumber} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="1" /></label>
        <label className="text-sm font-semibold text-slate-700">Total doses<input type="number" min="1" name="totalDoses" value={form.totalDoses} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="1" /></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Repeat every (months)<input type="number" min="1" max="120" name="recurrenceMonths" value={form.recurrenceMonths} onChange={handleChange} className={`${inputClass} mt-1 font-normal`} placeholder="Optional recurring schedule" /></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Clinic<select name="clinic" value={form.clinic || ''} onChange={handleChange} className={`${inputClass} mt-1 font-normal`}><option value="">Not linked to a clinic</option>{clinics.map((clinic) => <option key={clinic._id} value={clinic._id}>{clinic.name}{clinic.city ? ` · ${clinic.city}` : ''}</option>)}</select></label>
      </div>
      <label className="mt-6 block text-sm font-semibold text-slate-700">Notes<textarea name="notes" value={form.notes} onChange={handleChange} rows="3" className={`${inputClass} mt-1.5 resize-none font-normal`} placeholder="Optional notes" /></label>
      <label className="mt-5 block text-sm font-semibold text-slate-700">Certificate image<input type="file" accept="image/*" onChange={handleCertificateChange} disabled={uploadingCertificate} className={`${inputClass} mt-1.5 font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-700`} />{uploadingCertificate && <span className="mt-2 block text-xs font-normal text-teal-700">Uploading certificate...</span>}{form.certificateUrl && <img src={form.certificateUrl} alt="Vaccination certificate" className="mt-3 h-24 rounded-xl border border-slate-100 object-cover" />}</label>
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={saving || uploadingCertificate} className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : vaccination ? 'Save changes' : 'Add vaccination'}</button>
      </div>
    </form>
  );
}