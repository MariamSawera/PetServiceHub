import { createElement } from 'react';
import { CalendarCheck, HeartHandshake, PawPrint, ShieldCheck, Stethoscope } from 'lucide-react';

const VALUES = [
  { Icon: HeartHandshake, title: 'Care that feels personal', text: 'Every pet has a different story. PawCare helps you find support that fits yours.' },
  { Icon: ShieldCheck, title: 'Trust in every step', text: 'Clear clinic profiles, simple booking, and appointment updates keep you informed.' },
  { Icon: Stethoscope, title: 'Better access to experts', text: 'Find the right veterinary care without the usual runaround.' },
];

export default function AboutPage() {
  return (
    <main className="bg-[var(--theme-bg)]">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-40"><img src="/images/hero-dog-cats.jpg" alt="Two pets relaxing together" className="h-full w-full object-cover" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:px-12 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-300"><PawPrint size={16} /> About PawCare</p><h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">A calmer way to care for the pets you love.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">We bring pet parents, trusted clinics, and everyday care together in one thoughtful place.</p></div>
          <div className="hidden justify-end lg:flex"><div className="max-w-sm border-l border-teal-300/50 pl-7"><p className="text-2xl font-bold leading-snug">More time being present. Less time searching for care.</p><p className="mt-4 text-sm leading-6 text-slate-300">From your pet&apos;s first appointment to their next vaccine, PawCare keeps the details close at hand.</p></div></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="overflow-hidden rounded-2xl bg-teal-100"><img src="/images/pets-hero.png" alt="Happy pets cared for by their family" className="h-full min-h-[300px] w-full object-cover" /></div>
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Why we built it</p><h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Pet care should feel connected.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">PawCare was created for the moments that matter: finding a vet you trust, keeping your pet&apos;s health history organized, and knowing what comes next after an appointment.</p><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Our goal is simple: make responsible pet care easier to discover, plan, and remember for every family.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat value="1 place" label="for your pet care" /><Stat value="24/7" label="access to your details" /><Stat value="100%" label="made for pet people" /></div></div>
      </section>

      <section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 lg:py-20"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">What guides us</p><h2 className="mt-3 text-3xl font-black text-slate-950">Thoughtful by design.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{VALUES.map(({ Icon, title, text }) => <article key={title} className="border-t-2 border-teal-500 pt-5">{createElement(Icon, { size: 24, className: 'text-teal-700' })}<h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></section>
      <section className="mx-auto flex max-w-[1400px] flex-col gap-5 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-12"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Ready when you are</p><h2 className="mt-2 text-2xl font-black text-slate-950">Start with a better next step for your pet.</h2></div><a href="/find-vets" className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"><CalendarCheck size={18} /> Find a clinic</a></section>
    </main>
  );
}

function Stat({ value, label }) {
  return <div><p className="text-2xl font-black text-teal-700">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p></div>;
}
