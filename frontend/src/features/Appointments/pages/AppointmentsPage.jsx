import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, Star, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cancelAppointment, createReview, deleteReview, getMyReviews, getUserAppointments, updateReview } from '../services/appointmentApi';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-teal-50 text-teal-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-600',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForms, setReviewForms] = useState({});

  useEffect(() => {
    Promise.all([getUserAppointments(), getMyReviews()])
      .then(([appointmentsResponse, reviewsResponse]) => { setAppointments(appointmentsResponse.data); setReviews(reviewsResponse.data); setState('ready'); })
      .catch(() => { setError('Could not load your bookings.'); setState('error'); });
  }, []);

  const handleCancel = async (appointment) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const { data } = await cancelAppointment(appointment._id);
      setAppointments((current) => current.map((item) => item._id === data._id ? data : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not cancel this appointment.');
    }
  };

  const reviewFor = (appointmentId) => reviews.find((review) => review.appointment?._id === appointmentId || review.appointment === appointmentId);
  const reviewValue = (appointmentId, review) => reviewForms[appointmentId] || { rating: review?.rating || 5, comment: review?.comment || '' };

  const saveReview = async (appointment, existingReview) => {
    const form = reviewValue(appointment._id, existingReview);
    try {
      const { data } = existingReview ? await updateReview(existingReview._id, form) : await createReview({ ...form, appointment: appointment._id });
      setReviews((current) => existingReview ? current.map((item) => item._id === data._id ? data : item) : [data, ...current]);
      setReviewForms((current) => { const next = { ...current }; delete next[appointment._id]; return next; });
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not save your review.'); }
  };

  const removeReview = async (review) => {
    if (!window.confirm('Delete this review?')) return;
    try { await deleteReview(review._id); setReviews((current) => current.filter((item) => item._id !== review._id)); }
    catch { setError('Could not delete your review.'); }
  };

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Your care schedule</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">My bookings</h1>
        <p className="mt-3 text-slate-600">Keep track of upcoming visits and appointment history.</p>
        {error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        {state === 'loading' && <p className="mt-8 text-sm text-slate-500">Loading your bookings...</p>}
        {state === 'error' && <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Your bookings could not be loaded.</p>}
        {state === 'ready' && appointments.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-teal-200 bg-white p-12 text-center"><CalendarDays className="mx-auto text-teal-600" size={42} /><h2 className="mt-4 text-xl font-bold text-slate-950">No bookings yet</h2><p className="mt-2 text-sm text-slate-500">Find a clinic to schedule your pet's next visit.</p><Link to="/find-vets" className="mt-6 inline-flex rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">Find a vet</Link></div>}
        {state === 'ready' && appointments.length > 0 && <div className="mt-8 space-y-4">{appointments.map((appointment) => { const review = reviewFor(appointment._id); const form = reviewValue(appointment._id, review); return <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold text-slate-950">{appointment.clinic?.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[appointment.status] || statusStyles.pending}`}>{appointment.status}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin size={15} className="text-teal-600" />{appointment.clinic?.city || 'Clinic location'}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-600" />{appointment.pet?.name}</span><span>{appointment.service}</span><span className="flex items-center gap-2"><Clock3 size={15} className="text-teal-600" />{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span></div></div>{['pending', 'confirmed'].includes(appointment.status) && <button type="button" onClick={() => handleCancel(appointment)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><XCircle size={16} /> Cancel booking</button>}</div>{appointment.status === 'completed' && <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-bold text-slate-800">{review ? 'Your verified review' : 'How was your visit?'}</h3><div className="mt-3 flex flex-wrap items-center gap-3"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setReviewForms((current) => ({ ...current, [appointment._id]: { ...form, rating: star } }))} aria-label={`Rate ${star} out of 5`} className={star <= form.rating ? 'text-amber-500' : 'text-slate-300'}><Star size={21} fill="currentColor" /></button>)}</div><textarea value={form.comment} onChange={(event) => setReviewForms((current) => ({ ...current, [appointment._id]: { ...form, comment: event.target.value } }))} rows="2" placeholder="Share your experience" className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500" /></div><div className="mt-3 flex gap-3"><button type="button" onClick={() => saveReview(appointment, review)} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">{review ? 'Update review' : 'Leave review'}</button>{review && <button type="button" onClick={() => removeReview(review)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Delete review</button>}</div></div>}</article>; })}</div>}
      </div>
    </main>
  );
}