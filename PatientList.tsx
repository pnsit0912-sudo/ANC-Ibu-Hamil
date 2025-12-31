
import React, { useState } from 'react';
import { Users, History, Edit3, Clock, ClipboardCheck, AlertCircle } from 'lucide-react';
import { User, ANCVisit } from './types';
import { getMedicalRecommendation } from './utils';

interface PatientListProps {
  users: User[];
  visits: ANCVisit[];
  onEdit: (u: User) => void;
  searchFilter: string;
}

export const PatientList: React.FC<PatientListProps> = ({ users, visits, onEdit, searchFilter }) => {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  
  const filteredUsers = users.filter(u => 
    u.role === 'USER' && 
    (u.name.toLowerCase().includes(searchFilter.toLowerCase()) || u.id.includes(searchFilter))
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="font-black text-gray-800 flex items-center gap-2 uppercase">
          <Users className="text-indigo-600" size={24} /> Database Pasien Terdaftar
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b">
              <th className="px-8 py-5">Pasien</th>
              <th className="px-8 py-5">Kondisi Klinis</th>
              <th className="px-8 py-5">Rekomendasi 10T</th>
              <th className="px-8 py-5 text-center">Tindak Lanjut</th>
              <th className="px-8 py-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(u => {
              const rec = getMedicalRecommendation(u.pregnancyMonth);
              const userVisits = visits.filter(v => v.patientId === u.id);
              const isOpen = selectedHistoryId === u.id;

              return (
                <React.Fragment key={u.id}>
                  <tr className="hover:bg-indigo-50/10 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{u.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${rec.color}`}>
                        {rec.trimester} ({u.pregnancyMonth} Bln)
                      </span>
                      <p className="text-[10px] text-gray-500 font-bold mt-1">Gravida: G{u.pregnancyNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                       <ul className="space-y-1">
                         {rec.actions.slice(0, 2).map((a, i) => (
                           <li key={i} className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5"><div className="w-1 h-1 bg-indigo-400 rounded-full"/> {a}</li>
                         ))}
                       </ul>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => setSelectedHistoryId(isOpen ? null : u.id)}
                        className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-xl ${
                          isOpen ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        <ClipboardCheck size={16} /> {isOpen ? 'Tutup Data' : 'Tindak Lanjut'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => onEdit(u)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={18} /></button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                      <td colSpan={5} className="px-12 py-10">
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                               <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-8 flex items-center gap-2"><Clock size={18} className="text-indigo-500"/> Timeline Pemeriksaan</h4>
                               <div className="space-y-8">
                                 {userVisits.length > 0 ? userVisits.map(v => (
                                   <div key={v.id} className="flex gap-6 border-l-2 border-dashed border-gray-100 pl-8 pb-8 relative last:pb-0">
                                     <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-md ${v.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`} />
                                     <div className="flex-1">
                                       <div className="flex items-center justify-between mb-3">
                                         <p className="text-xs font-black text-gray-900">{v.visitDate === '-' ? v.scheduledDate : v.visitDate}</p>
                                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${v.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                           {v.status === 'COMPLETED' ? 'Selesai' : 'Terlewat'}
                                         </span>
                                       </div>
                                       <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                         <div><p className="text-[9px] text-gray-400 font-bold uppercase">Tensi</p><p className="text-xs font-bold">{v.bloodPressure || '-'}</p></div>
                                         <div><p className="text-[9px] text-gray-400 font-bold uppercase">Edema</p><p className={`text-xs font-bold ${v.edema ? 'text-red-500' : 'text-green-600'}`}>{v.edema ? 'Ada' : 'Tidak Ada'}</p></div>
                                       </div>
                                     </div>
                                   </div>
                                 )) : <p className="text-center py-4 text-gray-400 italic">Data kunjungan kosong.</p>}
                               </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col">
                               <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-8 flex items-center gap-2"><ClipboardCheck size={18} className="text-emerald-500"/> Rangkuman Tindak Lanjut</h4>
                               <div className="flex-1 overflow-x-auto">
                                 <table className="w-full text-left">
                                   <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 border-b">
                                     <tr><th className="px-4 py-3">Tgl</th><th className="px-4 py-3">Keluhan</th><th className="px-4 py-3">Instruksi Medis</th></tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-50">
                                     {userVisits.map(v => (
                                       <tr key={v.id}>
                                         <td className="px-4 py-4 text-[10px] font-bold">{v.visitDate === '-' ? v.scheduledDate : v.visitDate}</td>
                                         <td className="px-4 py-4 text-[10px] text-gray-500 italic truncate max-w-[120px]">{v.complaints || '-'}</td>
                                         <td className="px-4 py-4 text-[10px] font-black text-indigo-600">{v.followUp || '-'}</td>
                                       </tr>
                                     ))}
                                   </tbody>
                                 </table>
                               </div>
                               <div className="mt-8 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                  <AlertCircle className="text-indigo-600 mt-1" size={20} />
                                  <p className="text-[11px] font-medium text-indigo-800/80 leading-relaxed">Pastikan semua tindak lanjut telah dikomunikasikan kepada Ibu {u.name} secara jelas.</p>
                               </div>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
