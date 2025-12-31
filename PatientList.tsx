
import React, { useState } from 'react';
import { Users, History, Edit3, Clock, ClipboardCheck, AlertCircle, PlusCircle, MapPin, Eye, EyeOff, Calendar, AlertTriangle, Trash2, Check } from 'lucide-react';
import { User, ANCVisit, UserRole } from './types';
import { getMedicalRecommendation } from './utils';

interface PatientListProps {
  users: User[];
  visits: ANCVisit[];
  onEdit: (u: User) => void;
  onAddVisit: (u: User) => void;
  onDeleteVisit: (visitId: string) => void;
  onToggleVisitStatus: (visitId: string) => void;
  currentUserRole: UserRole;
  searchFilter: string;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  users, visits, onEdit, onAddVisit, onDeleteVisit, onToggleVisitStatus, currentUserRole, searchFilter 
}) => {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isPrivacyOn, setIsPrivacyOn] = useState(true);
  
  const filteredUsers = users.filter(u => 
    u.role === 'USER' && 
    (u.name.toLowerCase().includes(searchFilter.toLowerCase()) || u.id.includes(searchFilter))
  );

  const maskPhone = (phone: string) => isPrivacyOn ? phone.replace(/(\d{4})\d+(\d{4})/, '$1-XXXX-$2') : phone;

  const getPatientRiskStatus = (userId: string) => {
    const userVisits = visits.filter(v => v.patientId === userId);
    const latest = userVisits.sort((a,b) => b.visitDate.localeCompare(a.visitDate))[0];
    
    if (!latest) return { level: 'LOW', color: 'text-gray-300' };

    const [sys, dia] = (latest.bloodPressure || "0/0").split('/').map(Number);
    if (sys >= 140 || dia >= 90 || latest.edema) return { level: 'HIGH', color: 'text-red-600' };
    return { level: 'NORMAL', color: 'text-emerald-500' };
  };

  const getNextVisit = (userId: string) => {
    const userVisits = visits.filter(v => v.patientId === userId);
    if (userVisits.length === 0) return null;
    return userVisits.sort((a,b) => b.visitDate.localeCompare(a.visitDate))[0].nextVisitDate;
  };

  const isVisitNear = (date: string | null) => {
    if (!date) return false;
    const today = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
          <Users className="text-indigo-600" size={24} /> Manajemen Data & Tindak Lanjut
        </h2>
        <button 
          onClick={() => setIsPrivacyOn(!isPrivacyOn)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPrivacyOn ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
        >
          {isPrivacyOn ? <><EyeOff size={14}/> Privacy On</> : <><Eye size={14}/> Privacy Off</>}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b">
              <th className="px-8 py-5">Identitas Pasien</th>
              <th className="px-8 py-5">Status Resiko</th>
              <th className="px-8 py-5">Kontrol Berikutnya</th>
              <th className="px-8 py-5 text-center">Tindak Lanjut</th>
              <th className="px-8 py-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(u => {
              const rec = getMedicalRecommendation(u.pregnancyMonth);
              const userVisits = visits.filter(v => v.patientId === u.id);
              const isOpen = selectedHistoryId === u.id;
              const nextDate = getNextVisit(u.id);
              const near = isVisitNear(nextDate);
              const risk = getPatientRiskStatus(u.id);

              return (
                <React.Fragment key={u.id}>
                  <tr className="hover:bg-indigo-50/10 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900 leading-tight">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{maskPhone(u.phone)}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${risk.color}`}>
                         {risk.level === 'HIGH' ? <AlertTriangle size={14} /> : <div className={`w-2 h-2 rounded-full bg-current`} />}
                         {risk.level}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       {nextDate ? (
                         <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${near ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                           <Calendar size={14} /> {nextDate}
                         </div>
                       ) : (
                         <span className="text-[9px] font-bold text-gray-300 italic uppercase tracking-tighter">Belum Terjadwal</span>
                       )}
                    </td>
                    <td className="px-8 py-6 text-center space-x-2">
                      <button 
                        onClick={() => setSelectedHistoryId(isOpen ? null : u.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                          isOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        <History size={14} /> {isOpen ? 'Tutup' : 'Riwayat'}
                      </button>
                      <button 
                        onClick={() => onAddVisit(u)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-emerald-600 shadow-lg shadow-emerald-50 transition-all active:scale-95"
                      >
                        <PlusCircle size={14} /> Input Kunjungan
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
                                 {userVisits.length > 0 ? userVisits.slice().reverse().map(v => {
                                   const isCompleted = v.status === 'COMPLETED';
                                   return (
                                   <div key={v.id} className="flex gap-6 border-l-2 border-dashed border-gray-100 pl-8 pb-8 relative last:pb-0">
                                     {/* Interactive Checklist Box */}
                                     <button 
                                       onClick={() => onToggleVisitStatus(v.id)}
                                       className={`absolute -left-[14px] top-0 w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 ${
                                         isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-emerald-100 hover:text-emerald-500'
                                       }`}
                                       title={isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                                     >
                                       {isCompleted ? <Check size={14} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                     </button>

                                     <div className={`flex-1 transition-opacity ${isCompleted ? 'opacity-100' : 'opacity-70'}`}>
                                       <div className="flex items-center justify-between mb-3">
                                         <p className={`text-xs font-black uppercase tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
                                           {v.visitDate} {isCompleted && '✓ SELESAI'}
                                         </p>
                                         <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                              Kontrol Lanjut: {v.nextVisitDate}
                                            </span>
                                            {currentUserRole === UserRole.ADMIN && (
                                              <button 
                                                onClick={() => onDeleteVisit(v.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                title="Hapus Kunjungan"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            )}
                                         </div>
                                       </div>
                                       <div className={`grid grid-cols-2 gap-4 p-5 rounded-2xl border transition-all ${isCompleted ? 'bg-emerald-50/30 border-emerald-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                         <div><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tensi</p><p className={`text-xs font-black ${isCompleted ? 'text-emerald-900' : 'text-gray-900'}`}>{v.bloodPressure}</p></div>
                                         <div><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Janin</p><p className={`text-xs font-black ${isCompleted ? 'text-emerald-900' : 'text-gray-900'}`}>{v.fetalMovement}</p></div>
                                       </div>
                                       <div className={`mt-4 p-4 rounded-2xl border italic transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>Tindak Lanjut</p>
                                          <p className={`text-[11px] font-bold leading-relaxed ${isCompleted ? 'text-emerald-900' : 'text-indigo-900'}`}>"{v.followUp}"</p>
                                       </div>
                                     </div>
                                   </div>
                                 )}) : <p className="text-center py-4 text-gray-400 italic font-bold">Belum ada data kunjungan yang diinput.</p>}
                               </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col">
                               <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-8 flex items-center gap-2"><ClipboardCheck size={18} className="text-emerald-500"/> Detail Alamat & Lokasi</h4>
                               <div className="flex-1 space-y-6">
                                  <div className="bg-gray-50 p-6 rounded-3xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Alamat Terdaftar</p>
                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{isPrivacyOn ? 'Alamat disembunyikan (Privacy On)' : u.address}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Latitude</p>
                                       <p className="text-xs font-black text-indigo-900">{u.lat || '-'}</p>
                                     </div>
                                     <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Longitude</p>
                                       <p className="text-xs font-black text-indigo-900">{u.lng || '-'}</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="mt-8 p-5 bg-indigo-900 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-indigo-100">
                                  <div className="flex items-center gap-4">
                                    <MapPin size={24} className="text-indigo-300" />
                                    <div>
                                      <p className="text-[10px] font-black uppercase opacity-60">Status Integrasi Peta</p>
                                      <p className="text-xs font-black">Lokasi Terhubung ke Sistem Pemetaan</p>
                                    </div>
                                  </div>
                                  <div className="w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
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
