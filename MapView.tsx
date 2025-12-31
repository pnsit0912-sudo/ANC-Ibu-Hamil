
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Map as MapIcon, Info, Users, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { User, UserRole } from './types';
import { PUSKESMAS_INFO } from './constants';
import { getRiskCategory } from './utils';

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

      // Icon Puskesmas (Pusat Operasional)
      const clinicIcon = L.divIcon({
        html: `<div class="bg-indigo-600 p-2.5 rounded-2xl border-4 border-white shadow-2xl text-white flex items-center justify-center rotate-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></div>`,
        iconSize: [42, 42],
        className: 'custom-div-icon'
      });

      L.marker([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], { icon: clinicIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-4 min-w-[200px]">
            <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pusat Layanan</p>
            <h4 class="font-black text-gray-900 text-lg uppercase tracking-tighter">${PUSKESMAS_INFO.name}</h4>
            <p class="text-[10px] font-bold text-gray-400 mt-2 uppercase">${PUSKESMAS_INFO.address}</p>
          </div>
        `);

      // Pemetaan Marker Pasien Berdasarkan Triase
      users.filter(u => u.role === UserRole.USER && u.lat).forEach(p => {
        const risk = getRiskCategory(p.totalRiskScore);
        
        // Pilih warna berdasarkan triase
        let markerBg = 'bg-emerald-500';
        if (risk.label === 'HITAM') markerBg = 'bg-slate-950';
        else if (risk.label === 'MERAH') markerBg = 'bg-red-600';
        else if (risk.label === 'KUNING') markerBg = 'bg-yellow-400';

        const patientIcon = L.divIcon({
          html: `<div class="${markerBg} p-2 rounded-full border-2 border-white shadow-xl text-white flex items-center justify-center animate-in zoom-in-50">
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                 </div>`,
          iconSize: [28, 28],
          className: 'custom-div-icon'
        });

        L.marker([p.lat!, p.lng!], { icon: patientIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-6 min-w-[240px] font-sans">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identitas Pasien</p>
                  <h4 class="font-black text-gray-900 text-xl tracking-tighter uppercase leading-none">${p.name}</h4>
                </div>
                <div class="px-3 py-1.5 ${risk.color} rounded-xl text-[9px] font-black uppercase">
                  ${risk.label}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Usia Hamil</p>
                  <p class="text-xs font-black text-gray-900">${p.pregnancyMonth} Bulan</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <p class="text-[8px] font-black text-gray-400 uppercase">Skor SPR</p>
                  <p class="text-xs font-black text-indigo-600">${p.totalRiskScore + 2}</p>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Alamat Domisili</p>
                <p class="text-[10px] font-bold text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">${p.address}, ${p.kelurahan}</p>
              </div>

              <div class="mt-6 flex gap-2">
                 <a href="tel:${p.phone}" class="flex-1 py-3 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase text-center shadow-lg shadow-indigo-100 no-underline">Hubungi</a>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-leaflet-popup'
          });
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-4">
            <MapIcon className="text-indigo-600" size={32} /> Geospasial Ibu Hamil
          </h2>
          {/* Fixed: Use className instead of class */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            Monitoring Sebaran Risiko di Wilayah Kerja Puskesmas
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase">
            {/* Fixed: Use className instead of class */}
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Kritis
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[9px] font-black uppercase">
            Risiko Tinggi
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[9px] font-black uppercase">
            Stabil
          </div>
        </div>
      </div>

      {/* Container Peta */}
      <div className="bg-white p-8 rounded-[4rem] shadow-sm border border-gray-100 relative overflow-hidden h-[700px]">
        <div ref={mapRef} className="h-full w-full rounded-[3rem] overflow-hidden z-10 shadow-inner border border-gray-100"></div>
        
        {/* Floating Stats Layer */}
        <div className="absolute bottom-16 right-16 z-[20] bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-2xl max-w-xs animate-in slide-in-from-right-10">
           <h5 className="text-xs font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
             <ShieldAlert size={16} className="text-indigo-600" /> Ringkasan Wilayah
           </h5>
           <div className="space-y-3">
             <div className="flex justify-between items-center">
                {/* Fixed: Use className instead of class */}
                <span className="text-[10px] font-bold text-gray-500 uppercase">Total Terdata</span>
                {/* Fixed: Use className instead of class and JSX curly braces */}
                <span className="text-sm font-black text-gray-900">{users.filter(u => u.role === UserRole.USER).length}</span>
             </div>
             <div className="h-1 bg-gray-100 rounded-full">
                {/* Fixed: Use className instead of class and style object instead of string */}
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }}></div>
             </div>
             {/* Fixed: Use className instead of class */}
             <p className="text-[9px] font-bold text-gray-400 uppercase italic">Sinkronisasi Real-time Aktif</p>
           </div>
        </div>
      </div>
    </div>
  );
};
