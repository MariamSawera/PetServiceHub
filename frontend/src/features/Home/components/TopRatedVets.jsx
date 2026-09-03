import { ArrowRight, Star, StarHalf } from "lucide-react";
import { topRatedVets } from "../data/mockData";

export default function TopRatedVets() {
  return (
    <section className="flex h-full flex-col px-6 py-6 md:px-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Top Rated Vets</h2>
        <a
          href="/vets"
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="flex-1 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
        {topRatedVets.map((vet) => (
          <a
            key={vet.id}
            href={`/vets/${vet.id}`}
            className="flex items-center gap-3 py-4 transition-colors hover:bg-slate-50"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${vet.avatarColor}`}
              aria-hidden="true"
            >
              {vet.initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">{vet.name}</h3>
              <p className="truncate text-xs text-slate-500">{vet.specialty}</p>
              <div className="mt-1 flex items-center gap-0.5" aria-label={`${vet.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => {
                  const fullStars = Math.floor(vet.rating);
                  const hasHalfStar = vet.rating - fullStars >= 0.5 && index === fullStars;

                  if (index < fullStars) {
                    return <Star key={index} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />;
                  }

                  if (hasHalfStar) {
                    return <StarHalf key={index} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />;
                  }

                  return <Star key={index} className="h-3.5 w-3.5 text-slate-200" />;
                })}
                <span className="font-semibold text-slate-700">{vet.rating}</span>
                <span className="text-slate-400">({vet.reviews})</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
