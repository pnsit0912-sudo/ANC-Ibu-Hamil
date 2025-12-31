
import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, Activity, ClipboardList, TrendingUp, 
  Search, Filter, Stethoscope, Heart, AlertCircle, ShieldAlert,
  ArrowRight, CheckCircle2, Info, MapPin
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

  // Refined Medical Triage Logic (OBGYN & MARS Standard)
  const riskAnalysis = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        const latestVisit = patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0];
        
        let riskLevel: 'BLACK' | 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
        let riskFlags: string[] = [];

        // 1. Blood Pressure Check
        if (latestVisit?.bloodPressure) {
          const [systolic, diastolic] = latestVisit.bloodPressure.split('/').map(Number);
          
          // @fix: Removed redundant comparisons against riskLevel in the initial Blood Pressure check block.
          // Since riskLevel is initialized to 'GREEN' right before this if-statement, it is guaranteed to be 'GREEN'
          // in the subsequent else-if branches of the first top-level if-block that modifies it.
          if (systolic >= 160 || diastolic >= 110) {
            riskLevel = 'BLACK';
            riskFlags.push('KRISIS HIPERTENSI');
          } else if (systolic >= 140 || diastolic >= 90) {
            riskLevel = 'RED';
            riskFlags.push('Hipertensi Grade 2');
          } else if (systolic >= 130 || diastolic >= 85) {
            riskLevel = 'YELLOW';
            riskFlags.push('Pre-Hipertensi');
          }
        }

        // 2. Fetal Movement Check
        if (latestVisit?.fetalMovement === 'Tidak Ada') {
           riskLevel = 'BLACK';
           riskFlags.push('GAWAT JANIN (ABSENT)');
        } else if (latestVisit?.fetalMovement === 'Kurang Aktif') {
           if (riskLevel !== 'BLACK') riskLevel = 'RED';
           riskFlags.push('Gerakan Janin Berkurang');
        }

        // 3. Edema Check
        if (latestVisit?.edema) {
          if (riskLevel !== 'BLACK') riskLevel = 'RED';
          riskFlags.push('Edema (+)');
        }

        // 4. Medical History Check (Fixed Logic for Normal Patients)
        const medHistory = (patient.medicalHistory || "").toLowerCase().trim();
        const ignoreTerms = ['n/a', '-', 'tidak ada', 'none', 'normal', 'sehat', 'tidak', 'null'];
        const hasHistory = medHistory.length > 0 && !ignoreTerms.includes(medHistory);

        if (hasHistory) {
          if (riskLevel === 'GREEN') riskLevel = 'YELLOW';
          riskFlags.push(`Riwayat: ${patient.medicalHistory}`);
        }

        return { ...patient, riskLevel, riskFlags, latestVisit };
      });
  }, [users, ancVisits]);

  const regionStats = useMemo(() => {
    const stats: Record<string, { total: number, black: number, red: number, yellow: number, green: number }> = {};
    WILAYAH_DATA["Pasar Minggu"].forEach(kel => {
      stats[kel] = { total: 0, black: 0, red: 0, yellow: 0, green: 0 };
    });

    riskAnalysis.forEach(p => {
      const kel = p.kelurahan;
      if (stats[kel]) {
        stats[kel].total++;
        if (p.riskLevel === 'BLACK') stats[kel].black++;
        else if (p.riskLevel === 'RED') stats[kel].red++;
        else if (p.riskLevel === 'YELLOW') stats[kel].yellow++;
        else stats[kel].green++;
      }
    });
    return stats;
  }, [riskAnalysis]);

  const filteredRiskList = riskAnalysis.filter(p => 
    filterKelurahan === 'ALL' || p.kelurahan === filterKelurahan
  ).sort((a, b) => {
    const order = { BLACK: 0, RED: 1, YELLOW: 2, GREEN: 3 };
    return order[a.riskLevel] - order[b.riskLevel];
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Executive Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Kritis (Hitam)', count: riskAnalysis.filter(p => p.riskLevel === 'BLACK').length, color: 'bg-slate-950', text: 'text-white' },
          { label: 'Tinggi (Merah)', count: riskAnalysis.filter(p => p.riskLevel === 'RED').length, color: 'bg-red-600', text: 'text-white' },
          { label: 'Sedang (Kuning)', count: riskAnalysis.filter(p => p.riskLevel === 'YELLOW').length, color: 'bg-yellow-400', text: 'text-yellow-950' },
          { label: 'Stabil (Hijau)', count: riskAnalysis.filter(p => p.riskLevel === 'GREEN').length, color: 'bg-emerald-500', text: 'text-white' },
        ].map((item, i) => (
          <div key={i} className={`${item.color} ${item.text} p-8 rounded-[2.5rem] shadow-xl border border-white/10`}>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{item.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-4xl font-black leading-none">{item.count}</p>
              <Activity size={24} className="opacity-30" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Region Heatmap Table */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" /> Sebaran Wilayah
            </h3>
            <div className="space-y-6">
              {Object.entries(regionStats).map(([kel, stat]) => (
                <div key={kel} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-900">{kel}</span>
                    <span className="text-gray-400">{stat.total} Pasien</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-950" style={{ width: `${(stat.black / (stat.total || 1)) * 100}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${(stat.red / (stat.total || 1)) * 100}%` }} />
                    <div className="h-full bg-yellow-400" style={{ width: `${(stat.yellow / (stat.total || 1)) * 100}%` }} />
                    <div className="h-full bg-emerald-400" style={{ width: `${(stat.green / (stat.total || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black tracking-tighter mb-2 relative z-10">Standar Triase ANC</h3>
            <p className="text-indigo-300 text-xs font-bold leading-relaxed relative z-10">Sistem ini menggunakan algoritma deteksi dini eklamsia dan gawat janin berbasis rekam medis terpadu.</p>
            <ShieldAlert size={120} className="absolute -right-10 -bottom-10 opacity-10" />
          </div>
        </div>

        {/* Detailed Patient Cards */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Monitoring Prioritas</h3>
              <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center gap-2">
                <Filter size={14} className="text-gray-400 ml-2" />
                <select 
                  value={filterKelurahan} 
                  onChange={(e) => setFilterKelurahan(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase outline-none pr-4"
                >
                  <option value="ALL">Semua Kelurahan</option>
                  {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-950" title="Hitam: Kritis" />
              <div className="w-3 h-3 rounded-full bg-red-500" title="Merah: Tinggi" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" title="Kuning: Sedang" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" title="Hijau: Normal" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRiskList.length > 0 ? filteredRiskList.map(p => (
              <div 
                key={p.id} 
                className={`group relative p-8 rounded-[3rem] border-2 transition-all hover:scale-[1.02] hover:shadow-2xl ${
                  p.riskLevel === 'BLACK' ? 'bg-slate-950 border-slate-900 text-white shadow-slate-200' : 
                  p.riskLevel === 'RED' ? 'bg-red-50 border-red-100 shadow-red-100/30' : 
                  p.riskLevel === 'YELLOW' ? 'bg-yellow-50 border-yellow-100 shadow-yellow-100/20' : 
                  'bg-white border-gray-50 shadow-gray-100'
                }`}
              >
                {p.riskLevel === 'BLACK' && (
                  <div className="absolute top-6 right-6 p-3 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-600/50">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                )}
                
                <div className="mb-6">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                    p.riskLevel === 'BLACK' ? 'bg-white/10 border-white/20 text-red-400' : 
                    p.riskLevel === 'RED' ? 'bg-red-500 border-red-600 text-white' : 
                    p.riskLevel === 'YELLOW' ? 'bg-yellow-400 border-yellow-500 text-yellow-950' : 
                    'bg-emerald-500 border-emerald-600 text-white'
                  }`}>
                    Triase {p.riskLevel}
                  </span>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-3 ${p.riskLevel === 'BLACK' ? 'text-slate-500' : 'text-gray-400'}`}>
                    Kelurahan {p.kelurahan}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className={`text-2xl font-black leading-tight tracking-tighter ${p.riskLevel === 'BLACK' ? 'text-white' : 'text-gray-900'}`}>
                    {p.name}
                  </h4>
                  <p className={`text-[10px] font-bold mt-1 ${p.riskLevel === 'BLACK' ? 'text-slate-400' : 'text-gray-500'}`}>
                    ID: {p.id} | {p.phone}
                  </p>
                </div>

                <div className={`space-y-3 p-5 rounded-[1.5rem] mb-8 ${p.riskLevel === 'BLACK' ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-current/5'}`}>
                   <div className="flex items-center justify-between">
                     <span className={`text-[9px] font-black uppercase ${p.riskLevel === 'BLACK' ? 'text-slate-400' : 'text-gray-400'}`}>Tanda Klinis</span>
                     <TrendingUp size={14} className="opacity-40" />
                   </div>
                   <div className="flex flex-wrap gap-2">
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'BLACK' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                       BP: {p.latestVisit?.bloodPressure || 'N/A'}
                     </span>
                     {p.riskFlags.map((flag, idx) => (
                       <span key={idx} className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'BLACK' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                         {flag}
                       </span>
                     ))}
                     {p.riskFlags.length === 0 && (
                       <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                         <CheckCircle2 size={10} /> Parameter Normal
                       </span>
                     )}
                   </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => onNavigateToPatient(p.id)}
                    className={`flex-1 py-4 text-[9px] font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${
                      p.riskLevel === 'BLACK' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Buka Profil <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => onAddVisit(p)}
                    className={`p-4 rounded-2xl transition-all ${
                      p.riskLevel === 'BLACK' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-indigo-600'
                    }`}
                    title="Cepat: Input Kunjungan"
                  >
                    <Activity size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
                <Search size={64} className="mx-auto text-gray-200 mb-6" />
                <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">Data Pasien Tidak Ditemukan</p>
                <button onClick={() => setFilterKelurahan('ALL')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase">Reset Filter</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
