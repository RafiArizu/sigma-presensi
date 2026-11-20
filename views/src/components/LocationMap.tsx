import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import styles from '../styles/LocationMap.module.css';

export type LocationMapValue = { latitude: number; longitude: number; radiusMeters: number };
type LocationMapProps = { latitude: number; longitude: number; radiusMeters: number; onChange: (value: LocationMapValue) => void; className?: string; zoom?: number; interactive?: boolean };

const defaultIcon = L.icon({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

export default function LocationMap({ latitude, longitude, radiusMeters, onChange, className, zoom = 15, interactive = true }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center: L.LatLngExpression = [latitude, longitude];
    const map = L.map(containerRef.current, { attributionControl: true }).setView(center, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    const marker = L.marker(center, { draggable: interactive, icon: defaultIcon }).addTo(map);
    const circle = L.circle(center, { radius: radiusMeters, color: '#244E96', fillColor: '#2C58A2', fillOpacity: 0.16, weight: 2 }).addTo(map);
    if (interactive) {
      marker.on('dragend', () => { const position = marker.getLatLng(); circle.setLatLng(position); onChangeRef.current({ latitude: position.lat, longitude: position.lng, radiusMeters: circle.getRadius() }); });
      map.on('click', (event) => { marker.setLatLng(event.latlng); circle.setLatLng(event.latlng); onChangeRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng, radiusMeters: circle.getRadius() }); });
    }
    mapRef.current = map; markerRef.current = marker; circleRef.current = circle;
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; circleRef.current = null; };
  }, []);

  useEffect(() => {
    const marker = markerRef.current; const circle = circleRef.current; const map = mapRef.current;
    if (!marker || !circle || !map) return;
    const position = L.latLng(latitude, longitude);
    marker.setLatLng(position); circle.setLatLng(position); circle.setRadius(Math.max(1, radiusMeters));
  }, [latitude, longitude, radiusMeters]);

  return <div ref={containerRef} className={`${styles.map} ${className ?? ''}`} role="application" aria-label="Peta pengaturan lokasi dan radius" />;
}
