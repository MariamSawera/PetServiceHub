import { ShieldCheck, Lock, Sparkles, Headphones } from "lucide-react";
import { trustBadges } from "../data/mockData";

const ICONS = { ShieldCheck, Lock, Sparkles, Headphones };

export default function TrustBar() {
  return (
    <section className="px-6 py-6 md:px-12">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-slate-100 px-6 py-5 sm:justify-between">
        {trustBadges.map((badge) => {
          const Icon = ICONS[badge.icon];
          return (
            <div
              key={badge.id}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Icon className="h-4 w-4 text-brand-600" />
              {badge.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
