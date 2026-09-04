import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

const pickerIcon = L.divIcon({
  className: 'clinic-marker clinic-marker-picker',
  html: '<span></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function LocationEvents({ onSelect }) {
  useMapEvents({
    click: (event) => onSelect(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

function PickerViewport({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
}

export default function ClinicLocationPicker({ latitude, longitude, onChange }) {
  const hasPosition = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  const position = hasPosition ? [Number(latitude), Number(longitude)] : [17.385, 78.4867];

  const selectPosition = (nextLatitude, nextLongitude) => {
    onChange({ latitude: nextLatitude.toFixed(6), longitude: nextLongitude.toFixed(6) });
  };

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">2. Pick location on the map</h3>
          <p className="mt-1 text-xs text-slate-500">Click the map or drag the marker to place your clinic.</p>
        </div>
        <span className="text-right text-xs font-semibold text-teal-700">{hasPosition ? 'Location selected' : 'Choose a location'}</span>
      </div>
      <div className="h-72 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={position} zoom={hasPosition ? 14 : 11} scrollWheelZoom className="h-full w-full">
          <PickerViewport position={position} />
          <LocationEvents onSelect={selectPosition} />
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {hasPosition && <Marker position={position} icon={pickerIcon} draggable eventHandlers={{ dragend: (event) => { const markerPosition = event.target.getLatLng(); selectPosition(markerPosition.lat, markerPosition.lng); } }} />}
        </MapContainer>
      </div>
      {hasPosition && <p className="mt-2 text-xs text-slate-500">Selected coordinates: {latitude}, {longitude}</p>}
    </div>
  );
}