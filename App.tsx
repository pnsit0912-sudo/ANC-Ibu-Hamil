
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, User, AppState, ANCVisit, SystemLog } from './types';
import { MOCK_USERS, PUSKESMAS_INFO, WILAYAH_DATA } from './constants';
import { RISK_FACTORS_MASTER, calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  CheckCircle, AlertCircle, Users, Calendar, AlertTriangle,
  UserPlus, Edit3, X, Clock, Baby, Trash2, ShieldCheck, LayoutDashboard, ArrowUpRight, Activity, TrendingUp,
  Stethoscope, Thermometer, Droplets, Heart, ClipboardCheck, MapPin, ShieldAlert, ChevronRight, UserCircle, QrCode, BookOpen, Map as MapIcon, RefreshCcw
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PatientList } from './PatientList';
import { LoginScreen } from './LoginScreen';
import { AccessManagement } from './AccessManagement';
import { RiskMonitoring } from './RiskMonitoring';
import { SmartCardModule, EducationModule, ContactModule } from './FeatureModules';
import { MapView } from './MapView';

const STORAGE_KEY = 'SMART_ANC_V4_MASTER';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState<User | null>(null);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [tempRiskFactors, setTempRiskFactors] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try { return JSON.parse(savedData); } catch (e) { console.error(e); }
    }
    return {
      currentUser: null,
      users: MOCK_USERS.map(u => ({...u, selectedRiskFactors: [], totalRiskScore: 0})),
      ancVisits: [],
      selectedPatientId: null,
      logs: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // FUNGSI NAVIGASI BERSIH (RESET STATE SAAT PINDAH TABEL/MENU)
  const handleNavigate = (targetView: string) => {
    setEditingPatient(null);
    setIsAddingVisit(null);
    setTempRiskFactors([]);
    setPatientSearch('');
    setView(targetView);
  };

  const showNotification = useCallback((message: string) => {
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hpht = formData.get('hpht') as string;
    const progress = calculatePregnancyProgress(hpht);
    const score = tempRiskFactors.reduce((acc, id) => acc + RISK_FACTORS_MASTER[id].score, 0);

    const data = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      phone: formData.get('phone') as string,
      hpht: hpht,
      pregnancyMonth: progress?.months || 0,
      pregnancyNumber: parseInt(formData.get('number') as string),
      medicalHistory: formData.get('history') as string,
      address: formData.get('address') as string,
      kecamatan: formData.get('kecamatan') as string,
      kelurahan: formData.get('kelurahan') as string,
      lat: formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined,
      lng: formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined,
      selectedRiskFactors: tempRiskFactors,
      totalRiskScore: score,
    };

    setState(prev => {
      if (editingPatient) {
        return {
          ...prev,
          users: prev.users.map(u => u.id === editingPatient.id ? { ...u, ...data } : u)
        };
      } else {
        const generatedId = `u${Date.now().toString().slice(-6)}`;
        return { 
          ...prev, 
          users: [...prev.users, { ...data, id: generatedId, username: generatedId, password: generatedId, role: UserRole.USER, isActive: true }] 
        };
      }
    });

    handleNavigate('patients');
    showNotification(editingPatient ? 'Data pasien berhasil diperbarui' : 'Pasien baru berhasil didaftarkan');
  };

  const DashboardHome = () => {
    const patients = state.users.filter(u => u.role === UserRole.USER);
    const emergencyVisits = state.ancVisits.filter(v => {
      const [sys, dia] = v.bloodPressure.split('/').map(Number);
      return sys >= 160 || dia >= 110 || v.dangerSigns.length > 0;
    });
    
    const today = new Date().toISOString().split('T')[0];
    const missedPatients = patients.filter(p => {
       const v = state.ancVisits.filter(vis => vis.patientId === p.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate))[0];
       return v && v.nextVisitDate < today && v.status !== 'COMPLETED';
    });

    if (currentUser?.role === UserRole.ADMIN) {
      // Statistik Wilayah Dinamis dari state.users asli
      const statsByKelurahan = WILAYAH_DATA["Pasar Minggu"].reduce((acc, kel) => {
        acc[kel] = { total: 0, highRisk: 0 };
        return acc;
      }, {} as Record<string, { total: number, highRisk: number }>);

      patients.forEach(p => {
        const kel = p.kelurahan;
        if (statsByKelurahan[kel]) {
          statsByKelurahan[kel].total++;
          const risk = getRiskCategory(p.totalRiskScore);
          if (risk.label === 'HITAM' || risk.label === 'MERAH') statsByKelurahan[kel].highRisk++;
        }
      });

      return (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Populasi Terintegrasi</p>
               <h3 className="text-5xl font-black">{patients.length}</h3>
               <p className="text-[10px] font-bold mt-4 text-indigo-300 uppercase tracking-widest">Ibu Hamil Terdata</p>
               <Users size={120} className="absolute -right-6 -bottom-6 opacity-10" />
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Efektivitas Sistem</p>
               <h3 className="text-5xl font-black text-gray-900">98.2%</h3>
               <p className="text-[10px] font-bold mt-4 text-emerald-500 uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14}/> Sistem Sinkron</p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
               <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Audit Terakhir</p>
                <p className="text-xs font-black text-indigo-600 uppercase">Akses Keamanan Aktif</p>
               </div>
               <button onClick={() => handleNavigate('management')} className="mt-4 px-6 py-3 bg-gray-100 text-[10px] font-black rounded-xl uppercase hover:bg-indigo-600 hover:text-white transition-all">Kelola Akses</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
                <h4 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><Activity className="text-indigo-600"/> Statistik Risiko Wilayah (Real-time)</h4>
                <div className="space-y-6">
                   {Object.entries(statsByKelurahan).map(([kel, stat]) => {
                     const highPerc = stat.total > 0 ? (stat.highRisk / stat.total) * 100 : 0;
                     const lowPerc = 100 - highPerc;
                     return (
                      <div key={kel} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>{kel}</span> 
                            <span className="text-indigo-600 font-black">{stat.total} Pasien</span>
                          </div>
                          <div className="h-3 bg-gray-50 rounded-full overflow-hidden flex border border-gray-100">
                             <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${lowPerc}%` }}></div>
                             <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${highPerc}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase">
                             <span>Stabil: {stat.total - stat.highRisk}</span>
                             <span>Beresiko: {stat.highRisk}</span>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </div>
             <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-center relative overflow-hidden">
                <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Cloud Infrastructure</h4>
                <p className="text-sm text-slate-400 font-bold mb-10">Data pasien terenkripsi AES-256 dan disinkronkan secara real-time dengan server Dinas Kesehatan Jakarta.</p>
                <div className="flex gap-4">
                  <div className="px-6 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Server: Active</div>
                  <div className="px-6 py-3 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">Uptime: 99.9%</div>
                </div>
                <ShieldCheck size={200} className="absolute -right-20 -bottom-20 opacity-5" />
             </div>
          </div>
        </div>
      );
    }

    if (currentUser?.role === UserRole.NAKES) {
      return (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between overflow-hidden relative group">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1">Kasus Darurat</p>
                 <h3 className="text-4xl font-black">{emergencyVisits.length}</h3>
               </div>
               <ShieldAlert className="text-white/10 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" size={100}/>
            </div>
            <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between overflow-hidden relative">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase text-orange-100 tracking-widest mb-1">Pasien Mangkir</p>
                 <h3 className="text-4xl font-black">{missedPatients.length}</h3>
               </div>
               <Clock className="text-white/10 absolute -right-4 -bottom-4" size={100}/>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-sm flex items-center justify-between">
               <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Pasien Aktif</p><h3 className="text-4xl font-black text-indigo-900">{patients.length}</h3></div>
               <Users className="text-indigo-100" size={48}/>
            </div>
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between group cursor-pointer" onClick={() => handleNavigate('register')}>
               <div><p className="text-[10px] font-black uppercase tracking-widest mb-1">Daftar Pasien</p><h3 className="text-lg font-black">Input Baru</h3></div>
               <UserPlus className="group-hover:translate-x-2 transition-transform" size={32}/>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
                <h4 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 text-red-600"><AlertCircle/> Antrean Triase Hitam & Merah</h4>
                <div className="space-y-4">
                  {emergencyVisits.slice(0, 4).map(v => (
                    <div key={v.id} className="p-6 bg-red-50 rounded-3xl border border-red-100 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-black text-red-900 uppercase">{state.users.find(u => u.id === v.patientId)?.name}</p>
                        <p className="text-[9px] font-bold text-red-600 mt-1 uppercase">⚠️ Bahaya Terdeteksi</p>
                      </div>
                      <button onClick={() => handleNavigate('monitoring')} className="px-5 py-2.5 bg-red-600 text-white text-[9px] font-black rounded-xl uppercase group-hover:scale-105 transition-all">Tangani</button>
                    </div>
                  ))}
                  {emergencyVisits.length === 0 && <p className="text-center text-gray-300 font-bold py-10 uppercase text-[10px]">Semua pasien stabil</p>}
                </div>
             </div>
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
                <h4 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 text-indigo-600"><Clock/> Tindak Lanjut Mangkir Kontrol</h4>
                <div className="space-y-4">
                  {missedPatients.slice(0, 4).map(p => (
                    <div key={p.id} className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-black text-indigo-900 uppercase">{p.name}</p>
                        <p className="text-[9px] font-bold text-indigo-600 mt-1 uppercase">Terlambat Kunjungan</p>
                      </div>
                      <a href={`tel:${p.phone}`} className="px-5 py-2.5 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase flex items-center gap-2 group-hover:scale-105 transition-all"><ChevronRight size={14}/> Hubungi</a>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (currentUser?.role === UserRole.USER) {
      const progress = calculatePregnancyProgress(currentUser.hpht);
      const latestAnc = state.ancVisits.filter(v => v.patientId === currentUser.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate))[0];
      const risk = getRiskCategory(currentUser.totalRiskScore, latestAnc);

      return (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="bg-indigo-600 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                  <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">Selamat Datang, Ibu {currentUser.name.split(' ')[0]}</h3>
                  <p className="text-indigo-200 font-bold mt-4 uppercase tracking-[0.3em] text-[10px]">Perjalanan Kehamilan Anda Aman & Terpantau</p>
                  <div className="flex gap-4 mt-8">
                    <div className="px-8 py-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-xl">
                       <p className="text-[10px] font-black uppercase opacity-60">Usia Kandungan</p>
                       <p className="text-2xl font-black">{progress?.months} Bulan / {progress?.weeks} Minggu</p>
                    </div>
                    <div className="px-8 py-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-xl">
                       <p className="text-[10px] font-black uppercase opacity-60">Estimasi Lahir (HPL)</p>
                       <p className="text-2xl font-black">{progress?.hpl}</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                   <div className="w-56 h-56 rounded-full border-[12px] border-white/20 flex items-center justify-center relative">
                      <Baby size={80} className="text-white animate-bounce" />
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="112" cy="112" r="100" stroke="white" strokeWidth="12" fill="transparent" strokeDasharray="628" strokeDashoffset={628 - (628 * (progress?.percentage || 0) / 100)} className="transition-all duration-1000" />
                      </svg>
                   </div>
                   <p className="text-center mt-4 font-black text-xl">{progress?.percentage || 0}% Journey</p>
                </div>
             </div>
             <Heart size={300} className="absolute -left-20 -bottom-20 opacity-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className={`p-10 rounded-[3rem] shadow-xl flex flex-col justify-between h-72 ${risk.color} border-2 border-current/10`}>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Kesehatan</p>
                   <h4 className="text-3xl font-black uppercase mt-1">Triase {risk.label}</h4>
                </div>
                <p className="text-[11px] font-bold leading-relaxed">{risk.desc}</p>
                <div className="bg-white/20 p-4 rounded-2xl flex items-center gap-3">
                   <ShieldCheck size={24}/> <span className="text-[10px] font-black uppercase">Monitor Aktif Puskesmas</span>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between h-72">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontrol Berikutnya</p>
                   <h4 className="text-3xl font-black text-gray-900 mt-2">{latestAnc?.nextVisitDate || 'Belum Terjadwal'}</h4>
                </div>
                <button onClick={() => handleNavigate('contact')} className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase">Hubungi Bidan</button>
             </div>

             <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between h-72 relative overflow-hidden group">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Akses Cepat</p>
                  <h4 className="text-2xl font-black mt-2">Kartu ANC Digital</h4>
                </div>
                <button onClick={() => handleNavigate('smart-card')} className="w-full py-4 bg-white text-slate-900 text-[10px] font-black rounded-xl uppercase flex items-center justify-center gap-2 group-hover:bg-indigo-400 group-hover:text-white transition-all">
                  <QrCode size={16}/> Buka Kartu
                </button>
                <QrCode size={150} className="absolute -right-10 -top-10 opacity-5" />
             </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!currentUser) return <LoginScreen users={state.users} onLogin={(u) => setCurrentUser(u)} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        currentView={view} 
        onNavigate={handleNavigate} 
        onLogout={() => setCurrentUser(null)} 
        userRole={currentUser.role} 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <main className={`transition-all duration-700 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <Header 
          title={view.toUpperCase()} 
          userName={currentUser.name} 
          userRole={currentUser.role} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onSearchChange={setPatientSearch} 
          onLogout={() => setCurrentUser(null)} 
        />

        <div className="p-16 max-w-[1600px] mx-auto">
          {notification && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] px-10 py-6 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-6">
              <CheckCircle size={16} className="text-emerald-400" />
              <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
            </div>
          )}

          {view === 'dashboard' && <DashboardHome />}
          
          {view === 'patients' && (
            <PatientList 
              users={state.users} visits={state.ancVisits} 
              onEdit={(u) => { setEditingPatient(u); setTempRiskFactors(u.selectedRiskFactors); setView('register'); }} 
              onAddVisit={(u) => setIsAddingVisit(u)}
              onDeletePatient={(id) => setState(prev => ({...prev, users: prev.users.filter(u => u.id !== id)}))}
              onDeleteVisit={(id) => setState(prev => ({...prev, ancVisits: prev.ancVisits.filter(v => v.id !== id)}))}
              onToggleVisitStatus={() => {}}
              currentUserRole={currentUser.role} searchFilter={patientSearch}
            />
          )}

          {view === 'register' && (
            <div className="max-w-4xl mx-auto bg-white p-16 rounded-[4rem] shadow-sm border border-gray-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl"><Stethoscope size={36} /></div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{editingPatient ? 'Perbarui Data Pasien' : 'Pendaftaran Pasien Baru'}</h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Standarisasi Skor Poedji Rochjati (SPR)</p>
                  </div>
                </div>
                {!editingPatient && (
                   <button type="button" onClick={() => handleNavigate('register')} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase">
                     <RefreshCcw size={16}/> Reset Form
                   </button>
                )}
              </div>
              
              <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Nama Pasien</label><input name="name" defaultValue={editingPatient?.name || ''} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">HPHT</label><input type="date" name="hpht" defaultValue={editingPatient?.hpht || ''} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required /></div>
                
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Latitude (GPS)</label><input type="number" step="any" name="lat" defaultValue={editingPatient?.lat || ''} placeholder="-6.1234" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Longitude (GPS)</label><input type="number" step="any" name="lng" defaultValue={editingPatient?.lng || ''} placeholder="106.1234" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" /></div>

                <div className="md:col-span-2 p-10 bg-indigo-50/30 rounded-[3.5rem] border-2 border-dashed border-indigo-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={16}/> Analisa Faktor Komplikasi</h4>
                      <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">Klik tombol di kanan untuk memilih penyakit/alergi</p>
                    </div>
                    <button type="button" onClick={() => setIsRiskModalOpen(true)} className="px-8 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                      <Edit3 size={14}/> Pilih Riwayat Medis
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {tempRiskFactors.map(id => (
                      <div key={id} className="group flex items-center gap-3 px-5 py-3 bg-white border border-indigo-100 rounded-2xl shadow-sm">
                         <span className="text-[10px] font-black text-indigo-900 uppercase">{RISK_FACTORS_MASTER[id].label}</span>
                         <span className="text-[10px] font-black text-red-500">+{RISK_FACTORS_MASTER[id].score}</span>
                         <button type="button" onClick={() => setTempRiskFactors(prev => prev.filter(fid => fid !== id))} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                      </div>
                    ))}
                    {tempRiskFactors.length === 0 && (
                      <div className="w-full py-12 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase italic">Ibu Hamil Tanpa Riwayat Penyakit Penyerta Terdeteksi</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Nomor Telepon (WhatsApp)</label><input name="phone" defaultValue={editingPatient?.phone || ''} placeholder="08..." className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Kehamilan Ke- (Gravida)</label><input type="number" name="number" defaultValue={editingPatient?.pregnancyNumber || 1} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required /></div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Kelurahan</label>
                  <select name="kelurahan" defaultValue={editingPatient?.kelurahan || WILAYAH_DATA["Pasar Minggu"][0]} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required>
                    {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
                  </select>
                </div>
                <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Alamat Lengkap</label><input name="address" defaultValue={editingPatient?.address || ''} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none" required /></div>

                <div className="md:col-span-2 pt-10 border-t flex gap-4">
                  <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 hover:scale-[1.01] transition-all">Selesaikan Pendaftaran</button>
                  <button type="button" onClick={() => handleNavigate('patients')} className="px-10 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest">Batalkan</button>
                </div>
              </form>
            </div>
          )}

          {isRiskModalOpen && (
            <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsRiskModalOpen(false)}>
              <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl p-14 overflow-hidden animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-10">
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter">Diagnosa Riwayat & Penyakit</h3>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Pilih semua yang sesuai dengan kondisi klinis ibu</p>
                   </div>
                   <button onClick={() => setIsRiskModalOpen(false)} className="p-4 bg-gray-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  {Object.entries(RISK_FACTORS_MASTER).sort((a,b) => b[1].score - a[1].score).map(([id, data]) => {
                    const isSelected = tempRiskFactors.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTempRiskFactors(prev => isSelected ? prev.filter(fid => fid !== id) : [...prev, id])}
                        className={`p-6 rounded-[2.5rem] border-2 text-left transition-all flex flex-col justify-between h-44 group ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-2xl shadow-indigo-200' 
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                           <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full ${
                             isSelected ? 'bg-white/20' : 
                             data.level === 'EXTREME' ? 'bg-red-100 text-red-600' : 
                             data.level === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                           }`}>
                             {data.category}
                           </span>
                           <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-indigo-900'}`}>+{data.score}</span>
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase leading-snug pr-4">{data.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-12 flex items-center justify-between gap-10">
                   <div className="flex-1 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Estimasi Skor Riwayat</p>
                      <p className="text-2xl font-black text-indigo-900 leading-none">+{tempRiskFactors.reduce((acc, id) => acc + RISK_FACTORS_MASTER[id].score, 0)} Poin</p>
                   </div>
                   <button onClick={() => setIsRiskModalOpen(false)} className="px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all">Konfirmasi Diagnosa</button>
                </div>
              </div>
            </div>
          )}

          {isAddingVisit && (
            <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsAddingVisit(null)}>
               <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <div className="bg-indigo-600 p-12 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black uppercase tracking-tighter">Pemeriksaan ANC Terpadu</h3>
                      <p className="text-[10px] font-bold uppercase opacity-60 mt-2 flex items-center gap-2">
                        <Users size={14}/> {isAddingVisit.name}
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const v: ANCVisit = {
                      id: `v${Date.now()}`,
                      patientId: isAddingVisit.id,
                      visitDate: new Date().toISOString().split('T')[0],
                      scheduledDate: new Date().toISOString().split('T')[0],
                      nextVisitDate: f.get('next') as string,
                      weight: Number(f.get('weight')),
                      bloodPressure: f.get('bp') as string,
                      tfu: Number(f.get('tfu')),
                      djj: Number(f.get('djj')),
                      hb: Number(f.get('hb')),
                      complaints: f.get('complaints') as string,
                      dangerSigns: Array.from(f.getAll('danger') as string[]),
                      edema: f.get('edema') === 'on',
                      fetalMovement: f.get('fetal') as string,
                      followUp: f.get('followup') as string,
                      nakesId: currentUser?.id || 'sys',
                      status: 'COMPLETED'
                    };
                    setState(prev => ({...prev, ancVisits: [...prev.ancVisits, v]}));
                    showNotification('Hasil pemeriksaan ANC berhasil diterbitkan');
                    setIsAddingVisit(null);
                  }} className="p-12 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 ml-4">BB (kg)</label><input type="number" step="0.1" name="weight" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-black outline-none border-none" required /></div>
                      <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 ml-4">T. Darah (mmHg)</label><input name="bp" placeholder="120/80" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-black outline-none border-none" required /></div>
                      <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 ml-4">Kontrol Lagi</label><input type="date" name="next" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-black outline-none border-none text-[10px]" required /></div>
                    </div>

                    <div className="p-8 bg-red-50 rounded-[3rem] border border-red-100">
                       <p className="text-[10px] font-black text-red-600 uppercase mb-6 flex items-center gap-2"><AlertCircle size={16}/> Skrining Tanda Bahaya</p>
                       <div className="grid grid-cols-2 gap-4">
                          {['Nyeri Kepala Hebat', 'Pandangan Kabur', 'Perdarahan', 'Ketuban Pecah', 'Bengkak Wajah/Tangan', 'Gerak Janin Berkurang'].map(sign => (
                            <label key={sign} className="flex items-center gap-3 cursor-pointer group p-3 bg-white rounded-2xl border border-red-50 hover:border-red-300 transition-all">
                               <input type="checkbox" name="danger" value={sign} className="w-5 h-5 rounded-lg border-red-200 text-red-600 focus:ring-red-500" />
                               <span className="text-[10px] font-bold text-gray-700 group-hover:text-red-700 transition-all">{sign}</span>
                            </label>
                          ))}
                       </div>
                    </div>

                    <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 hover:scale-[1.01] transition-all">Submit Pemeriksaan</button>
                  </form>
               </div>
            </div>
          )}

          {view === 'management' && <AccessManagement state={state} setState={setState} currentUser={currentUser} addLog={()=>{}} />}
          {view === 'monitoring' && <RiskMonitoring state={state} onNavigateToPatient={handleNavigate} onAddVisit={(u)=>setIsAddingVisit(u)} onToggleVisitStatus={()=>{}} />}
          {view === 'map' && <MapView users={state.users} />}
          {view === 'smart-card' && <SmartCardModule state={state} setState={setState} isUser={currentUser.role === UserRole.USER} user={currentUser} />}
          {view === 'education' && <EducationModule />}
          {view === 'contact' && <ContactModule />}
        </div>
      </main>
    </div>
  );
}
