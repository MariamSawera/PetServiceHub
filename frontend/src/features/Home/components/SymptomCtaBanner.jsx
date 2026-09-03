import { Sparkles } from "lucide-react";

export default function SymptomCtaBanner() {
  return (
    <section className="px-6 py-6 md:px-12">
      <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-brand-50 p-6 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <img
            src="/images/cat-blanket.webp"
            alt="Cat wrapped in a blanket"
            className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Not sure what's wrong?
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Our AI Symptom Checker can help you understand your pet's
              health better.
            </p>
          </div>
        </div>

        {/* TODO(backend): route to /symptom-checker */}
        <a
          href="/symptom-checker"
          className="relative z-10 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[var(--theme-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
        >
          <Sparkles className="h-4 w-4" />
          Check Symptoms Now
        </a>
      </div>
    </section>
  );
}
