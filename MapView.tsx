
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Map as MapIcon } from 'lucide-react';
import { User, UserRole } from './types';
import { PUSKESMAS_INFO } from './constants';

interface MapViewProps {
  users: User[];
}

export const MapView: React.FC<MapViewProps> = ({ users }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      const map = L.map(mapRef.current).setView([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], 14);
      leafletMap.current = map;
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const clinicIcon = L.divIcon({
        html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></div>`,
        iconSize: [32, 32],
        className: 'custom-div-icon'
      });

      const patientIcon = L.divIcon({
        html: `<div class="bg-red-500 p-1.5 rounded-full border-2 border-white shadow-md text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
        iconSize: [24, 24],
        className: 'custom-div-icon'
      });

      L.marker([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], { icon: clinicIcon }).addTo(map).bindPopup(`<b>${PUSKESMAS_INFO.name}</b>`);

      users.filter(u => u.role === UserRole.USER && u.lat).forEach(p => {
        L.marker([p.lat!, p.lng!], { icon: patientIcon }).addTo(map).bindPopup(`<b>${p.name}</b><br/>Hamil: ${p.pregnancyMonth} Bln`);
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [users]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="text-blue-600" size={24} />
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Peta Sebaran Ibu Hamil</h2>
      </div>
      <div ref={mapRef} className="h-[600px] w-full border border-gray-100 rounded-3xl overflow-hidden z-10 shadow-inner"></div>
    </div>
  );
};
