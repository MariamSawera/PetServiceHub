import { createElement, useState } from 'react';
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

const CONTACT_OPTIONS = [
  { Icon: Mail, label: 'Email us', value: 'hello@pawcare.com', href: 'mailto:hello@pawcare.com' },
  { Icon: Phone, label: 'Call us', value: '+1 (555) 014-2729', href: 'tel:+15550142729' },
  { Icon: MapPin, label: 'Serving pet families', value: 'Wherever you are', href: '/find-vets' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)]">
      <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-20"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-700"><MessageCircle size={17} /> Contact PawCare</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">We&apos;re here for the questions between appointments.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Need help finding a clinic, managing your account, or understanding what comes next? Send us a note and our team will get back to you.</p></div></section>
      <section className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div><div className="grid gap-3">{CONTACT_OPTIONS.map(({ Icon, label, value, href }) => <a key={label} href={href} className="group flex items-center gap-4 border-b border-slate-200 py-5 transition-colors hover:border-teal-400"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">{createElement(Icon, { size: 20 })}</span><span><span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span><span className="mt-1 block text-sm font-bold text-slate-800 group-hover:text-teal-700">{value}</span></span></a>)}</div><div className="mt-10 border-l-2 border-teal-500 pl-5"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Clock3 size={17} className="text-teal-700" /> Support hours</div><p className="mt-2 text-sm leading-6 text-slate-600">Monday to Friday, 9:00 AM to 6:00 PM</p><p className="text-sm leading-6 text-slate-600">We usually reply within one business day.</p></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Send a message</p><h2 className="mt-2 text-2xl font-black text-slate-950">How can we help?</h2></div><Send size={24} className="text-teal-600" /></div>{sent && <p role="status" className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Thanks for reaching out. Your message is ready for our support team.</p>}<form onSubmit={handleSubmit} className="mt-7 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" name="name" required /><Field label="Email address" name="email" type="email" required /></div><Field label="Subject" name="subject" required /><label className="block text-sm font-semibold text-slate-700" htmlFor="message">Message<textarea id="message" name="message" required rows="5" className="mt-2 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-normal text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="Tell us what you need help with..." /></label><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"><Send size={17} /> Send message</button></form></div>
      </section>
    </main>
  );
}

function Field({ label, name, type = 'text', required = false }) {
  return <label className="block text-sm font-semibold text-slate-700" htmlFor={name}>{label}<input id={name} name={name} type={type} required={required} className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-normal text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>;
}
