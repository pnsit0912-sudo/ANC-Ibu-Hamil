
import React, { useMemo } from 'react';
import { AlertTriangle, Activity, Phone, Clock, ClipboardList, TrendingUp, Calendar } from 'lucide-react';
import { User, ANCVisit, AppState, UserRole } from './types';

interface RiskMonitoringProps {
  state: AppState;
}

export const RiskMonitoring: React.FC<RiskMonitoringProps> = ({ state }) => {
  const { users, ancVisits } = state;

  // Algoritma Analisis Resiko Klinis Terintegrasi
  const riskAnalysis = useMemo(() => {
    return users
      .filter(u => u.role === UserRole.USER)
      .map(patient => {
        const patientVisits = ancVisits.filter(v => v.patientId === patient.id);
        const latestVisit = patientVisits.length > 0 
          ? patientVisits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0]
          : null;

        let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        let riskFlags: string[] = [];

        // Logika 1: Skrining Preeklampsia (Integrasi Input Kunjungan)
        if (latestVisit?.bloodPressure) {
          const [systolic, diastolic] = latestVisit.bloodPressure.split('/').map(Number);
          if (systolic >= 140 || diastolic >= 90) {
            riskLevel = 'HIGH';
            riskFlags.push('Hipertensi (Preeklampsia Risk)');
          } else if (systolic >= 130 || diastolic >= 85) {
            // Fix: removed redundant comparison riskLevel !== 'HIGH' because riskLevel is guaranteed to be 'LOW' here
            riskLevel = 'MEDIUM';
            riskFlags.push('Pre-Hipertensi');
          }
        }

        // Logika 2: Edema (Integrasi Input Kunjungan)
        if (latestVisit?.edema) {
          riskLevel = 'HIGH';
          riskFlags.push('Edema Positif (+)');
        }

        // Logika 3: Riwayat Medis (Data Registrasi)
        if (patient.medicalHistory && !['n/a', '-', 'tidak ada'].includes(patient.medicalHistory.toLowerCase())) {
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
          riskFlags.push(`Riwayat: ${patient.medicalHistory}`);
        }

        // Logika 4: Kepatuhan Jadwal (Integrasi Timeframe)
        const today = new Date();
        if (latestVisit?.nextVisitDate) {
          const nextDate = new Date(latestVisit.nextVisitDate);
          if (nextDate < today) {
            if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
            riskFlags.push('Melewatkan Jadwal Kontrol');
          }
        }

        return {
          ...patient,
          latestVisit,
          riskLevel,
          riskFlags
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
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest italic">Sinkronisasi Otomatis dari Input Kunjungan Terakhir</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-10 py-6">Pasien & Gravida</th>
                <th className="px-10 py-6">Analisis Resiko</th>
                <th className="px-10 py-6">Parameter Klinis</th>
                <th className="px-10 py-6">Jadwal Kontrol</th>
                <th className="px-10 py-6 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riskAnalysis.map((p) => (
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
                      {p.riskFlags.map((flag, idx) => (
                        <p key={idx} className="text-[9px] font-bold text-red-500 leading-tight uppercase">• {flag}</p>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400"><span>Tensi:</span> <span className={parseInt(p.latestVisit?.bloodPressure?.split('/')[0] || '0') >= 140 ? 'text-red-600' : 'text-gray-900'}>{p.latestVisit?.bloodPressure || '-'}</span></div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400"><span>Edema:</span> <span className={p.latestVisit?.edema ? 'text-red-600' : 'text-emerald-600'}>{p.latestVisit?.edema ? 'Ya' : 'Tidak'}</span></div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Calendar size={14} />
                      <span className="text-[11px] font-black">{p.latestVisit?.nextVisitDate || 'Belum Dijadwalkan'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <a 
                      href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                    >
                      <Phone size={14} /> Hubungi
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
