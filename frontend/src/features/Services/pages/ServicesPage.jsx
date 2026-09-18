import { createElement } from 'react';
import { ArrowRight, Bath, CalendarCheck, HeartPulse, PawPrint, Scissors, ShieldCheck, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  { Icon: HeartPulse, title: 'Wellness checks', text: 'Routine exams that help catch small changes before they become bigger concerns.', accent: 'bg-teal-50 text-teal-700' },
  { Icon: Syringe, title: 'Vaccinations', text: 'Keep your pet protected and stay ahead of upcoming vaccine due dates.', accent: 'bg-sky-50 text-sky-700' },
  { Icon: Scissors, title: 'Grooming', text: 'Find gentle grooming support for healthy coats, nails, and comfortable pets.', accent: 'bg-orange-50 text-orange-700' },
  { Icon: ShieldCheck, title: 'Preventive care', text: 'Build a simple care routine around your pet’s age, lifestyle, and needs.', accent: 'bg-emerald-50 text-emerald-700' },
  { Icon: Bath, title: 'Dental care', text: 'Support your pet’s everyday comfort with professional oral health guidance.', accent: 'bg-cyan-50 text-cyan-700' },
  { Icon: PawPrint, title: 'Pet health records', text: 'Keep profiles, vaccination history, and appointment details together.', accent: 'bg-violet-50 text-violet-700' },
];

export default function ServicesPage() {
  return (
    <main className="bg-[var(--theme-bg)]">
      <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-20"><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Care for every chapter</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">The right support for every wag, purr, and paw.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Explore the care services available through PawCare and find a clinic that fits your pet’s next need.</p><Link to="/find-vets" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"><CalendarCheck size={18} /> Find a clinic <ArrowRight size={16} /></Link></div></section>
      <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-20"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map(({ Icon, title, text, accent }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>{createElement(Icon, { size: 23 })}</span><h2 className="mt-6 text-xl font-bold text-slate-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p><Link to="/find-vets" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900">Browse clinics <ArrowRight size={15} /></Link></article>)}</div></section>
      <section className="border-y border-slate-200 bg-slate-950 text-white"><div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">Not sure where to start?</p><h2 className="mt-3 text-3xl font-black">Start with a trusted local clinic.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Search by service, specialty, or city to compare available care near you.</p></div><Link to="/find-vets" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-bold text-white hover:bg-teal-400">Explore vets <ArrowRight size={17} /></Link></div></section>
    </main>
  );
}