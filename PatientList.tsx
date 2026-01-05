
import React, { useState, useMemo } from 'react';
import { Users, Edit3, Activity, Download, Eye, ChevronDown, UserX, AlertCircle } from 'lucide-react';
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

  const visitsByPatient = useMemo(() => {
    const grouped: Record<string, ANCVisit[]> = {};
    visits.forEach(v => {
      if (!grouped[v.patientId]) grouped[v.patientId] = [];
      grouped[v.patientId].push(v);
    });
    Object.keys(grouped).forEach(pid => {
      grouped[pid].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    });
    return grouped;
  }, [visits]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role !== UserRole.USER) return false;
      
      const searchMatch = u.name.toLowerCase().includes(searchFilter.toLowerCase());
      
      // Filter Khusus Mangkir (jika search keyword adalah MANGKIR)
      if (searchFilter.toUpperCase() === 'MANGKIR') {
        const pVisits = visitsByPatient[u.id] || [];
        const latest = pVisits[0];
        return latest && latest.nextVisitDate < today;
      }

      return searchMatch;
    });
  }, [users, searchFilter, visitsByPatient, today]);

  const visibleUsers = useMemo(() => filteredUsers.slice(0, displayLimit), [filteredUsers, displayLimit]);

  const handleExportCSV = () => {
    const headers = ['Nama', 'Telepon', 'Status Risiko', 'Tgl Kontrol Terakhir', 'Mangkir?'];
    const rows = filteredUsers.map(u => {
      const pVisits = visitsByPatient[u.id] || [];
      const latest = pVisits[0];
      const isMissed = latest && latest.nextVisitDate < today;
      return [u.name, u.phone, getRiskCategory(u.totalRiskScore, latest).label, latest?.visitDate || '-', isMissed ? 'YA' : 'TIDAK'].join(',');
    });
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Pasien_ANC_${today}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3"><Users className="text-indigo-600" size={24} /> Database Pasien</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total {filteredUsers.length} Data Terintegrasi</p>
         </div>
         {currentUserRole === UserRole.ADMIN && (
           <button onClick={handleExportCSV} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100"><Download size={16} /> Export Data CSV</button>
         )}
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50/50">
            <tr className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
              <th className="px-12 py-8">Ibu & Status</th>
              <th className="px-12 py-8">Triase Skor</th>
              <th className="px-12 py-8">Data Klinis</th>
              <th className="px-12 py-8">Jadwal Kontrol</th>
              <th className="px-12 py-8 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleUsers.map(u => {
              const pVisits = visitsByPatient[u.id] || [];
              const latest = pVisits[0];
              const risk = getRiskCategory(u.totalRiskScore, latest);
              const isMissed = latest && latest.nextVisitDate < today;

              return (
                <tr key={u.id} className={`hover:bg-indigo-50/5 transition-all group ${isMissed ? 'bg-red-50/20' : ''}`}>
                  <td className="px-12 py-9">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shrink-0 ${risk.label === 'HITAM' ? 'bg-slate-950 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{u.name.charAt(0)}</div>
                       <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-gray-900 text-base leading-none uppercase">{u.name}</p>
                            {isMissed && <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase rounded-full animate-pulse shadow-lg shadow-red-100 flex items-center gap-1"><AlertCircle size={8}/> MANGKIR</span>}
                          </div>
                          <p className="text-[8px] font-black text-gray-400 uppercase mt-1 tracking-widest">Kel. {u.kelurahan}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-12 py-9">
                    <div className={`inline-flex flex-col gap-0.5 px-6 py-3 rounded-2xl ${risk.color}`}>
                       <span className="text-[10px] font-black uppercase tracking-widest">{risk.label}</span>
                       <span className="text-[7px] font-bold opacity-70">SPR: {u.totalRiskScore + 2}</span>
                    </div>
                  </td>
                  <td className="px-12 py-9"><p className="text-xs font-black text-indigo-900">G{u.pregnancyNumber}P{u.parityP}A{u.parityA}</p><p className="text-[8px] font-bold text-gray-400 uppercase">{u.pregnancyMonth} Bulan Hamil</p></td>
                  <td className="px-12 py-9">
                    <div className="space-y-1">
                      <p className={`text-[10px] font-black ${isMissed ? 'text-red-600 flex items-center gap-2' : 'text-gray-700'}`}>
                        {latest?.nextVisitDate || 'Belum Dijadwalkan'}
                        {isMissed && <UserX size={12}/>}
                      </p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Periksa: {latest?.visitDate || '-'}</p>
                    </div>
                  </td>
                  <td className="px-12 py-9 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => onViewProfile(u.id)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm" title="Lihat Profil"><Eye size={16}/></button>
                       <button onClick={() => onAddVisit(u)} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all" title="Input ANC"><Activity size={16}/></button>
                       <button onClick={() => onEdit(u)} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:bg-gray-50 transition-all" title="Edit Data"><Edit3 size={16}/></button>
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
          <button onClick={() => setDisplayLimit(prev => prev + 10)} className="flex items-center gap-3 px-10 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all">Muat Lebih Banyak <ChevronDown size={12} /></button>
        </div>
      )}
    </div>
  );
};
