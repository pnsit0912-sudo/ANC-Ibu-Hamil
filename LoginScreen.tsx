
import React, { useState } from 'react';
import { HeartPulse, User as UserIcon, Lock, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { User } from './types';

interface LoginScreenProps {
  users: User[]; // Menerima daftar pengguna terbaru dari App state
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulasi delay jaringan agar terlihat profesional
    setTimeout(() => {
      // Validasi terhadap daftar users dinamis (termasuk yang baru didaftarkan)
      const user = users.find(
        u => u.username === username && u.password === password
      );

      if (user) {
        if (!user.isActive) {
          setError('Akses akun Anda telah dicabut oleh administrator.');
          setIsSubmitting(false);
          return;
        }
        onLogin(user);
      } else {
        setError('ID Pengguna atau Kata Sandi salah. Silakan coba lagi.');
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="bg-white w-full max-w-lg rounded-[5rem] shadow-2xl p-14 text-center border-b-[12px] border-indigo-700 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Dekorasi Latar */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <div className="bg-indigo-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 shadow-inner rotate-3 transition-transform hover:rotate-0 duration-500">
            <HeartPulse size={72} className="animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Smart ANC</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-12">Portal Keamanan Puskesmas</p>

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">ID Pengguna / Username</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan ID Anda"
                  className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                  required
                />
              </div>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-3 ml-6">
                *Pasien: Gunakan ID unik yang tertera di kartu ANC
              </p>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                isSubmitting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
            >
              {isSubmitting ? (
                <>Verifikasi...</>
              ) : (
                <>Masuk Ke Sistem <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              <ShieldCheck size={14} /> Terenkripsi
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">v2.1 Persistence Build</p>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="fixed bottom-10 text-center">
        <p className="text-indigo-200 font-black text-[10px] uppercase tracking-[0.3em]">
          &copy; 2024 Puskesmas Pasar Minggu - Dinas Kesehatan Jakarta
        </p>
      </div>
    </div>
  );
};
