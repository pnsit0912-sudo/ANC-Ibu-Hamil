
import React from 'react';
import { User, ANCVisit, UserRole } from './types';
import { calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  X, Baby, Calendar, MapPin, Activity, Stethoscope, 
  Heart, Droplets, AlertCircle, ClipboardCheck, ArrowLeft, Phone, Info
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 p-6 md:p-12">
      {/* Header Profile */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all z-20"
          title="Tutup Profil"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black ${risk.color} shadow-xl`}>
            {patient.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">{patient.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">G{patient.pregnancyNumber} P{patient.parityP} A{patient.parityA}</span>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${risk.color}`}>Triase {risk.label}</span>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Skor Dasar: {patient.totalRiskScore + 2}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <a href={`tel:${patient.phone}`} className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
            <Phone size={24} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Basic Info & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-8">Status Kehamilan</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <p className="text-[10px] font-black uppercase opacity-60">Usia Hamil</p>
                <p className="text-2xl font-black">{progress?.weeks || '0'} Minggu</p>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <p className="text-[10px] font-black uppercase opacity-60">Perkiraan Lahir (HPL)</p>
                <p className="text-xl font-black">{progress?.hpl || 'N/A'}</p>
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-black uppercase opacity-60 mb-3">Progress Trimester</p>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/10">
                  <div className="h-full bg-white rounded-full shadow-lg transition-all duration-1000" style={{ width: `${progress?.percentage || 0}%` }} />
                </div>
                <p className="text-[9px] font-bold text-right mt-2">{progress?.percentage || 0}% Perjalanan Kehamilan</p>
              </div>
            </div>
            <Baby size={180} className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none" />
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" /> Domisili Pasien
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Alamat Lengkap</p>
                <p className="text-sm font-bold text-gray-900 mt-1 leading-relaxed">{patient.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Kelurahan</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">{patient.kelurahan}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Kecamatan</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">{patient.kecamatan}</p>
                </div>
              </div>
              {patient.lat && (
                <div className="pt-4 flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MapPin size={16} />
                  </div>
                  <code className="text-[10px] font-black text-indigo-400">{patient.lat}, {patient.lng}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Medical History & Tindak Lanjut */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
              <ClipboardCheck size={28} className="text-indigo-600" /> Riwayat Pemeriksaan ANC
            </h3>
          </div>

          <div className="space-y-6">
            {patientVisits.length === 0 ? (
              <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-gray-100 text-center">
                <Activity size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Belum Ada Riwayat Pemeriksaan</p>
              </div>
            ) : (
              patientVisits.map((visit, idx) => (
                <div key={visit.id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-10" style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Visit Header */}
                  <div className="bg-gray-50/50 px-10 py-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-indigo-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">Pemeriksaan {new Date(visit.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">Oleh Nakes ID: {visit.nakesId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Kontrol Berikutnya:</p>
                       <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">{visit.nextVisitDate}</span>
                    </div>
                  </div>

                  {/* Clinical Data Row */}
                  <div className="p-10">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
                      {[
                        { label: 'TD (mmHg)', val: visit.bloodPressure, icon: <Activity size={14}/> },
                        { label: 'BB (Kg)', val: visit.weight, icon: <ClipboardCheck size={14}/> },
                        { label: 'TFU (cm)', val: visit.tfu, icon: <Stethoscope size={14}/> },
                        { label: 'DJJ (x/m)', val: visit.djj, icon: <Heart size={14}/> },
                        { label: 'Hb (g/dL)', val: visit.hb, icon: <Droplets size={14}/> },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">{item.icon} {item.label}</p>
                           <p className="text-base font-black text-gray-900">{item.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 underline decoration-indigo-200"><AlertCircle size={14}/> Temuan Klinis</h4>
                          {visit.dangerSigns.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {visit.dangerSigns.map(s => (
                                <span key={s} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase">{s}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                              <CheckCircle2 size={14} /> Tidak ditemukan tanda bahaya.
                            </p>
                          )}
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Keluhan / Catatan</p>
                             <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{visit.nakesNotes || 'Tidak ada catatan tambahan.'}"</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 underline decoration-indigo-200"><Info size={14}/> Tindak Lanjut & Rencana (Plan)</h4>
                          <div className={`p-6 rounded-[2rem] border-2 shadow-sm ${
                            visit.followUp === 'RUJUK_RS' ? 'bg-red-600 border-red-700 text-white' : 
                            visit.followUp === 'KONSUL_DOKTER' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                            'bg-indigo-50 border-indigo-100 text-indigo-900'
                          }`}>
                             <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Instruksi Medis:</p>
                             <p className="text-xl font-black tracking-tighter uppercase">{visit.followUp.replace('_', ' ')}</p>
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
  );
};

const CheckCircle2 = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
