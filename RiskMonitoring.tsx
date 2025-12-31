import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, Activity, Phone, Clock, ClipboardList, TrendingUp, 
  Calendar, ArrowRightCircle, CheckCircle2, PlusCircle, Check, 
  MapPin, Search, Filter, Stethoscope, Heart
} from 'lucide-react';
import { User, ANCVisit, AppState, UserRole } from './types';
import { WILAYAH_DATA } from './constants';

interface RiskMonitoringProps {
  state: AppState;
  onNavigateToPatient: (patientId: string) => void;
  onAddVisit: (u: User) => void;
  onToggleVisitStatus: (visitId: string) => void;
}

export const RiskMonitoring: React.FC<RiskMonitoringProps> = ({ state, onNavigateToPatient, onAddVisit, onToggleVisitStatus }) => {
  const { users, ancVisits } = state;
  const [filterKelurahan, setFilterKelurahan] = useState<string>('ALL');

  // Analisis Risiko Medis & Triase
  const riskAnalysis = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        const completedVisits = patientVisits.filter(v => v.status === 'COMPLETED');
        const latestVisit = patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0];
        
        let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        let riskFlags: string[] = [];

        // Kriteria Medis High Risk (Triase Merah)
        if (latestVisit?.bloodPressure) {
          const [systolic, diastolic] = latestVisit.bloodPressure.split('/').map(Number);
          if (systolic >= 140 || diastolic >= 90) {
            riskLevel = 'HIGH';
            riskFlags.push('Hipertensi Berat');
          } else if (systolic >= 130 || diastolic >= 85) {
            // Fix: Simplified assignment as riskLevel is guaranteed to be 'LOW' here due to logic flow, 
            // avoiding a TypeScript comparison error between non-overlapping types 'LOW' and 'HIGH'.
            riskLevel = 'MEDIUM';
            riskFlags.push('Kecenderungan HT');
          }
        }

        if (latestVisit?.edema) {
          riskLevel = 'HIGH';
          riskFlags.push('Edema (Bengkak)');
        }

        // Analisis Riwayat Penyakit (Triase Kuning)
        const medHistory = patient.medicalHistory.toLowerCase();
        if (medHistory && !['n/a', '-', 'tidak ada'].includes(medHistory)) {
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
          riskFlags.push(patient.medicalHistory);
        }

        return { ...patient, riskLevel, riskFlags, latestVisit };
      });
  }, [users, ancVisits]);

  // Statistik Berbasis Wilayah (Kelurahan)
  const regionStats = useMemo(() => {
    const stats: Record<string, { total: number, high: number, med: number, low: number, prevalentDiseases: Record<string, number> }> = {};
    
    // Inisialisasi data dari constants
    WILAYAH_DATA["Pasar Minggu"].forEach(kel => {
      stats[kel] = { total: 0, high: 0, med: 0, low: 0, prevalentDiseases: {} };
    });

    riskAnalysis.forEach(p => {
      const kel = p.kelurahan;
      if (stats[kel]) {
        stats[kel].total++;
        if (p.riskLevel === 'HIGH') stats[kel].high++;
        else if (p.riskLevel === 'MEDIUM') stats[kel].med++;
        else stats[kel].low++;

        if (p.medicalHistory && !['n/a', '-', 'tidak ada'].includes(p.medicalHistory.toLowerCase())) {
          const disease = p.medicalHistory.toUpperCase();
          stats[kel].prevalentDiseases[disease] = (stats[kel].prevalentDiseases[disease] || 0) + 1;
        }
      }
    });

    return stats;
  }, [riskAnalysis]);

  const filteredRiskList = riskAnalysis.filter(p => 
    filterKelurahan === 'ALL' || p.kelurahan === filterKelurahan
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. Wilayah Analytics Dashboard */}
      <div className="bg-indigo-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4 flex items-center gap-4">
              <Activity size={36} className="text-indigo-400" /> Triase Wilayah
            </h2>
            <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest leading-relaxed">
              Pemetaan beban klinis ibu hamil per kelurahan di wilayah kerja Kecamatan Pasar Minggu.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">High Risk</p>
                <p className="text-3xl font-black text-red-400">{riskAnalysis.filter(p => p.riskLevel === 'HIGH').length}</p>
             </div>
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Med Risk</p>
                <p className="text-3xl font-black text-orange-400">{riskAnalysis.filter(p => p.riskLevel === 'MEDIUM').length}</p>
             </div>
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Kelurahan</p>
                <p className="text-3xl font-black">{Object.keys(regionStats).length}</p>
             </div>
          </div>
        </div>
        <MapPin size={300} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
      </div>

      {/* 2. Tabel Statistik Per Kelurahan */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
           <h3 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
             <ClipboardList size={22} className="text-indigo-600" /> Distribusi Beban Klinis per Kelurahan
           </h3>
           <div className="flex items-center gap-3">
             <Filter size={16} className="text-gray-400" />
             <select 
               value={filterKelurahan} 
               onChange={(e) => setFilterKelurahan(e.target.value)}
               className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100"
             >
               <option value="ALL">Semua Kelurahan</option>
               {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
             </select>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-8 py-5">Kelurahan</th>
                <th className="px-8 py-5">Total Pasien</th>
                <th className="px-8 py-5">Triase Merah (High)</th>
                <th className="px-8 py-5">Triase Kuning (Med)</th>
                <th className="px-8 py-5">Riwayat Dominan</th>
                <th className="px-8 py-5">Indikator Resiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(regionStats).map(([kel, stat]) => (
                <tr key={kel} className={`hover:bg-gray-50/50 transition-colors ${filterKelurahan === kel ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-8 py-6 font-black text-gray-900 uppercase text-xs">{kel}</td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{stat.total} Jiwa</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black">{stat.high} Pasien</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black">{stat.med} Pasien</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stat.prevalentDiseases).length > 0 ? (
                        Object.entries(stat.prevalentDiseases).map(([disease, count]) => (
                          <span key={disease} className="bg-indigo-50 text-indigo-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">
                            {disease} ({count})
                          </span>
                        ))
                      ) : <span className="text-[8px] text-gray-300 italic font-bold">NIHIL</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                       <div 
                         className="h-full bg-red-500" 
                         style={{ width: `${(stat.high / (stat.total || 1)) * 100}%` }} 
                       />
                       <div 
                         className="h-full bg-orange-400" 
                         style={{ width: `${(stat.med / (stat.total || 1)) * 100}%` }} 
                       />
                       <div 
                         className="h-full bg-emerald-400" 
                         style={{ width: `${(stat.low / (stat.total || 1)) * 100}%` }} 
                       />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Daftar Pasien Per Kelurahan (Triage List) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="p-8 border-b bg-gray-900 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tighter flex items-center gap-3">
            <Stethoscope size={22} className="text-indigo-400" /> Detail Pasien per Wilayah
          </h3>
          <span className="text-[9px] font-black px-4 py-1.5 bg-white/10 rounded-full uppercase tracking-widest">
            {filterKelurahan === 'ALL' ? 'Semua Wilayah' : `Kelurahan: ${filterKelurahan}`}
          </span>
        </div>
        <div className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRiskList.length > 0 ? filteredRiskList.map(p => (
                <div key={p.id} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:shadow-xl ${
                  p.riskLevel === 'HIGH' ? 'bg-red-50/50 border-red-100' : 
                  p.riskLevel === 'MEDIUM' ? 'bg-orange-50/50 border-orange-100' : 
                  'bg-white border-gray-50'
                }`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${
                        p.riskLevel === 'HIGH' ? 'bg-red-500 text-white' : 
                        p.riskLevel === 'MEDIUM' ? 'bg-orange-500 text-white' : 
                        'bg-indigo-600 text-white'
                      }`}>
                         <Heart size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.kelurahan}</p>
                        <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                           p.riskLevel === 'HIGH' ? 'bg-red-600 text-white' : 
                           p.riskLevel === 'MEDIUM' ? 'bg-orange-600 text-white' : 
                           'bg-emerald-600 text-white'
                        }`}>
                           Triase: {p.riskLevel}
                        </span>
                      </div>
                   </div>
                   
                   <h4 className="text-xl font-black text-gray-900 leading-tight mb-1">{p.name}</h4>
                   <p className="text-xs font-bold text-gray-400 mb-6">{p.phone}</p>
                   
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase">
                         <TrendingUp size={14} className="text-indigo-400" /> Tensi: {p.latestVisit?.bloodPressure || 'N/A'}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                         {p.riskFlags.map((flag, idx) => (
                           <span key={idx} className="bg-white border border-gray-100 text-[8px] font-black px-3 py-1.5 rounded-xl uppercase shadow-sm">
                             {flag}
                           </span>
                         ))}
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-gray-100/50 flex gap-3">
                      <button 
                        onClick={() => onNavigateToPatient(p.id)}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 text-[9px] font-black uppercase rounded-xl hover:bg-gray-50 transition-all"
                      >
                         Lihat Riwayat
                      </button>
                      <button 
                        onClick={() => onAddVisit(p)}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                         <PlusCircle size={14} />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tidak ada data pasien untuk kriteria ini</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
