
import React from 'react';
import { ShieldCheck, UserCheck, UserX, ClipboardList, Calendar, ShieldAlert, UserPlus, Activity, Edit3 } from 'lucide-react';
import { User, AppState, UserRole } from './types';

interface AccessManagementProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: User;
  addLog: (action: string, module: string, details: string) => void;
}

export const AccessManagement: React.FC<AccessManagementProps> = ({ state, setState, currentUser, addLog }) => {
  // Memperluas filter log untuk mencakup akses, pendaftaran (DATA), dan input medis (MEDICAL)
  const administrativeLogs = state.logs.filter(log => 
    log.module === 'ACCESS' || 
    log.module === 'DATA' || 
    log.module === 'MEDICAL'
  );

  // Hanya Admin yang bisa melihat dan mengelola ini
  if (currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="p-20 text-center animate-in zoom-in duration-500">
        <div className="bg-orange-50 p-16 rounded-[4rem] border-4 border-dashed border-orange-200">
          <ShieldCheck size={80} className="mx-auto text-orange-400 mb-6" />
          <h2 className="text-3xl font-black text-orange-600 uppercase">Akses Terbatas</h2>
          <p className="text-orange-500 font-bold mt-2">Hanya Administrator yang memiliki wewenang untuk membuka atau mencabut hak akses pengguna.</p>
        </div>
      </div>
    );
  }

  const toggleUserActive = (targetUser: User) => {
    const newStatus = !targetUser.isActive;
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === targetUser.id ? { ...u, isActive: newStatus } : u
      )
    }));

    // Mencatat ke audit trail
    addLog(
      newStatus ? 'GRANT_ACCESS' : 'REVOKE_ACCESS', 
      'ACCESS', 
      `Admin ${currentUser.name} mengubah status akses ${targetUser.name} menjadi ${newStatus ? 'AKTIF' : 'NONAKTIF'}`
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('REGISTER')) return <UserPlus size={12} className="text-emerald-500" />;
    if (action.includes('VISIT')) return <Activity size={12} className="text-blue-500" />;
    if (action.includes('UPDATE')) return <Edit3 size={12} className="text-amber-500" />;
    return <ShieldCheck size={12} className="text-indigo-500" />;
  };

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'ACCESS': return 'bg-indigo-100 text-indigo-600';
      case 'DATA': return 'bg-emerald-100 text-emerald-600';
      case 'MEDICAL': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Tabel Utama Manajemen User */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-black text-gray-800 uppercase flex items-center gap-3 tracking-tighter text-2xl">
            <ShieldCheck className="text-indigo-600" size={28} /> Panel Kontrol Hak Akses
          </h2>
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            Mode Administrator Aktif
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-8 py-5">Informasi Pengguna</th>
                <th className="px-8 py-5">Role Sistem</th>
                <th className="px-8 py-5">Status Akses</th>
                <th className="px-8 py-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.users.filter(u => u.id !== currentUser.id).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{u.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                      u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 
                      u.role === UserRole.NAKES ? 'bg-blue-100 text-blue-600' : 
                      'bg-teal-100 text-teal-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {u.isActive ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-black uppercase">
                        <UserCheck size={14} /> Aktif
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-black uppercase">
                        <UserX size={14} /> Dinonaktifkan
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => toggleUserActive(u)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm transition-all transform active:scale-95 ${
                        u.isActive 
                          ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-100'
                      }`}
                    >
                      {u.isActive ? 'Cabut Hak Akses' : 'Buka Hak Akses'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Log Aktivitas Administratif Komprehensif */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b bg-gray-900 text-white flex items-center justify-between">
          <h2 className="font-black uppercase flex items-center gap-3 tracking-tighter text-xl">
            <ClipboardList className="text-indigo-400" size={24} /> Audit Log: Registrasi & Kunjungan Medis
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20">
            <ShieldAlert size={10} className="text-red-400" /> Akuntabilitas Petugas Real-time
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-8 py-5">Waktu & Modul</th>
                <th className="px-8 py-5">Aktor (Petugas)</th>
                <th className="px-8 py-5">Tindakan</th>
                <th className="px-8 py-5">Detail Transaksi Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {administrativeLogs.length > 0 ? administrativeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500">
                        <Calendar size={10} />
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </div>
                      <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getModuleBadgeColor(log.module)}`}>
                        {log.module}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-indigo-600 border border-gray-200">
                        {log.userName.charAt(0)}
                      </div>
                      <p className="text-[11px] font-black text-gray-900 uppercase">{log.userName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        log.action.includes('REGISTER') || log.action.includes('ADD') ? 'text-emerald-600' : 
                        log.action.includes('REVOKE') || log.action.includes('DELETE') ? 'text-red-600' : 'text-indigo-600'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-bold text-gray-600 italic leading-relaxed">"{log.details}"</p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-gray-300 font-bold uppercase text-[10px] italic tracking-widest">
                    Belum ada riwayat aktivitas administratif yang tercatat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
