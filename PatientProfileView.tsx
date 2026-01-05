
import React from 'react';
import { User, ANCVisit, UserRole } from './types';
import { calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  X, Baby, Calendar, MapPin, Activity, Stethoscope, 
  Heart, Droplets, AlertCircle, ClipboardCheck, ArrowLeft, Phone, Info,
  ShieldCheck, CheckCircle, BookOpen, ShieldAlert
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: User;
  visits: ANCVisit[];
  onClose: () => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ patient, visits, onClose }) => {
  const progress = calculatePregnancyProgress(patient.hpht);
  const patientVisits = visits
    .filter(v => v.patientId === patient.id)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  
  const latestVisit = patientVisits[0];
  const risk = getRiskCategory(patient.totalRiskScore, latestVisit);

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Redesigned Fixed Header Button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <button 
          onClick={onClose}
          className="p-3 md:p-4 bg-white/80 backdrop-blur shadow-2xl text-gray-500 hover:bg-red-500 hover:text-white rounded-2xl md:rounded-3xl transition-all border border-gray-100 flex items-center justify-center group"
          title="Tutup Profil"
        >
          <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="p-4 md:p-12 lg:p-16 space-y-6 md:space-y-12">
        {/* Header Profile Section */}
        <div className="bg-white p-6 md:p-14 rounded-[2rem] md:rounded-[4.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10 w-full md:w-auto">
            <div className={`w-20 h-20 md:w-36 md:h-36 rounded-2xl md:rounded-[3.5rem] flex items-center justify-center text-3xl md:text-5xl font-black ${risk.color} shadow-2xl shadow-indigo-100 ring-4 md:ring-8 ring-gray-50 shrink-0`}>
              {patient.name.charAt(0)}
            </div>
            <div className="text-center md:text-left space-y-3 md:space-y-4 min-w-0">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-1 md:mb-2 truncate">{patient.name}</h2>
                <p className="text-[8px] md:text-xs font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.4em] ml-1">Identitas Rekam Medis Pasien</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className="px-3 md:px-5 py-1.5 md:py-2 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">G{patient.pregnancyNumber} P{patient.parityP} A{patient.parityA}</span>
                <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm border ${risk.color}`}>Triase {risk.label}</span>
                <span className="px-3 md:px-5 py-1.5 md:py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">Skor SPR: {patient.totalRiskScore + 2}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 relative z-10 w-full md:w-auto">
            <a href={`tel:${patient.phone}`} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-10 py-3.5 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-[2.5rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 font-black text-[10px] md:text-xs uppercase tracking-widest">
              <Phone size={18} /> Hubungi Pasien
            </a>
          </div>
          
          {/* Subtle Background Pattern */}
          <ShieldCheck size={200} className="absolute -right-10 -bottom-10 md:-right-20 md:-bottom-20 opacity-5 pointer-events-none rotate-12 text-indigo-900" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          {/* Left Column: Pregnancy Status & Info */}
          <div className="lg:col-span-1 space-y-6 md:space-y-10">
            <div className="bg-indigo-600 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-60 mb-8 md:mb-10 flex items-center gap-3">
                <Activity size={16} /> Kondisi Kehamilan
              </h3>
              <div className="space-y-6 md:space-y-8 relative z-10">
                <div className="flex justify-between items-end border-b border-white/10 pb-4 md:pb-5">
                  <p className="text-[9px] md:text-[10px] font-black uppercase opacity-60 tracking-widest">Usia Hamil</p>
                  <p className="text-2xl md:text-4xl font-black tracking-tighter">{progress?.weeks || '0'} Minggu</p>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4 md:pb-5">
                  <p className="text-[9px] md:text-[10px] font-black uppercase opacity-60 tracking-widest">HPL (Hari Lahir)</p>
                  <p className="text-lg md:text-xl font-black">{progress?.hpl || 'N/A'}</p>
                </div>
                <div className="pt-4 md:pt-6">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <p className="text-[9px] md:text-[10px] font-black uppercase opacity-60 tracking-widest">Progress Trimester</p>
                    <p className="text-sm md:text-lg font-black">{progress?.percentage || 0}%</p>
                  </div>
                  <div className="h-4 md:h-6 bg-black/20 rounded-full overflow-hidden p-1 md:p-1.5 border border-white/10">
                    <div className="h-full bg-white rounded-full shadow-2xl transition-all duration-1000 ease-out" style={{ width: `${progress?.percentage || 0}%` }} />
                  </div>
                </div>
              </div>
              <Baby size={180} className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none rotate-6 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
              <h3 className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 md:gap-3">
                <MapPin size={16} className="text-indigo-600" /> Lokasi Domisili
              </h3>
              <div className="space-y-4 md:space-y-6">
                <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100">
                  <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Alamat Lengkap</p>
                  <p className="text-xs md:text-sm font-bold text-gray-900 leading-relaxed">{patient.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 text-center">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase mb-1">Kelurahan</p>
                    <p className="text-[10px] md:text-xs font-black text-gray-900">{patient.kelurahan}</p>
                  </div>
                  <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 text-center">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase mb-1">Kecamatan</p>
                    <p className="text-[10px] md:text-xs font-black text-gray-900">{patient.kecamatan}</p>
                  </div>
                </div>
                {patient.lat && (
                  <div className="p-3 md:p-5 bg-indigo-50 border border-indigo-100 rounded-2xl md:rounded-3xl flex items-center justify-center gap-2 md:gap-3">
                    <MapPin size={14} className="text-indigo-600" />
                    <code className="text-[9px] md:text-[10px] font-black text-indigo-600 tracking-tighter">{patient.lat}, {patient.lng}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: ANC History Timeline */}
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
              <h3 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3 md:gap-4">
                <ClipboardCheck size={24} className="text-indigo-600 md:w-8 md:h-8" /> Riwayat Pemeriksaan
              </h3>
              <div className="px-4 md:px-6 py-1.5 md:py-2 bg-gray-900 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200">
                {patientVisits.length} Pemeriksaan
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {patientVisits.length === 0 ? (
                <div className="bg-white p-16 md:p-24 rounded-[2rem] md:rounded-[4rem] border-4 border-dashed border-gray-100 text-center flex flex-col items-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4 md:mb-6">
                    <Activity size={32} />
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-gray-300 uppercase tracking-widest">Belum Ada Catatan Klinis</h4>
                </div>
              ) : (
                patientVisits.map((visit, idx) => (
                  <div key={visit.id} className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-10" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Timeline Visit Header */}
                    <div className="bg-gray-50/70 px-6 md:px-10 py-6 md:py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl border border-gray-50 text-indigo-600 shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tighter truncate">{new Date(visit.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5 truncate">Oleh Nakes ID: {visit.nakesId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
                         <p className="text-[7px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest">Kontrol:</p>
                         <div className="px-4 md:px-6 py-1.5 md:py-2 bg-indigo-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black shadow-lg shadow-indigo-100 uppercase tracking-tighter">{visit.nextVisitDate}</div>
                      </div>
                    </div>

                    <div className="p-6 md:p-14 space-y-8 md:space-y-12">
                      {/* Medical Metrics Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
                        {[
                          { label: 'TD (mmHg)', val: visit.bloodPressure, icon: <Activity size={14}/>, color: 'text-indigo-600' },
                          { label: 'BB (Kg)', val: visit.weight, icon: <ClipboardCheck size={14}/>, color: 'text-indigo-600' },
                          { label: 'TFU (cm)', val: visit.tfu, icon: <Stethoscope size={14}/>, color: 'text-indigo-600' },
                          { label: 'DJJ (x/m)', val: visit.djj, icon: <Heart size={14}/>, color: 'text-red-600' },
                          { label: 'Hb (g/dL)', val: visit.hb, icon: <Droplets size={14}/>, color: 'text-blue-600' },
                        ].map((item, i) => (
                          <div key={i} className={`bg-white p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center transition-transform hover:scale-105 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                             <div className={`${item.color} mb-1.5 md:mb-3 opacity-60`}>{item.icon}</div>
                             <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">{item.label}</p>
                             <p className="text-sm md:text-lg font-black text-gray-900">{item.val}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                         <div className="space-y-4 md:space-y-6">
                            <h4 className="text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 underline decoration-indigo-200 underline-offset-8">
                              <AlertCircle size={14} className="text-red-500" /> Observasi Klinis
                            </h4>
                            {visit.dangerSigns.length > 0 ? (
                              <div className="flex flex-wrap gap-2 md:gap-3">
                                {visit.dangerSigns.map(s => (
                                  <span key={s} className="px-4 md:px-5 py-1.5 md:py-2 bg-red-600 text-white border border-red-700 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 md:gap-3 px-5 md:px-6 py-2.5 md:py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl md:rounded-2xl">
                                <CheckCircle size={14} />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Kondisi Aman Terkendali</span>
                              </div>
                            )}
                            <div className="bg-gray-50/70 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 relative group min-h-[100px]">
                               <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Catatan Perkembangan</p>
                               <p className="text-xs md:text-sm font-bold text-gray-600 leading-relaxed italic line-clamp-4 md:line-clamp-none">"{visit.nakesNotes || 'Tidak ada catatan nakes.'}"</p>
                               <BookOpen size={32} className="absolute right-4 bottom-4 md:right-6 md:bottom-6 opacity-5 text-indigo-900 group-hover:scale-110 transition-transform md:w-10 md:h-10" />
                            </div>
                         </div>

                         <div className="space-y-4 md:space-y-6">
                            <h4 className="text-[9px] md:text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 underline decoration-indigo-200 underline-offset-8">
                              <Info size={14} /> Keputusan Medis
                            </h4>
                            <div className={`p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 shadow-2xl relative overflow-hidden flex flex-col items-center text-center ${
                              visit.followUp === 'RUJUK_RS' ? 'bg-red-600 border-red-700 text-white shadow-red-200' : 
                              visit.followUp === 'KONSUL_DOKTER' ? 'bg-yellow-400 border-yellow-500 text-yellow-950 shadow-yellow-100' :
                              'bg-indigo-600 border-indigo-700 text-white shadow-indigo-100'
                            }`}>
                               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 opacity-60">Status Tindak Lanjut:</p>
                               <p className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none">{visit.followUp.replace('_', ' ')}</p>
                               <ShieldAlert size={80} className="absolute -right-6 -bottom-6 md:-right-10 md:-bottom-10 opacity-10 rotate-12 md:w-32 md:h-32" />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
