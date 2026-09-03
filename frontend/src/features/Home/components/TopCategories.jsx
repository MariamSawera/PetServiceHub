import { ArrowRight } from "lucide-react";
import { topCategories } from "../data/mockData";

const ACCENTS = {
  mint: "bg-emerald-50",
  sky: "bg-sky-50",
  violet: "bg-violet-50",
  peach: "bg-orange-50",
};

export default function TopCategories() {
  return (
    <section className="px-6 py-6 md:px-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Top Categories</h2>
        {/* TODO(backend): link to full services listing page */}
        <a
          href="/services"
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all services <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {topCategories.map((cat) => (
          <div
            key={cat.id}
            className={`rounded-2xl p-5 ${ACCENTS[cat.accent]}`}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
              {cat.emoji}
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              {cat.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {cat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
