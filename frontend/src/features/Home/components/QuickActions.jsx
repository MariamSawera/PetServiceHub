import {
  Stethoscope,
  Calendar,
  PawPrint,
  FileHeart,
  MapPin,
} from "lucide-react";
import { quickActions } from "../data/mockData";

const ICONS = {
  Stethoscope,
  Calendar,
  PawPrint,
  FileHeart,
  MapPin,
};

const ACCENTS = {
  teal: "bg-brand-50 text-brand-600",
  blue: "bg-sky-50 text-sky-600",
  purple: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function QuickActions() {
  return (
    <section className="px-6 py-10 md:px-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = ICONS[action.icon];
          return (
            <a
              key={action.id}
              href={action.href}
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENTS[action.accent]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {action.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
