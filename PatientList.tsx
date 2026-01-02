
import React, { useState, useMemo } from 'react';
import { Users, Edit3, Activity, Download, Eye, ChevronDown } from 'lucide-react';
import { User, ANCVisit, UserRole } from './types';
import { getRiskCategory } from './utils';

interface PatientListProps {
  users: User[];
  visits: ANCVisit[];
  onEdit: (u: User) => void;
  onAddVisit: (u: User) => void;
  onViewProfile: (userId: string) => void;
  onDeletePatient: (userId: string) => void;
  onDeleteVisit: (visitId: string) => void;
  onToggleVisitStatus: (visitId: string) => void;
  currentUserRole: UserRole;
  searchFilter: string;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  users, visits, onEdit, onAddVisit, onViewProfile, searchFilter, currentUserRole 
}) => {
  const [displayLimit, setDisplayLimit] = useState(10);
  const today = new Date().toISOString().split('T')[0];

  // OPTIMASI: Indexing kunjungan berdasarkan Patient ID
  // Ini menghindari penggunaan .filter() di dalam loop render (O(U+V) vs O(U*V))
  const visitsByPatient = useMemo(() => {
    const grouped: Record<string, ANCVisit[]> = {};
    visits.forEach(v => {
      if (!grouped[v.patientId]) grouped[v.patientId] = [];
      grouped[v.patientId].push(v);
    });
    // Sort setiap grup berdasarkan tanggal terbaru
    Object.keys(grouped).forEach(pid => {
      grouped[pid].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    });
    return grouped;
  }, [visits]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.role === UserRole.USER && (u.name.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  }, [users, searchFilter]);

  const visibleUsers = useMemo(() => {
    return filteredUsers.slice(0, displayLimit);
  }, [filteredUsers, displayLimit]);

  const handleExportCSV = () => {
    const headers = [
      'Nama Lengkap', 'Telepon', 'Kelurahan', 'Skor Risiko', 'Triase', 
      'Gravida (G)', 'Para (P)', 'Abortus (A)', 'Usia Hamil (Bulan)', 
      'Tgl Kontrol Terakhir', 'TD Terakhir', 'BB Terakhir', 'Hb Terakhir', 'Catatan Nakes'
    ];

    const rows = filteredUsers.map(u => {
      const patientVisits = visitsByPatient[u.id] || [];
      const latest = patientVisits[0];
      const risk = getRiskCategory(u.totalRiskScore, latest);
      
      return [
        `"${u.name}"`,
        `"${u.phone}"`,
        `"${u.kelurahan}"`,
        u.totalRiskScore + 2,
        risk.label,
        u.pregnancyNumber,
        u.parityP,
        u.parityA,
        u.pregnancyMonth,
        latest?.visitDate || '-',
        `"${latest?.bloodPressure || '-'}"`,
        latest?.weight || '-',
        latest?.hb || '-',
        `"${(latest?.nakesNotes || '-').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Data_Pasien_ANC_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-6 md:p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
              <Users className="text-indigo-600" size={24} /> Database Pasien
            </h2>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Monitoring Puskesmas Terpadu</p>
         </div>

         {currentUserRole === UserRole.ADMIN && (
           <button 
             onClick={handleExportCSV}
             className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
           >
             <Download size={16} /> Export Data CSV
           </button>
         )}
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50/50">
            <tr className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
              <th className="px-6 md:px-12 py-5 md:py-8">Ibu & Lokasi</th>
              <th className="px-6 md:px-12 py-5 md:py-8">Triase</th>
              <th className="px-6 md:px-12 py-5 md:py-8">Kesehatan</th>
              <th className="px-6 md:px-12 py-5 md:py-8">Kontrol</th>
              <th className="px-6 md:px-12 py-5 md:py-8 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleUsers.map(u => {
              const patientVisits = visitsByPatient[u.id] || [];
              const latest = patientVisits[0];
              const risk = getRiskCategory(u.totalRiskScore, latest);
              const isEmergency = risk.label === 'HITAM';
              const isMissed = latest && latest.nextVisitDate < today && latest.status !== 'COMPLETED';

              return (
                <tr key={u.id} className={`hover:bg-indigo-50/5 transition-all group ${isEmergency ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 md:px-12 py-4 md:py-9">
                    <div className="flex items-center gap-3 md:gap-5">
                       <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black ${isEmergency ? 'bg-slate-950 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          {u.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-gray-900 text-sm md:text-base leading-none mb-1">{u.name}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase">{u.kelurahan}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-9">
                    <div className={`inline-flex flex-col gap-0.5 px-4 md:px-6 py-2 md:py-3 rounded-2xl ${risk.color}`}>
                       <span className="text-[8px] md:text-[10px] font-black uppercase">{risk.label}</span>
                       <span className="text-[7px] font-bold opacity-70">Skor: {u.totalRiskScore + 2}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-9">
                    <p className="text-xs font-black text-indigo-900">G{u.pregnancyNumber}P{u.parityP}A{u.parityA}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">{u.pregnancyMonth} Bulan</p>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-9">
                    <p className={`text-[10px] font-black ${isMissed ? 'text-red-600' : 'text-gray-700'}`}>{latest?.nextVisitDate || 'N/A'}</p>
                  </td>
                  <td className="px-6 md:px-12 py-4 md:py-9 text-center">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                       <button onClick={() => onViewProfile(u.id)} className="p-3 md:p-4 bg-gray-100 text-gray-400 rounded-xl md:rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all" title="Lihat Profil"><Eye size={16}/></button>
                       <button onClick={() => onAddVisit(u)} className="p-3 md:p-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl shadow-lg hover:bg-indigo-700 transition-all" title="Input ANC"><Activity size={16}/></button>
                       <button onClick={() => onEdit(u)} className="p-3 md:p-4 bg-white border border-gray-100 text-gray-400 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all" title="Edit Data"><Edit3 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > displayLimit && (
        <div className="p-12 flex justify-center bg-gray-50/30">
          <button 
            onClick={() => setDisplayLimit(prev => prev + 10)}
            className="flex items-center gap-3 px-10 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all"
          >
            Muat Lebih Banyak <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
