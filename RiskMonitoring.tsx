
import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, Activity, ClipboardList, TrendingUp, 
  Search, Filter, Stethoscope, Heart, AlertCircle, ShieldAlert,
  ArrowRight, CheckCircle2, Info, MapPin, BarChart3, PieChart
} from 'lucide-react';
import { User, ANCVisit, AppState, UserRole } from './types';
import { WILAYAH_DATA } from './constants';
import { getRiskCategory } from './utils';

// Define explicit interface for statistics to fix type errors
interface RegionStats {
  total: number;
  hitam: number;
  merah: number;
  kuning: number;
  hijau: number;
}

interface RiskMonitoringProps {
  state: AppState;
  onViewProfile: (patientId: string) => void;
  onAddVisit: (u: User) => void;
  onToggleVisitStatus: (visitId: string) => void;
}

export const RiskMonitoring: React.FC<RiskMonitoringProps> = ({ state, onViewProfile, onAddVisit, onToggleVisitStatus }) => {
  const { users, ancVisits } = state;
  const [filterKelurahan, setFilterKelurahan] = useState<string>('ALL');

  // Integrasi Skoring Terpusat
  const riskAnalysis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        const latestVisit = patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0];
        
        // GUNAKAN FUNGSI PUSAT (utils.ts)
        const risk = getRiskCategory(patient.totalRiskScore, latestVisit);
        
        let riskFlags: string[] = [];

        // Deteksi Flag Tambahan untuk Tampilan Monitoring
        if (latestVisit?.nextVisitDate && latestVisit.nextVisitDate < today) {
           riskFlags.push('KUNJUNGAN TERLAMBAT');
        }
        if (latestVisit?.bloodPressure) {
          const [sys, dia] = latestVisit.bloodPressure.split('/').map(Number);
          if (sys >= 140 || dia >= 90) riskFlags.push('Hipertensi');
        }
        if (latestVisit?.fetalMovement === 'Kurang Aktif') riskFlags.push('Gerak Janin ↓');
        if (latestVisit?.edema) riskFlags.push('Edema (+)');

        return { ...patient, riskLevel: risk.label, riskFlags, latestVisit, priority: risk.priority };
      });
  }, [users, ancVisits]);

  // Agregasi Statistik Wilayah
  const statsAggregation = useMemo(() => {
    const kecStats: Record<string, RegionStats> = {};
    const kelStats: Record<string, RegionStats> = {};

    Object.keys(WILAYAH_DATA).forEach(kec => {
      kecStats[kec] = { total: 0, hitam: 0, merah: 0, kuning: 0, hijau: 0 };
      WILAYAH_DATA[kec as keyof typeof WILAYAH_DATA].forEach(kel => {
        kelStats[kel] = { total: 0, hitam: 0, merah: 0, kuning: 0, hijau: 0 };
      });
    });

    riskAnalysis.forEach(p => {
      const kec = p.kecamatan || "Pasar Minggu";
      const kel = p.kelurahan;
      const levelKey = p.riskLevel.toLowerCase() as 'hitam'|'merah'|'kuning'|'hijau';

      if (kecStats[kec]) {
        kecStats[kec].total++;
        kecStats[kec][levelKey]++;
      }
      if (kelStats[kel]) {
        kelStats[kel].total++;
        kelStats[kel][levelKey]++;
      }
    });

    return { kecStats, kelStats };
  }, [riskAnalysis]);

  const filteredRiskList = riskAnalysis.filter(p => 
    filterKelurahan === 'ALL' || p.kelurahan === filterKelurahan
  ).sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 1. Dashboard Ringkasan Eksekutif */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Kritis (Hitam)', count: riskAnalysis.filter(p => p.riskLevel === 'HITAM').length, color: 'bg-slate-950', text: 'text-white' },
          { label: 'Tinggi (Merah)', count: riskAnalysis.filter(p => p.riskLevel === 'MERAH').length, color: 'bg-red-600', text: 'text-white' },
          { label: 'Sedang (Kuning)', count: riskAnalysis.filter(p => p.riskLevel === 'KUNING').length, color: 'bg-yellow-400', text: 'text-yellow-950' },
          { label: 'Stabil (Hijau)', count: riskAnalysis.filter(p => p.riskLevel === 'HIJAU').length, color: 'bg-emerald-500', text: 'text-white' },
        ].map((item, i) => (
          <div key={i} className={`${item.color} ${item.text} p-8 rounded-[2.5rem] shadow-xl border border-white/10 group hover:scale-105 transition-all`}>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{item.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-4xl font-black leading-none">{item.count}</p>
              <Activity size={24} className="opacity-30 group-hover:animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Visualisasi Analitik */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={28} />
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Analitik Beban Risiko Wilayah</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 h-full">
              <div className="mb-8">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-indigo-600" /> Risk Density Kecamatan
                </h4>
              </div>

              <div className="space-y-8">
                {/* Fixed property access on unknown type by casting Object.entries */}
                {(Object.entries(statsAggregation.kecStats) as [string, RegionStats][]).map(([kec, stat]) => {
                  const highRiskCount = stat.hitam + stat.merah;
                  const density = stat.total > 0 ? (highRiskCount / stat.total) * 100 : 0;
                  
                  return (
                    <div key={kec} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xl font-black text-gray-900 tracking-tighter">{kec}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Total: {stat.total} Pasien</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${density > 30 ? 'text-red-600' : 'text-indigo-600'}`}>{density.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="h-10 w-full bg-gray-50 rounded-2xl overflow-hidden flex border border-gray-100 p-1">
                        <div className="h-full bg-slate-950 rounded-l-xl" style={{ width: `${(stat.hitam / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${(stat.merah / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-yellow-400" style={{ width: `${(stat.kuning / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-emerald-400 rounded-r-xl" style={{ width: `${(stat.hijau / (stat.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" /> Sebaran Risiko Per Kelurahan
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fixed property access on unknown type by casting Object.entries */}
                {(Object.entries(statsAggregation.kelStats) as [string, RegionStats][]).map(([kel, stat]) => {
                  const highRiskCount = stat.hitam + stat.merah;
                  const density = stat.total > 0 ? (highRiskCount / stat.total) * 100 : 0;
                  
                  return (
                    <div key={kel} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${density > 30 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="font-black text-gray-900 text-sm uppercase leading-none mb-1">{kel}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase">Total: {stat.total}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${density > 20 ? 'text-red-600' : 'text-indigo-600'}`}>{density.toFixed(0)}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { col: 'bg-slate-950', val: stat.hitam, label: 'Hitam' },
                          { col: 'bg-red-500', val: stat.merah, label: 'Merah' },
                          { col: 'bg-yellow-400', val: stat.kuning, label: 'Kuning' },
                          { col: 'bg-emerald-400', val: stat.hijau, label: 'Hijau' },
                        ].map((bar, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-14 text-[8px] font-black text-gray-400 uppercase">{bar.label}</div>
                            <div className="flex-1 h-2 bg-gray-100/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${bar.col} transition-all duration-1000`} 
                                style={{ width: stat.total > 0 ? `${(bar.val / stat.total) * 100}%` : '0%' }}
                              />
                            </div>
                            <div className="w-4 text-[9px] font-black text-gray-900 text-right">{bar.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monitoring Pasien Prioritas (Detail) */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
              <Heart size={28} className="text-red-600" /> Daftar Pantau Terpadu
            </h3>
            <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center gap-2 shadow-sm">
              <Filter size={14} className="text-gray-400 ml-2" />
              <select 
                value={filterKelurahan} 
                onChange={(e) => setFilterKelurahan(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase outline-none pr-4 cursor-pointer"
              >
                <option value="ALL">Seluruh Wilayah</option>
                {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRiskList.map(p => (
            <div 
              key={p.id} 
              className={`group relative p-8 rounded-[3.5rem] border-2 transition-all hover:scale-[1.02] hover:shadow-2xl ${
                p.riskLevel === 'HITAM' ? 'bg-slate-950 border-slate-900 text-white shadow-slate-200' : 
                p.riskLevel === 'MERAH' ? 'bg-red-50 border-red-100' : 
                p.riskLevel === 'KUNING' ? 'bg-yellow-50 border-yellow-100' : 
                'bg-white border-gray-50'
              }`}
            >
              <div className="mb-6">
                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                  p.riskLevel === 'HITAM' ? 'bg-white/10 border-white/20 text-red-400' : 
                  p.riskLevel === 'MERAH' ? 'bg-red-500 border-red-600 text-white' : 
                  p.riskLevel === 'KUNING' ? 'bg-yellow-400 border-yellow-500 text-yellow-950' : 
                  'bg-emerald-500 border-emerald-600 text-white'
                }`}>
                  Triase {p.riskLevel}
                </span>
                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-3 ${p.riskLevel === 'HITAM' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Kelurahan {p.kelurahan}
                </p>
              </div>

              <div className="mb-6">
                <h4 className={`text-2xl font-black leading-tight tracking-tighter ${p.riskLevel === 'HITAM' ? 'text-white' : 'text-gray-900'}`}>
                  {p.name}
                </h4>
                <p className={`text-[10px] font-bold mt-1 ${p.riskLevel === 'HITAM' ? 'text-slate-400' : 'text-gray-500'}`}>
                   Skor Dasar: {p.totalRiskScore + 2}
                </p>
              </div>

              <div className={`space-y-3 p-5 rounded-[1.5rem] mb-8 ${p.riskLevel === 'HITAM' ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-current/5'}`}>
                 <div className="flex flex-wrap gap-2">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'HITAM' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                     TD: {p.latestVisit?.bloodPressure || 'N/A'}
                   </span>
                   {p.riskFlags.map((flag, idx) => (
                     <span key={idx} className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'HITAM' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                       {flag}
                     </span>
                   ))}
                   {p.riskFlags.length === 0 && (
                     <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                       <CheckCircle2 size={10} /> Stabil
                     </span>
                   )}
                 </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => onViewProfile(p.id)} className={`flex-1 py-4 text-[9px] font-black uppercase rounded-2xl transition-all ${p.riskLevel === 'HITAM' ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white'}`}>Profil Medis</button>
                <button onClick={() => onAddVisit(p)} className={`p-4 rounded-2xl transition-all ${p.riskLevel === 'HITAM' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-400'}`}><Activity size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
