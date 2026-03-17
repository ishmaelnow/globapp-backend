import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapBackground.css';

const DEFAULT_CENTER = [37.7749, -122.4194]; // San Francisco

export default function MapBackground() {
  return (
    <div className="map-bg">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        className="map-bg__map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <div className="map-bg__shade" aria-hidden="true" />
    </div>
  );
}
