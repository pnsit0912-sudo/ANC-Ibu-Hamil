
import React, { useState, useMemo } from 'react';
import { ShieldCheck, UserCheck, UserX, ClipboardList, Calendar, ShieldAlert, UserPlus, Activity, Edit3, Key, Eye, EyeOff, Search, Filter, Users, Stethoscope, UserCircle } from 'lucide-react';
import { User, AppState, UserRole } from './types';

interface AccessManagementProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: User;
  addLog: (action: string, module: string, details: string) => void;
}

export const AccessManagement: React.FC<AccessManagementProps> = ({ state, setState, currentUser, addLog }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADMIN' | 'NAKES' | 'USER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Proteksi Akses: Hanya Admin yang bisa masuk
  if (currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="p-20 text-center animate-in zoom-in duration-500">
        <div className="bg-red-50 p-20 rounded-[5rem] border-4 border-dashed border-red-200 shadow-2xl shadow-red-100">
          <ShieldAlert size={100} className="mx-auto text-red-500 mb-8 animate-bounce" />
          <h2 className="text-4xl font-black text-red-700 uppercase tracking-tighter">Akses Terlarang!</h2>
          <p className="text-red-600 font-bold mt-4 max-w-md mx-auto leading-relaxed">
            Halaman Manajemen Akses dan Kredensial hanya dapat diakses oleh Akun Administrator Utama.
          </p>
        </div>
      </div>
    );
  }

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUserActive = (targetUser: User) => {
    const newStatus = !targetUser.isActive;
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === targetUser.id ? { ...u, isActive: newStatus } : u)
    }));
    addLog(newStatus ? 'GRANT_ACCESS' : 'REVOKE_ACCESS', 'ACCESS', `Admin mengubah status ${targetUser.name} (${targetUser.role}) menjadi ${newStatus ? 'AKTIF' : 'NONAKTIF'}`);
  };

  const handleUpdateCredential = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const newUsername = formData.get('username') as string;
    const newPassword = formData.get('password') as string;

    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === editingUser.id ? { ...u, username: newUsername, password: newPassword } : u)
    }));

    addLog('UPDATE_CREDENTIAL', 'ACCESS', `Admin memperbarui kredensial untuk ${editingUser.name} (${editingUser.role})`);
    setEditingUser(null);
  };

  const filteredUsers = useMemo(() => {
    return state.users.filter(u => {
      const matchTab = activeTab === 'ALL' || u.role === activeTab;
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [state.users, activeTab, searchTerm]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Statis & Filter */}
      <div className="bg-indigo-900 p-12 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
              <ShieldCheck size={40} className="text-indigo-400" /> Manajemen Kredensial
            </h2>
            <p className="text-indigo-200 font-bold mt-2 uppercase text-[10px] tracking-widest">Kontrol Penuh Akses Admin, Nakes, dan Pasien</p>
          </div>
          <div className="flex bg-white/10 p-2 rounded-[2rem] border border-white/10">
            {[
              { id: 'ALL', label: 'Semua', icon: <Users size={14}/> },
              { id: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={14}/> },
              { id: 'NAKES', label: 'Nakes', icon: <Stethoscope size={14}/> },
              { id: 'USER', label: 'Pasien', icon: <UserCircle size={14}/> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-indigo-900 shadow-xl' : 'text-indigo-200 hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ShieldCheck size={300} className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none" />
      </div>

      {/* Kontrol Utama & Tabel */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6 bg-gray-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Cari Nama atau Username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b tracking-widest">
              <tr>
                <th className="px-10 py-6">Nama Pengguna</th>
                <th className="px-10 py-6">Role</th>
                <th className="px-10 py-6">ID Login (Username)</th>
                <th className="px-10 py-6">Kata Sandi</th>
                <th className="px-10 py-6 text-center">Akses</th>
                <th className="px-10 py-6 text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-10 py-7">
                    <p className="font-black text-gray-900 text-sm leading-none mb-1">{u.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{u.phone}</p>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      u.role === UserRole.ADMIN ? 'bg-indigo-900 text-white' : 
                      u.role === UserRole.NAKES ? 'bg-blue-600 text-white' : 
                      'bg-emerald-500 text-white'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-fit">
                      <UserCircle size={14} className="text-gray-400" />
                      <code className="text-xs font-black text-indigo-600">{u.username || 'N/A'}</code>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-fit">
                      <Key size={14} className="text-gray-400" />
                      <code className="text-xs font-black text-gray-600 tracking-widest">
                        {showPasswords[u.id] ? u.password : '••••••••'}
                      </code>
                      <button onClick={() => togglePassword(u.id)} className="text-gray-300 hover:text-indigo-600 transition-colors">
                        {showPasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <button 
                      onClick={() => toggleUserActive(u)}
                      disabled={u.id === currentUser.id}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                        u.id === currentUser.id ? 'opacity-20 cursor-not-allowed' :
                        u.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {u.isActive ? <><UserCheck size={14}/> Aktif</> : <><UserX size={14}/> Blokir</>}
                    </button>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button 
                      onClick={() => setEditingUser(u)}
                      disabled={u.id === currentUser.id}
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-0"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Kredensial */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] bg-indigo-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setEditingUser(null)}>
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="bg-indigo-600 p-12 text-white relative">
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Ubah Kredensial</h3>
              <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mt-2">{editingUser.name} ({editingUser.role})</p>
              <button onClick={() => setEditingUser(null)} className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><EyeOff size={20}/></button>
            </div>
            <form onSubmit={handleUpdateCredential} className="p-12 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Username Baru</label>
                <input name="username" defaultValue={editingUser.username} className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" required />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password Baru</label>
                <input name="password" defaultValue={editingUser.password} className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" required />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700">Simpan Perubahan</button>
                <button type="button" onClick={() => setEditingUser(null)} className="px-10 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Singkat */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
          <ClipboardList className="text-indigo-600" size={24} /> Log Keamanan Terakhir
        </h3>
        <div className="space-y-4">
          {state.logs.filter(l => l.module === 'ACCESS').slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm"><ShieldAlert size={18}/></div>
                 <div>
                   <p className="text-xs font-black text-gray-800 uppercase">{log.details}</p>
                   <p className="text-[9px] font-bold text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
