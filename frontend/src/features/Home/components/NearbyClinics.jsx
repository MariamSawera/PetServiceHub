import { ArrowRight, MapPin, Star } from "lucide-react";
import { nearbyClinics } from "../data/mockData";

export default function NearbyClinics() {
  return (
    <section className="h-full px-6 py-6 md:px-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Nearby Vet Clinics</h2>
        {/* TODO(backend): link to full clinics directory page */}
        <a
          href="/vets"
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all clinics <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nearbyClinics.slice(0, 3).map((clinic) => (
          <a
            key={clinic.id}
            href={`/vets/${clinic.id}`}
            className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] w-full bg-slate-100">
              {/* TODO(backend): replace with real clinic photo from API */}
              <img
                src={clinic.image}
                alt={clinic.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-brand-600" />
                {clinic.name}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {clinic.distanceKm} km away
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-800">
                  {clinic.rating}
                </span>
                <span className="text-slate-400">
                  ({clinic.reviews} reviews)
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
