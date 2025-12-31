
import React from 'react';
import { HeartPulse, Printer, Download, MapPin, Phone, Mail, UserX } from 'lucide-react';
import QRCode from 'react-qr-code';
import { PUSKESMAS_INFO, EDUCATION_LIST } from './constants';
import { User, AppState } from './types';

// Modul Smart Card
export const SmartCardModule = ({ state, setState, isUser, user }: { state: AppState, setState: any, isUser: boolean, user: User }) => {
  const patientToDisplay = isUser ? user : state.users.find(u => u.id === state.selectedPatientId);
  
  return (
    <div className="max-w-xl mx-auto space-y-10 animate-in zoom-in-95 duration-500">
      {!isUser && (
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 text-center">Pilih Identitas Pasien</label>
           <select 
             onChange={(e) => setState((prev: AppState) => ({...prev, selectedPatientId: e.target.value}))}
             className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black outline-none"
             value={state.selectedPatientId || ''}
           >
             <option value="">-- PILIH PASIEN --</option>
             {state.users.filter(u => u.role === 'USER').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
           </select>
         </div>
      )}
      {patientToDisplay && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-b-[12px] border-indigo-600 print:shadow-none print:border-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-bl-[12rem] flex items-center justify-center p-10 text-white"><HeartPulse size={64} /></div>
          <div className="flex flex-col items-center gap-10">
            <div className="bg-white p-5 border-8 border-indigo-600 rounded-[3.5rem] shadow-2xl"><QRCode value={`ANC-${patientToDisplay.id}`} size={200} /></div>
            <div className="text-center">
              <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase leading-none">KARTU ANC PINTAR</h1>
              <p className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase mt-2">{PUSKESMAS_INFO.name}</p>
            </div>
            <div className="w-full space-y-5 border-t-2 border-dashed border-gray-100 pt-10">
              <div className="flex justify-between items-center"><span className="text-gray-400 font-black uppercase text-[10px]">Pasien</span><span className="font-black text-gray-900 uppercase text-lg">{patientToDisplay.name}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-black uppercase text-[10px]">Kehamilan</span><span className="font-black text-gray-900">{patientToDisplay.pregnancyMonth} Bln (G{patientToDisplay.pregnancyNumber})</span></div>
              <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100"><p className="text-sm font-black text-indigo-900 italic leading-tight">{patientToDisplay.medicalHistory || 'Tidak ada riwayat resiko.'}</p></div>
            </div>
          </div>
        </div>
      )}
      {patientToDisplay && (
        <div className="flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all uppercase text-xs"><Printer size={20} /> Cetak</button>
          <button className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-105 transition-all uppercase text-xs"><Download size={20} /> Simpan</button>
        </div>
      )}
    </div>
  );
};

// Modul Edukasi
export const EducationModule = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in duration-700">
    {EDUCATION_LIST.map(edu => (
      <div key={edu.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm group border border-gray-100 hover:shadow-2xl transition-all duration-500">
        <div className="h-64 overflow-hidden relative">
          <img src={edu.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={edu.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-60" />
          <div className="absolute bottom-6 left-6">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/30">{edu.type}</span>
          </div>
        </div>
        <div className="p-10">
          <h4 className="text-2xl font-black text-gray-900 mb-4 leading-tight tracking-tighter">{edu.title}</h4>
          <p className="text-sm text-gray-500 mb-8 line-clamp-2 font-medium">{edu.content}</p>
          <a href={edu.url} target="_blank" rel="noopener noreferrer" className="block text-center py-5 bg-gray-50 text-indigo-600 font-black text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-[0.2em]">Buka Materi</a>
        </div>
      </div>
    ))}
  </div>
);

// Modul Kontak
export const ContactModule = () => (
  <div className="max-w-4xl mx-auto space-y-12 text-center animate-in fade-in duration-700">
    <div className="bg-indigo-900 p-24 rounded-[6rem] text-white shadow-2xl relative overflow-hidden">
       <h2 className="text-7xl font-black tracking-tighter mb-8 leading-none relative z-10">Butuh Bantuan?</h2>
       <p className="text-indigo-200 font-bold max-w-xl mx-auto text-lg relative z-10">Tim medis kami siap mendampingi kehamilan Anda 24 jam melalui saluran resmi.</p>
       <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { icon: <MapPin size={40}/>, title: "Lokasi Kami", detail: PUSKESMAS_INFO.address },
        { icon: <Phone size={40}/>, title: "WhatsApp Chat", detail: PUSKESMAS_INFO.phone },
        { icon: <Mail size={40}/>, title: "Email Resmi", detail: PUSKESMAS_INFO.email }
      ].map((card, idx) => (
        <div key={idx} className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center hover:-translate-y-2 transition-all">
          <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 shadow-inner">{card.icon}</div>
          <h4 className="font-black text-gray-900 text-xl mb-3 tracking-tighter">{card.title}</h4>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">{card.detail}</p>
        </div>
      ))}
    </div>
  </div>
);

// Modul Akses Ditolak
export const AccessDenied = () => (
  <div className="p-20 text-center animate-in zoom-in duration-500">
    <div className="bg-red-50 p-16 rounded-[4rem] border-4 border-dashed border-red-200">
      <UserX size={80} className="mx-auto text-red-400 mb-6" />
      <h2 className="text-3xl font-black text-red-600 uppercase">Akses Sistem Dicabut</h2>
      <p className="text-red-500 font-bold mt-2">Silakan hubungi administrator untuk mengaktifkan kembali akun Anda.</p>
    </div>
  </div>
);
