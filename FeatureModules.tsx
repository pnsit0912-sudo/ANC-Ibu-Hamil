
import React, { useState, useMemo } from 'react';
import { HeartPulse, Printer, Download, MapPin, Phone, Mail, UserX, AlertCircle, ShieldCheck, Share2, Filter, LayoutGrid } from 'lucide-react';
import QRCode from 'react-qr-code';
import { PUSKESMAS_INFO, EDUCATION_LIST } from './constants';
import { User, AppState, EducationContent } from './types';

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
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-bl-[12rem] flex items-center justify-center p-10 text-white"><ShieldCheck size={64} className="opacity-40" /></div>
          <div className="flex flex-col items-center gap-10">
            <div className="bg-white p-5 border-8 border-indigo-600 rounded-[3.5rem] shadow-2xl relative">
              <QRCode value={`ANC-${patientToDisplay.id}`} size={200} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <HeartPulse size={48} className="text-indigo-600" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase leading-none">KARTU ANC PINTAR</h1>
              <p className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase mt-2">Sistem Integrasi Puskesmas</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">
                <ShieldCheck size={12} /> Terverifikasi Medis
              </div>
            </div>
            <div className="w-full space-y-5 border-t-2 border-dashed border-gray-100 pt-10">
              <div className="flex justify-between items-center"><span className="text-gray-400 font-black uppercase text-[10px]">Nama Pasien</span><span className="font-black text-gray-900 uppercase text-lg">{patientToDisplay.name}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-black uppercase text-[10px]">Identitas</span><span className="font-black text-gray-900 uppercase">G{patientToDisplay.pregnancyNumber} | {patientToDisplay.pregnancyMonth} Bulan</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-black uppercase text-[10px]">Puskesmas</span><span className="font-black text-gray-900 text-xs">{PUSKESMAS_INFO.name}</span></div>
            </div>
          </div>
          <div className="mt-10 bg-gray-900 p-6 rounded-[2.5rem] text-white flex items-center justify-between">
            <div><p className="text-[8px] font-black uppercase opacity-40">Update Terakhir</p><p className="text-[10px] font-bold">Terintegrasi Cloud</p></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-[9px] font-black">SISTEM AKTIF</span></div>
          </div>
        </div>
      )}
      {patientToDisplay && (
        <div className="flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all uppercase text-xs"><Printer size={20} /> Cetak Kartu</button>
          <button className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-105 transition-all uppercase text-xs"><Download size={20} /> Unduh PDF</button>
        </div>
      )}
    </div>
  );
};

// Modul Edukasi
export const EducationModule = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(EDUCATION_LIST.map(edu => edu.category)));
    return ['ALL', ...cats];
  }, []);

  const filteredEducation = useMemo(() => {
    return activeCategory === 'ALL' 
      ? EDUCATION_LIST 
      : EDUCATION_LIST.filter(edu => edu.category === activeCategory);
  }, [activeCategory]);

  const handleShare = async (edu: EducationContent) => {
    const shareData = {
      title: edu.title,
      text: `${edu.title}: ${edu.content}`,
      url: edu.url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(edu.url);
        alert('Tautan berhasil disalin ke papan klip!');
      }
    } catch (err) {
      console.error('Gagal membagikan konten:', err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Topik Edukasi</h3>
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Saring materi sesuai kebutuhan</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-xl translate-y-[-2px]' 
                  : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {cat === 'ALL' ? 'Semua Topik' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredEducation.map(edu => (
          <div 
            key={edu.id} 
            className="bg-white rounded-[3rem] overflow-hidden shadow-sm group border border-gray-100 hover:shadow-2xl transition-all duration-500 animate-in zoom-in-95"
          >
            <div className="h-64 overflow-hidden relative">
              <img src={edu.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={edu.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 flex gap-2">
                <span className="px-4 py-1.5 bg-white text-indigo-900 text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">
                  {edu.category}
                </span>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/30">
                  {edu.type}
                </span>
              </div>
            </div>
            <div className="p-10">
              <h4 className="text-2xl font-black text-gray-900 mb-4 leading-tight tracking-tighter">{edu.title}</h4>
              <p className="text-sm text-gray-500 mb-8 line-clamp-2 font-medium">{edu.content}</p>
              <div className="flex gap-3">
                <a 
                  href={edu.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-[2] text-center py-5 bg-gray-50 text-indigo-600 font-black text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-[0.2em]"
                >
                  Buka Materi
                </a>
                <button 
                  onClick={() => handleShare(edu)}
                  className="flex-1 flex items-center justify-center gap-2 py-5 bg-indigo-50 text-indigo-600 font-black text-[10px] rounded-2xl hover:bg-indigo-100 transition-all uppercase tracking-[0.2em]"
                  title="Bagikan Materi"
                >
                  <Share2 size={16} /> Bagikan
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredEducation.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <LayoutGrid size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Belum ada materi untuk kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Modul Kontak
export const ContactModule = () => (
  <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
    <div className="bg-red-600 p-24 rounded-[6rem] text-white shadow-2xl relative overflow-hidden text-center">
       <h2 className="text-7xl font-black tracking-tighter mb-8 leading-none relative z-10 uppercase">Gawat Darurat?</h2>
       <p className="text-red-100 font-bold max-w-xl mx-auto text-lg relative z-10 mb-10">Jika mengalami tanda bahaya, segera hubungi nomor di bawah ini atau menuju puskesmas terdekat.</p>
       <a href={`tel:${PUSKESMAS_INFO.phone}`} className="inline-flex items-center gap-4 px-12 py-6 bg-white text-red-600 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">
         <Phone size={28} /> {PUSKESMAS_INFO.phone}
       </a>
       <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      {[
        { icon: <MapPin size={40}/>, title: "Lokasi Fisik", detail: PUSKESMAS_INFO.address },
        { icon: <Phone size={40}/>, title: "Layanan Konsultasi", detail: "Tersedia 08.00 - 16.00 WIB" },
        { icon: <Mail size={40}/>, title: "Email Dukungan", detail: PUSKESMAS_INFO.email }
      ].map((card, idx) => (
        <div key={idx} className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center hover:-translate-y-2 transition-all">
          <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 shadow-inner">{card.icon}</div>
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
      <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter">Akses Sistem Dicabut</h2>
      <p className="text-red-500 font-bold mt-2">Silakan hubungi administrator puskesmas untuk verifikasi ulang identitas Anda.</p>
    </div>
  </div>
);
