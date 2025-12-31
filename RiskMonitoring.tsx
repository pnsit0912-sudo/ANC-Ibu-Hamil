
import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, Activity, ClipboardList, TrendingUp, 
  Search, Filter, Stethoscope, Heart, AlertCircle, ShieldAlert,
  ArrowRight, CheckCircle2, Info, MapPin, BarChart3, PieChart
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

  // Logic Triase Medis Terpadu
  const riskAnalysis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        const latestVisit = patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0];
        
        let riskLevel: 'BLACK' | 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
        let riskFlags: string[] = [];

        // 1. Cek Kunjungan Terlewat (Auto Flag)
        if (latestVisit?.nextVisitDate && latestVisit.nextVisitDate < today) {
           riskLevel = 'RED';
           riskFlags.push('KUNJUNGAN TERLAMBAT');
        }

        // 2. Cek Tekanan Darah
        if (latestVisit?.bloodPressure) {
          const [systolic, diastolic] = latestVisit.bloodPressure.split('/').map(Number);
          if (systolic >= 160 || diastolic >= 110) {
            riskLevel = 'BLACK';
            riskFlags.push('KRISIS HIPERTENSI');
          } else if (systolic >= 140 || diastolic >= 90) {
            // Fix: Removing redundant check to resolve TypeScript type overlap error
            // At this point, riskLevel is guaranteed not to be 'BLACK'.
            riskLevel = 'RED';
            riskFlags.push('Hipertensi Grade 2');
          } else if (systolic >= 130 || diastolic >= 85) {
            if (riskLevel === 'GREEN') riskLevel = 'YELLOW';
            riskFlags.push('Pre-Hipertensi');
          }
        }

        // 3. Cek Gerakan Janin
        if (latestVisit?.fetalMovement === 'Tidak Ada') {
           riskLevel = 'BLACK';
           riskFlags.push('GAWAT JANIN (ABSENT)');
        } else if (latestVisit?.fetalMovement === 'Kurang Aktif') {
           if (riskLevel !== 'BLACK') riskLevel = 'RED';
           riskFlags.push('Gerakan Janin Berkurang');
        }

        // 4. Cek Edema
        if (latestVisit?.edema) {
          if (riskLevel !== 'BLACK') riskLevel = 'RED';
          riskFlags.push('Edema (+)');
        }

        // 5. Cek Riwayat Medis
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

  // Agregasi Statistik Wilayah & Perhitungan Risk Density
  const statsAggregation = useMemo(() => {
    const kecStats: Record<string, { total: number, black: number, red: number, yellow: number, green: number }> = {};
    const kelStats: Record<string, { total: number, black: number, red: number, yellow: number, green: number }> = {};

    Object.keys(WILAYAH_DATA).forEach(kec => {
      kecStats[kec] = { total: 0, black: 0, red: 0, yellow: 0, green: 0 };
      WILAYAH_DATA[kec as keyof typeof WILAYAH_DATA].forEach(kel => {
        kelStats[kel] = { total: 0, black: 0, red: 0, yellow: 0, green: 0 };
      });
    });

    riskAnalysis.forEach(p => {
      const kec = p.kecamatan || "Pasar Minggu";
      const kel = p.kelurahan;

      if (kecStats[kec]) {
        kecStats[kec].total++;
        kecStats[kec][p.riskLevel.toLowerCase() as 'black'|'red'|'yellow'|'green']++;
      }
      if (kelStats[kel]) {
        kelStats[kel].total++;
        kelStats[kel][p.riskLevel.toLowerCase() as 'black'|'red'|'yellow'|'green']++;
      }
    });

    return { kecStats, kelStats };
  }, [riskAnalysis]);

  const filteredRiskList = riskAnalysis.filter(p => 
    filterKelurahan === 'ALL' || p.kelurahan === filterKelurahan
  ).sort((a, b) => {
    const order = { BLACK: 0, RED: 1, YELLOW: 2, GREEN: 3 };
    return order[a.riskLevel] - order[b.riskLevel];
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 1. Dashboard Ringkasan Eksekutif */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Kritis (Hitam)', count: riskAnalysis.filter(p => p.riskLevel === 'BLACK').length, color: 'bg-slate-950', text: 'text-white' },
          { label: 'Tinggi (Merah)', count: riskAnalysis.filter(p => p.riskLevel === 'RED').length, color: 'bg-red-600', text: 'text-white' },
          { label: 'Sedang (Kuning)', count: riskAnalysis.filter(p => p.riskLevel === 'YELLOW').length, color: 'bg-yellow-400', text: 'text-yellow-950' },
          { label: 'Stabil (Hijau)', count: riskAnalysis.filter(p => p.riskLevel === 'GREEN').length, color: 'bg-emerald-500', text: 'text-white' },
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

      {/* 2. Visualisasi Analitik (Fokus Perhitungan Risk Density) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={28} />
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Analitik Beban Risiko Wilayah</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart Aggregasi Kecamatan */}
          <div className="xl:col-span-1">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 h-full">
              <div className="mb-8">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-indigo-600" /> Risk Density Kecamatan
                </h4>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Kalkulasi: (Hitam+Merah) / Populasi</p>
              </div>

              <div className="space-y-8">
                {Object.entries(statsAggregation.kecStats).map(([kec, stat]) => {
                  const highRiskCount = stat.black + stat.red;
                  const density = stat.total > 0 ? (highRiskCount / stat.total) * 100 : 0;
                  
                  return (
                    <div key={kec} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xl font-black text-gray-900 tracking-tighter">{kec}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Populasi Total: {stat.total}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${density > 30 ? 'text-red-600' : 'text-indigo-600'}`}>{density.toFixed(1)}%</p>
                          <p className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Risk Score</p>
                        </div>
                      </div>

                      <div className="h-10 w-full bg-gray-50 rounded-2xl overflow-hidden flex border border-gray-100 p-1">
                        <div className="h-full bg-slate-950 rounded-l-xl" style={{ width: `${(stat.black / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${(stat.red / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-yellow-400" style={{ width: `${(stat.yellow / (stat.total || 1)) * 100}%` }} />
                        <div className="h-full bg-emerald-400 rounded-r-xl" style={{ width: `${(stat.green / (stat.total || 1)) * 100}%` }} />
                      </div>
                      
                      <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-widest px-2">
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-950"/> Kritis</div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Tinggi</div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Stabil</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Info size={14} /> Interpretasi Data
                </p>
                <p className="text-[11px] font-bold text-indigo-900 leading-relaxed italic">
                  "Risk Density menunjukkan persentase ibu hamil dengan kondisi medis mendesak yang membutuhkan intervensi rujukan atau kunjungan rumah segera."
                </p>
              </div>
            </div>
          </div>

          {/* Grid Visualisasi Kelurahan dengan Metrik Density Per Wilayah */}
          <div className="xl:col-span-2">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" /> Sebaran Kepadatan Risiko (Kelurahan)
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Breakdown Operasional Per Kelurahan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(statsAggregation.kelStats).map(([kel, stat]) => {
                  const highRiskCount = stat.black + stat.red;
                  const density = stat.total > 0 ? (highRiskCount / stat.total) * 100 : 0;
                  const riskLevel = density > 30 ? 'CRITICAL' : density > 10 ? 'WARNING' : 'STABLE';
                  
                  return (
                    <div key={kel} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${
                      riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : 
                      riskLevel === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-white border-gray-100'
                    }`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="font-black text-gray-900 text-sm uppercase leading-none mb-1">{kel}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total: {stat.total} Pasien</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black leading-none ${density > 20 ? 'text-red-600' : 'text-indigo-600'}`}>{density.toFixed(0)}%</p>
                          <p className="text-[8px] font-black uppercase text-gray-400 mt-1">Density</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { col: 'bg-slate-950', val: stat.black, label: 'Kritis' },
                          { col: 'bg-red-500', val: stat.red, label: 'Tinggi' },
                          { col: 'bg-yellow-400', val: stat.yellow, label: 'Sedang' },
                          { col: 'bg-emerald-400', val: stat.green, label: 'Stabil' },
                        ].map((bar, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-14 text-[8px] font-black text-gray-400 uppercase tracking-tighter">{bar.label}</div>
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
              <Heart size={28} className="text-red-600" /> Daftar Pantau Kasus Terverifikasi
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
          {filteredRiskList.length > 0 ? filteredRiskList.map(p => (
            <div 
              key={p.id} 
              className={`group relative p-8 rounded-[3.5rem] border-2 transition-all hover:scale-[1.02] hover:shadow-2xl ${
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
                   <span className={`text-[9px] font-black uppercase ${p.riskLevel === 'BLACK' ? 'text-slate-400' : 'text-gray-400'}`}>Kondisi Klinis Terakhir</span>
                   <TrendingUp size={14} className="opacity-40" />
                 </div>
                 <div className="flex flex-wrap gap-2">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'BLACK' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                     TD: {p.latestVisit?.bloodPressure || 'N/A'}
                   </span>
                   {p.riskFlags.map((flag, idx) => (
                     <span key={idx} className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.riskLevel === 'BLACK' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                       {flag}
                     </span>
                   ))}
                   {p.riskFlags.length === 0 && (
                     <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1">
                       <CheckCircle2 size={10} /> Kondisi Stabil
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
                  Profil Medis <ArrowRight size={14} />
                </button>
                <button 
                  onClick={() => onAddVisit(p)}
                  className={`p-4 rounded-2xl transition-all ${
                    p.riskLevel === 'BLACK' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-indigo-600'
                  }`}
                  title="Input Kunjungan Cepat"
                >
                  <Activity size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
              <Search size={64} className="mx-auto text-gray-200 mb-6" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">Data Pasien Tidak Ditemukan</p>
              <button onClick={() => setFilterKelurahan('ALL')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase underline decoration-2">Reset Filter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
