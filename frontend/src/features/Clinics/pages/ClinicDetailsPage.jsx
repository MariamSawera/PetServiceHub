import { useEffect, useState } from 'react';
import { ArrowLeft, LocateFixed, MapPin, Phone, Star, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getClinic } from '../services/clinicApi';
import api from '../../../lib/axios';

const clinicIcon = L.divIcon({
  className: 'clinic-marker',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function RouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36] });
  }, [map, points]);

  return null;
}

function DirectionsMap({ clinic, userLocation, route }) {
  const [longitude, latitude] = clinic.location.coordinates;
  const clinicPosition = [latitude, longitude];
  const userPosition = [userLocation.latitude, userLocation.longitude];
  const routePositions = route?.geometry.coordinates.map(([routeLongitude, routeLatitude]) => [routeLatitude, routeLongitude]) || [];
  const points = [userPosition, clinicPosition];

  return (
    <div className="mt-8 h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer center={userPosition} zoom={12} scrollWheelZoom className="h-full w-full">
        <RouteBounds points={points} />
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={userPosition} radius={8} pathOptions={{ color: '#0f766e', fillColor: '#2dd4bf', fillOpacity: 1 }}><Popup>Your current location</Popup></CircleMarker>
        <Marker position={clinicPosition} icon={clinicIcon}><Popup><strong>{clinic.name}</strong><br />Destination</Popup></Marker>
        {routePositions.length > 0 && <Polyline positions={routePositions} pathOptions={{ color: '#0f766e', weight: 5, opacity: 0.85 }} />}
      </MapContainer>
    </div>
  );
}

export default function ClinicDetailsPage() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [state, setState] = useState('loading');
  const [directions, setDirections] = useState({ status: 'idle', location: null, route: null });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    Promise.all([getClinic(clinicId), api.get(`/api/reviews/clinic/${clinicId}`)])
      .then(([clinicResponse, reviewResponse]) => { setClinic(clinicResponse.data); setReviews(reviewResponse.data); setState('ready'); })
      .catch(() => setState('error'));
  }, [clinicId]);

  const getDirections = () => {
    if (!clinic?.location?.coordinates?.length) {
      setDirections({ status: 'error', location: null, route: null });
      return;
    }
    if (!navigator.geolocation) {
      setDirections({ status: 'unsupported', location: null, route: null });
      return;
    }

    setDirections({ status: 'locating', location: null, route: null });
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { latitude: coords.latitude, longitude: coords.longitude };
      const [clinicLongitude, clinicLatitude] = clinic.location.coordinates;
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${clinicLongitude},${clinicLatitude}?overview=full&geometries=geojson`);
        if (!response.ok) throw new Error('Route request failed');
        const data = await response.json();
        if (!data.routes?.[0]) throw new Error('No route found');
        setDirections({ status: 'ready', location, route: data.routes[0] });
      } catch {
        setDirections({ status: 'route-error', location, route: null });
      }
    }, () => setDirections({ status: 'denied', location: null, route: null }), { enableHighAccuracy: true, timeout: 10000 });
  };

  if (state === 'loading') return <main className="min-h-[70vh] px-6 py-16 text-center text-sm text-slate-500">Loading clinic details...</main>;
  if (state === 'error' || !clinic) return <main className="min-h-[70vh] px-6 py-16 text-center text-sm font-semibold text-red-700">Clinic not found.</main>;

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)] px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link to="/find-vets" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"><ArrowLeft size={16} /> Back to clinics</Link>
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-48 items-center justify-center bg-[linear-gradient(135deg,#ccfbf1,#e0f2fe)] md:h-64">{clinic.image ? <img src={clinic.image} alt={clinic.name} className="h-full w-full object-cover" /> : <Stethoscope size={56} className="text-teal-700/70" />}</div>
          <div className="p-6 md:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h1 className="text-3xl font-black text-slate-950">{clinic.name}</h1><p className="mt-2 flex items-center gap-2 text-slate-500"><MapPin size={17} className="text-teal-600" />{clinic.city || clinic.state || 'Location available on request'}</p></div>
              <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700"><Star size={16} fill="currentColor" />{clinic.rating ?? 'New'}</span>
            </div>
            {clinic.description && <p className="mt-6 leading-7 text-slate-600">{clinic.description}</p>}
            {(clinic.phone || clinic.address) && <div className="mt-7 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">{clinic.phone && <span className="flex items-center gap-2"><Phone size={16} className="text-teal-600" />{clinic.phone}</span>}{clinic.address && <span className="flex items-center gap-2"><MapPin size={16} className="text-teal-600" />{clinic.address}</span>}</div>}
            <div className="mt-7 flex flex-wrap gap-2">{[...(clinic.specialties || []), ...(clinic.services || [])].map((item) => <span key={item} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">{item}</span>)}</div>
            <div className="mt-8 border-t border-slate-100 pt-6"><h2 className="text-xl font-bold text-slate-950">Verified reviews</h2>{reviews.length === 0 ? <p className="mt-3 text-sm text-slate-500">No reviews yet.</p> : <div className="mt-4 space-y-4">{reviews.map((review) => <div key={review._id} className="rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><span className="font-bold text-slate-800">{review.user?.name || 'Pet parent'}</span><span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={15} fill="currentColor" />{review.rating}</span></div>{review.comment && <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>}</div>)}</div>}</div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={getDirections} disabled={directions.status === 'locating'} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"><LocateFixed size={17} />{directions.status === 'locating' ? 'Finding your location...' : 'Get directions'}</button>
              {directions.status === 'ready' && <span className="text-sm font-semibold text-slate-600">{(directions.route.distance / 1000).toFixed(1)} km by road</span>}
              {directions.status === 'denied' && <span className="text-sm text-slate-500">Location permission was not granted.</span>}
              {(directions.status === 'route-error' || directions.status === 'error') && <span className="text-sm text-red-600">Could not build a route to this clinic.</span>}
              {directions.status === 'unsupported' && <span className="text-sm text-slate-500">Location is not supported by this browser.</span>}
            </div>
            <Link to={`/appointments/new/${clinic._id}`} className="mt-4 inline-flex items-center rounded-lg border border-teal-700 px-5 py-3 text-sm font-bold text-teal-800 hover:bg-teal-50">Book appointment</Link>
            {directions.location && <DirectionsMap clinic={clinic} userLocation={directions.location} route={directions.route} />}
          </div>
        </section>
      </div>
    </main>
  );
}