
import React, { useState } from 'react';
import { Users, Edit3, Calendar, AlertTriangle, Trash2, Baby, Phone, CheckCircle2, AlertCircle, Clock, Activity, ShieldAlert, ChevronRight, MapPin } from 'lucide-react';
import { User, ANCVisit, UserRole } from './types';
import { getRiskCategory } from './utils';

interface PatientListProps {
  users: User[];
  visits: ANCVisit[];
  onEdit: (u: User) => void;
  onAddVisit: (u: User) => void;
  onDeletePatient: (userId: string) => void;
  onDeleteVisit: (visitId: string) => void;
  onToggleVisitStatus: (visitId: string) => void;
  currentUserRole: UserRole;
  searchFilter: string;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  users, visits, onEdit, onAddVisit, onDeletePatient, searchFilter 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const filteredUsers = users.filter(u => 
    u.role === 'USER' && (u.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
         <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-4"><Users className="text-indigo-600" size={32} /> Database Pasien ANC</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistem Monitoring Terpusat Aktif
            </p>
         </div>
         <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase shadow-xl"><ShieldAlert size={16} className="text-red-500 animate-pulse"/> Gawat Darurat</div>
            <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 text-orange-600 rounded-[1.5rem] text-[10px] font-black uppercase border border-orange-100"><Clock size={16}/> Mangkir Kontrol</div>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
              <th className="px-12 py-8">Profil Ibu & Lokasi</th>
              <th className="px-12 py-8">Kategori Triase</th>
              <th className="px-12 py-8">Status Medis (G)</th>
              <th className="px-12 py-8">Kunjungan Berikutnya</th>
              <th className="px-12 py-8 text-center">Operasional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map(u => {
              const patientVisits = visits.filter(v => v.patientId === u.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate));
              const latest = patientVisits[0];
              const risk = getRiskCategory(u.totalRiskScore, latest);
              
              // Logic Flagging Berdasarkan Penilaian Medis & Admin
              const isEmergency = risk.label === 'HITAM';
              const isMissed = latest && latest.nextVisitDate < today && latest.status !== 'COMPLETED';

              return (
                <tr key={u.id} className={`hover:bg-indigo-50/5 transition-all group ${isEmergency ? 'bg-red-50/30' : ''}`}>
                  <td className="px-12 py-9">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${isEmergency ? 'bg-slate-950 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          {u.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-gray-900 text-base flex items-center gap-2">
                            {u.name}
                            {isEmergency && <span className="p-1.5 bg-red-600 text-white rounded-lg animate-pulse shadow-lg"><AlertCircle size={12}/></span>}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10}/> {u.phone}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> {u.kelurahan}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-12 py-9">
                    <div className={`inline-flex flex-col gap-1 px-6 py-3 rounded-[1.5rem] shadow-sm ${risk.color}`}>
                       <span className="text-[10px] font-black uppercase tracking-tighter">{risk.label}</span>
                       <span className="text-[8px] font-bold opacity-70 uppercase leading-none">Skor: {u.totalRiskScore + 2}</span>
                    </div>
                  </td>
                  <td className="px-12 py-9">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                          <Baby size={18} className="text-indigo-400"/> G{u.pregnancyNumber} <span className="text-[10px] text-gray-400">P{u.pregnancyNumber-1}A0</span>
                       </div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Usia Hamil: {u.pregnancyMonth} Bulan</p>
                    </div>
                  </td>
                  <td className="px-12 py-9">
                    <div className="flex flex-col">
                       <div className={`flex items-center gap-2 font-black text-xs ${isMissed ? 'text-red-600' : 'text-gray-700'}`}>
                          <Calendar size={14} className={isMissed ? 'text-red-400' : 'text-gray-300'}/>
                          {latest?.nextVisitDate || 'Belum Terjadwal'}
                       </div>
                       {isMissed && (
                         <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[8px] font-black uppercase w-fit animate-bounce">
                           <Clock size={10}/> Mangkir Kontrol
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-12 py-9 text-center">
                    <div className="flex items-center justify-center gap-3">
                       <button onClick={() => onAddVisit(u)} className={`p-4 rounded-2xl shadow-lg transition-all hover:scale-110 ${isEmergency ? 'bg-red-600 text-white shadow-red-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`} title="Input Pemeriksaan Baru">
                          <Activity size={20}/>
                       </button>
                       <button onClick={() => onEdit(u)} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all">
                          <Edit3 size={20}/>
                       </button>
                       <button onClick={() => onDeletePatient(u.id)} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm transition-all">
                          <Trash2 size={20}/>
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-32 text-center bg-gray-50/50">
             <div className="bg-white w-24 h-24 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-8 text-gray-200">
               <Users size={48}/>
             </div>
             <p className="text-gray-400 font-black uppercase text-xs tracking-[0.4em]">Data Pasien Kosong</p>
          </div>
        )}
      </div>
    </div>
  );
};
