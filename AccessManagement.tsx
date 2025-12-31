
import React from 'react';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { User, AppState, UserRole } from './types';

interface AccessManagementProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: User;
}

export const AccessManagement: React.FC<AccessManagementProps> = ({ state, setState, currentUser }) => {
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

  const toggleUserActive = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    }));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
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
                    onClick={() => toggleUserActive(u.id)}
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
  );
};
