
import React, { useMemo } from 'react';
import { AlertTriangle, Activity, Phone, Clock, ClipboardList, TrendingUp, Calendar, ArrowRightCircle, CheckCircle2, PlusCircle, Check } from 'lucide-react';
import { User, ANCVisit, AppState, UserRole } from './types';

interface RiskMonitoringProps {
  state: AppState;
  onNavigateToPatient: (patientId: string) => void;
  onAddVisit: (u: User) => void;
  onToggleVisitStatus: (visitId: string) => void;
}

export const RiskMonitoring: React.FC<RiskMonitoringProps> = ({ state, onNavigateToPatient, onAddVisit, onToggleVisitStatus }) => {
  const { users, ancVisits } = state;

  // Algoritma Analisis Resiko Klinis Terintegrasi
  const riskAnalysis = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        
        // Data Klinis hanya diambil dari kunjungan yang statusnya COMPLETED (Valid)
        const completedVisits = patientVisits.filter(v => v.status === 'COMPLETED');
        const latestCompletedVisit = completedVisits.length > 0 
          ? completedVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0]
          : null;

        // Jadwal Kontrol diambil dari field nextVisitDate kunjungan terakhir (apapun statusnya)
        const latestAnyVisit = patientVisits.length > 0
          ? patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0]
          : null;

        let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        let riskFlags: string[] = [];

        // Logika 1: Skrining Preeklampsia (Data Terakhir yang Valid)
        if (latestCompletedVisit?.bloodPressure) {
          const [systolic, diastolic] = latestCompletedVisit.bloodPressure.split('/').map(Number);
          if (systolic >= 140 || diastolic >= 90) {
            riskLevel = 'HIGH';
            riskFlags.push('Hipertensi (Preeklampsia Risk)');
          } else if (systolic >= 130 || diastolic >= 85) {
            riskLevel = 'MEDIUM';
            riskFlags.push('Pre-Hipertensi');
          }
        }

        // Logika 2: Edema (Data Terakhir yang Valid)
        if (latestCompletedVisit?.edema) {
          riskLevel = 'HIGH';
          riskFlags.push('Edema Positif (+)');
        }

        // Logika 3: Riwayat Medis (Data Registrasi)
        if (patient.medicalHistory && !['n/a', '-', 'tidak ada'].includes(patient.medicalHistory.toLowerCase())) {
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
          riskFlags.push(`Riwayat: ${patient.medicalHistory}`);
        }

        // Logika 4: Kepatuhan Jadwal (Integrasi Timeline)
        const today = new Date();
        const nextDateStr = latestAnyVisit?.nextVisitDate;
        let isOverdue = false;
        let isToday = false;

        if (nextDateStr) {
          const todayDate = new Date(today.toISOString().split('T')[0]);
          const targetDate = new Date(nextDateStr);

          if (targetDate < todayDate) {
            isOverdue = true;
            if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
            riskFlags.push('Melewatkan Jadwal Kontrol');
          } else if (targetDate.getTime() === todayDate.getTime()) {
            isToday = true;
          }
        }

        return {
          ...patient,
          latestCompletedVisit,
          latestAnyVisit,
          riskLevel,
          riskFlags,
          isOverdue,
          isToday
        };
      })
      .sort((a, b) => {
        const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priority[a.riskLevel] - priority[b.riskLevel];
      });
  }, [users, ancVisits]);

  const stats = {
    high: riskAnalysis.filter(r => r.riskLevel === 'HIGH').length,
    medium: riskAnalysis.filter(r => r.riskLevel === 'MEDIUM').length,
    total: riskAnalysis.length
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-center gap-6 shadow-sm">
          <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg"><AlertTriangle size={32} /></div>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Pasien Resiko Tinggi</p>
            <p className="text-4xl font-black text-red-700">{stats.high}</p>
          </div>
        </div>
        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 flex items-center gap-6 shadow-sm">
          <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg"><Clock size={32} /></div>
          <div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Pantauan Menengah</p>
            <p className="text-4xl font-black text-orange-700">{stats.medium}</p>
          </div>
        </div>
        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-center gap-6 shadow-sm">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg"><TrendingUp size={32} /></div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Populasi Ibu</p>
            <p className="text-4xl font-black text-indigo-700">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
              <Activity className="text-red-600" size={28} /> Dashboard Triase Klinis
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest italic">Sinkronisasi Otomatis dari Timeline Pemeriksaan Terbaru</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-10 py-6">Pasien & Gravida</th>
                <th className="px-10 py-6">Analisis Resiko</th>
                <th className="px-10 py-6">Parameter Klinis (Valid)</th>
                <th className="px-10 py-6">Jadwal Kontrol</th>
                <th className="px-10 py-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riskAnalysis.map((p) => {
                const latestVisit = p.latestAnyVisit;
                const isCompleted = latestVisit?.status === 'COMPLETED';
                const nextDate = latestVisit?.nextVisitDate;
                
                return (
                  <tr key={p.id} className={`hover:bg-gray-50/50 transition-all ${p.riskLevel === 'HIGH' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-10 py-8">
                      <p className="font-black text-gray-900 text-lg leading-none">{p.name}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-gray-100 text-gray-500 rounded">G{p.pregnancyNumber}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">{p.pregnancyMonth} Bln</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                          p.riskLevel === 'HIGH' ? 'bg-red-600 text-white shadow-md' :
                          p.riskLevel === 'MEDIUM' ? 'bg-orange-500 text-white shadow-md' :
                          'bg-emerald-500 text-white shadow-md'
                        }`}>
                          {p.riskLevel === 'HIGH' ? <AlertTriangle size={12}/> : null}
                          {p.riskLevel === 'HIGH' ? 'Resiko Tinggi' : p.riskLevel === 'MEDIUM' ? 'Waspada' : 'Normal'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {p.riskFlags.map((flag, idx) => (
                            <p key={idx} className="text-[9px] font-bold text-red-500 leading-tight uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100"> {flag}</p>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400"><span>Tensi Terakhir:</span> <span className={parseInt(p.latestCompletedVisit?.bloodPressure?.split('/')[0] || '0') >= 140 ? 'text-red-600 font-black' : 'text-gray-900 font-black'}>{p.latestCompletedVisit?.bloodPressure || '-'}</span></div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400"><span>Status Edema:</span> <span className={p.latestCompletedVisit?.edema ? 'text-red-600 font-black' : 'text-emerald-600 font-black'}>{p.latestCompletedVisit?.edema ? 'YA' : 'TIDAK'}</span></div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`flex flex-col gap-1 transition-all ${p.isOverdue && !isCompleted ? 'text-red-600 animate-pulse' : isCompleted ? 'text-emerald-600 opacity-60' : 'text-indigo-600'}`}>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className={p.isOverdue && !isCompleted ? 'animate-bounce' : ''} />
                            <span className="text-[11px] font-black uppercase tracking-tighter">{nextDate || 'Belum Terjadwal'}</span>
                          </div>
                          
                          <div className="flex gap-1">
                            {p.isOverdue && !isCompleted && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">TERLAMBAT</span>
                            )}
                            {p.isToday && !isCompleted && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-orange-500 text-white px-2 py-0.5 rounded shadow-sm">HARI INI</span>
                            )}
                            {isCompleted && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">KONTROL SELESAI</span>
                            )}
                          </div>
                        </div>

                        {/* Checklist Terintegrasi dengan Timeline */}
                        <div className="relative group">
                          {latestVisit ? (
                            <button 
                              onClick={() => onToggleVisitStatus(latestVisit.id)}
                              className={`p-4 rounded-[1.25rem] transition-all transform active:scale-90 border-2 ${
                                isCompleted 
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                  : 'bg-white border-gray-200 text-gray-300 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50'
                              }`}
                              title={isCompleted ? "Klik untuk membatalkan status Selesai" : "Konfirmasi Kedatangan Pasien (Checklist)"}
                            >
                              {isCompleted ? <CheckCircle2 size={24} /> : <Check size={24} strokeWidth={3} />}
                            </button>
                          ) : (
                            <button 
                              onClick={() => onAddVisit(p)}
                              className="p-4 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-[1.25rem] hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                              title="Tambah Jadwal Baru"
                            >
                              <PlusCircle size={24} />
                            </button>
                          )}
                          <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-20">
                            {isCompleted ? 'Batalkan Status Selesai' : 'Tandai Kunjungan Selesai'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2 flex items-center justify-end h-full mt-4">
                      <button 
                        onClick={() => onNavigateToPatient(p.id)}
                        className="inline-flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
                        title="Lihat Riwayat & Timeline Lengkap"
                      >
                        <ArrowRightCircle size={14} /> Lihat Riwayat
                      </button>
                      <a 
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-1"
                      >
                        <Phone size={14} /> Hubungi
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
