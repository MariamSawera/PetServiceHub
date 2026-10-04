import { useEffect } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

import 'leaflet/dist/leaflet.css';

const clinicIcon = L.divIcon({
  className: 'clinic-marker',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapViewport({ center, clinicPositions, focusPosition, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (focusPosition) {
      map.setView(focusPosition, 15, { animate: true });
      return;
    }

    if (userLocation) {
      map.setView(center, map.getZoom(), { animate: true });
      return;
    }

    if (clinicPositions.length === 1) {
      map.setView(clinicPositions[0], 14, { animate: true });
      return;
    }

    if (clinicPositions.length > 1) {
      map.fitBounds(clinicPositions, { padding: [36, 36], maxZoom: 14, animate: true });
    }
  }, [center, clinicPositions, focusPosition, map, userLocation]);

  return null;
}

export default function ClinicMap({ clinics, focusClinicId, userLocation }) {
  const defaultCenter = [17.385, 78.4867];
  const center = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter;
  const clinicsWithLocation = clinics.filter((clinic) => clinic.location?.coordinates?.length === 2);
  const clinicPositions = clinicsWithLocation.map((clinic) => {
    const [longitude, latitude] = clinic.location.coordinates;
    return [latitude, longitude];
  });
  const focusedClinic = clinicsWithLocation.find((clinic) => clinic._id === focusClinicId);
  const focusPosition = focusedClinic
    ? [focusedClinic.location.coordinates[1], focusedClinic.location.coordinates[0]]
    : null;

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:sticky lg:top-24">
      <MapContainer center={center} zoom={userLocation ? 12 : 11} scrollWheelZoom className="h-full w-full">
        <MapViewport center={center} clinicPositions={clinicPositions} focusPosition={focusPosition} userLocation={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clinicsWithLocation.map((clinic) => {
          const [longitude, latitude] = clinic.location.coordinates;
          return (
            <Marker key={clinic._id} position={[latitude, longitude]} icon={clinicIcon}>
              <Popup>
                <strong>{clinic.name}</strong>
                <br />
                {clinic.city || 'Veterinary clinic'}
                <br />
                <Link to={`/find-vets/${clinic._id}`}>View details</Link>
              </Popup>
            </Marker>
          );
        })}
        {userLocation && <CircleMarker center={[userLocation.latitude, userLocation.longitude]} radius={8} pathOptions={{ color: 'var(--theme-map-line)', fillColor: 'var(--theme-map-fill)', fillOpacity: 1 }}><Popup>Your current location</Popup></CircleMarker>}
      </MapContainer>
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{userLocation ? 'Nearby clinics' : 'Clinic locations'}</div>
    </div>
  );
}