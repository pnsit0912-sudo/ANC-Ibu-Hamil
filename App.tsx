
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserRole, User, AppState, ANCVisit, SystemLog, SystemAlert } from './types';
import { MOCK_USERS, PUSKESMAS_INFO, WILAYAH_DATA, NAVIGATION } from './constants';
import { RISK_FACTORS_MASTER, calculatePregnancyProgress, getRiskCategory } from './utils';
import { 
  CheckCircle, AlertCircle, Users, Calendar, AlertTriangle,
  UserPlus, Edit3, X, Clock, Baby, Trash2, ShieldCheck, LayoutDashboard, Activity, 
  MapPin, ShieldAlert, QrCode, BookOpen, Map as MapIcon, Phone, Navigation as NavIcon, Crosshair,
  RefreshCw, Stethoscope, Heart, Droplets, Thermometer, ClipboardCheck, ArrowRight, ExternalLink,
  Info
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PatientList } from './PatientList';
import { LoginScreen } from './LoginScreen';
import { AccessManagement } from './AccessManagement';
import { RiskMonitoring } from './RiskMonitoring';
import { SmartCardModule, EducationModule, ContactModule } from './FeatureModules';
import { MapView } from './MapView';
import { PatientProfileView } from './PatientProfileView';

const STORAGE_KEY = 'SMART_ANC_V4_MASTER';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [patientSearch, setPatientSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState<User | null>(null);
  const [viewingPatientProfile, setViewingPatientProfile] = useState<string | null>(null);
  const [tempRiskFactors, setTempRiskFactors] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [formCoords, setFormCoords] = useState<{lat: string, lng: string}>({lat: '', lng: ''});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try { return JSON.parse(savedData); } catch (e) { console.error(e); }
    }
    return {
      currentUser: null,
      users: MOCK_USERS,
      ancVisits: [],
      alerts: [],
      selectedPatientId: null,
      logs: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (editingPatient) {
      setFormCoords({
        lat: editingPatient.lat?.toString() || '',
        lng: editingPatient.lng?.toString() || ''
      });
    } else {
      setFormCoords({lat: '', lng: ''});
    }
  }, [editingPatient]);

  const handleNavigate = (targetView: string) => {
    const navItem = NAVIGATION.find(n => n.path === targetView);
    if (navItem && currentUser && !navItem.roles.includes(currentUser.role)) {
      setView('dashboard');
      return;
    }
    setEditingPatient(null);
    setIsAddingVisit(null);
    setViewingPatientProfile(null);
    setTempRiskFactors([]);
    setView(targetView);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const showNotification = useCallback((message: string) => {
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolokasi tidak didukung oleh browser Anda.");
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormCoords({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        });
        setIsGettingLocation(false);
        showNotification("Lokasi berhasil didapatkan");
      },
      () => {
        alert("Gagal mendapatkan lokasi.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser?.role === UserRole.USER) return;

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
      pregnancyNumber: parseInt(formData.get('gravida') as string),
      parityP: parseInt(formData.get('para') as string),
      parityA: parseInt(formData.get('abortus') as string),
      medicalHistory: formData.get('history') as string,
      address: formData.get('address') as string,
      kecamatan: formData.get('kecamatan') as string,
      kelurahan: formData.get('kelurahan') as string,
      lat: parseFloat(formData.get('lat') as string) || undefined,
      lng: parseFloat(formData.get('lng') as string) || undefined,
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
        const generatedId = `u${Date.now().toString().slice(-4)}`;
        return { 
          ...prev, 
          users: [...prev.users, { ...data, id: generatedId, username: generatedId, password: generatedId, role: UserRole.USER, isActive: true } as User] 
        };
      }
    });

    handleNavigate('patients');
    showNotification(editingPatient ? 'Data diperbarui' : 'Pasien baru terdaftar');
  };

  const handleVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAddingVisit || !currentUser) return;

    const formData = new FormData(e.currentTarget);
    const visitData: ANCVisit = {
      id: `v${Date.now()}`,
      patientId: isAddingVisit.id,
      visitDate: new Date().toISOString().split('T')[0],
      scheduledDate: new Date().toISOString().split('T')[0],
      nextVisitDate: formData.get('nextVisit') as string,
      weight: parseFloat(formData.get('weight') as string),
      bloodPressure: formData.get('bp') as string,
      tfu: parseFloat(formData.get('tfu') as string),
      djj: parseFloat(formData.get('djj') as string),
      hb: parseFloat(formData.get('hb') as string),
      complaints: formData.get('complaints') as string,
      dangerSigns: formData.getAll('dangerSigns') as string[],
      edema: formData.get('edema') === 'on',
      fetalMovement: formData.get('fetalMovement') as string,
      followUp: formData.get('followUp') as string,
      nakesNotes: formData.get('notes') as string,
      nakesId: currentUser.id,
      status: 'COMPLETED'
    };

    setState(prev => ({
      ...prev,
      ancVisits: [...prev.ancVisits, visitData]
    }));

    setIsAddingVisit(null);
    showNotification('Pemeriksaan & Tindak Lanjut Disimpan');
  };

  const DashboardHome = () => {
    const patients = state.users.filter(u => u.role === UserRole.USER);
    
    if (currentUser?.role === UserRole.ADMIN) {
      return (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Populasi Akun</p>
               <h3 className="text-4xl md:text-5xl font-black">{state.users.length}</h3>
               <Users size={120} className="absolute -right-6 -bottom-6 opacity-10" />
            </div>
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Kunjungan</p>
               <h3 className="text-4xl md:text-5xl font-black text-gray-900">{state.ancVisits.length}</h3>
               <p className="text-[10px] font-bold text-emerald-500 mt-2">Sinkronisasi Cloud Aktif</p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Integritas Data</p>
                  <button onClick={() => handleNavigate('management')} className="w-full py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase">Kelola Hak Akses</button>
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentUser?.role === UserRole.NAKES) {
      const highRisk = patients.filter(p => p.totalRiskScore >= 8).length;
      return (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-red-600 p-8 md:p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Resiko Tinggi (KRT/KRST)</p>
               <h3 className="text-4xl md:text-5xl font-black mt-2">{highRisk} <span className="text-xl opacity-50">Ibu</span></h3>
               <button onClick={() => handleNavigate('monitoring')} className="mt-8 px-8 py-4 bg-white text-red-600 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">Monitoring</button>
               <ShieldAlert size={120} className="absolute -right-6 -bottom-6 opacity-10" />
            </div>
            <div className="bg-indigo-600 p-8 md:p-12 rounded-[3rem] text-white shadow-xl">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Antrian ANC</p>
               <h3 className="text-4xl md:text-5xl font-black mt-2">{patients.length} <span className="text-xl opacity-50">Pasien</span></h3>
               <button onClick={() => handleNavigate('register')} className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black uppercase backdrop-blur-md transition-all">Daftar Pasien Baru</button>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 flex flex-col justify-center text-center">
               <MapPin size={48} className="mx-auto text-indigo-100 mb-4" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Peta Sebaran</p>
               <button onClick={() => handleNavigate('map')} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase">Buka Pemetaan</button>
            </div>
          </div>
        </div>
      );
    }

    if (currentUser?.role === UserRole.USER) {
      const progress = calculatePregnancyProgress(currentUser.hpht);
      const risk = getRiskCategory(currentUser.totalRiskScore);

      return (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="bg-indigo-600 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Ibu {currentUser.name.split(' ')[0]}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                    <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xl">
                       <p className="text-[8px] font-black uppercase opacity-60">Usia Hamil</p>
                       <p className="text-lg font-black">{progress?.weeks} Minggu</p>
                    </div>
                    <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xl">
                       <p className="text-[8px] font-black uppercase opacity-60">HPL</p>
                       <p className="text-lg font-black">{progress?.hpl}</p>
                    </div>
                  </div>
                </div>
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-[10px] border-white/20 flex items-center justify-center relative">
                   <Baby size={48} className="text-white animate-bounce" />
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * (progress?.percentage || 0) / 100)} className="transition-all duration-1000" />
                   </svg>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-xl flex flex-col justify-between h-64 md:h-72 ${risk.color}`}>
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60">Status Kesehatan</p>
                   <h4 className="text-2xl md:text-3xl font-black uppercase mt-1">Triase {risk.label}</h4>
                </div>
                <p className="text-[10px] font-bold leading-relaxed">{risk.desc}</p>
             </div>
             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between h-64 md:h-72">
                <p className="text-[10px] font-black text-gray-400 uppercase">Bantuan Langsung</p>
                <button onClick={() => handleNavigate('contact')} className="w-full py-5 bg-red-600 text-white text-[10px] font-black rounded-2xl uppercase shadow-lg shadow-red-100">Hubungi Bidan</button>
             </div>
             <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-xl text-white flex flex-col justify-between h-64 md:h-72">
                <h4 className="text-2xl font-black">Dokumen Digital</h4>
                <button onClick={() => handleNavigate('smart-card')} className="w-full py-5 bg-white text-slate-900 text-[10px] font-black rounded-2xl uppercase flex items-center justify-center gap-2">
                  <QrCode size={16}/> Buka Kartu ANC
                </button>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!currentUser) return <LoginScreen users={state.users} onLogin={(u) => setCurrentUser(u)} />;

  const currentRisk = getRiskCategory(tempRiskFactors.reduce((acc, id) => acc + RISK_FACTORS_MASTER[id].score, 0));

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <Sidebar 
        currentView = {view} 
        onNavigate = {handleNavigate} 
        onLogout = {() => setCurrentUser(null)} 
        userRole = {currentUser?.role} 
        isOpen = {isSidebarOpen} 
        onToggle = {() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <main className={`transition-all duration-700 ${isSidebarOpen && window.innerWidth > 1024 ? 'lg:ml-80' : 'ml-0'}`}>
        <Header 
          title = {viewingPatientProfile ? "PROFIL MEDIS PASIEN" : view.toUpperCase()} 
          userName = {currentUser?.name || ''} 
          userRole = {currentUser?.role} 
          onToggleSidebar = {() => setIsSidebarOpen(!isSidebarOpen)} 
          onSearchChange = {setPatientSearch} 
          onLogout = {() => setCurrentUser(null)} 
          alerts = {state.alerts}
          onMarkAsRead = {() => {}}
          onNavigateToPatient = {handleNavigate}
        />

        <div className="p-4 md:p-12 lg:p-16 max-w-[1600px] mx-auto">
          {notification && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] px-8 py-5 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10">
              <CheckCircle size={20} className="text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
            </div>
          )}

          {/* Kondisi Rendering Profil Medis */}
          {viewingPatientProfile ? (
            <PatientProfileView 
              patient={state.users.find(u => u.id === viewingPatientProfile)!} 
              visits={state.ancVisits} 
              onClose={() => setViewingPatientProfile(null)} 
            />
          ) : (
            <>
              {view === 'dashboard' && <DashboardHome />}
              
              {(view === 'patients' && currentUser.role !== UserRole.USER) && (
                <PatientList 
                  users={state.users} visits={state.ancVisits} 
                  onEdit={(u) => { setEditingPatient(u); setTempRiskFactors(u.selectedRiskFactors); setView('register'); }} 
                  onAddVisit={(u) => setIsAddingVisit(u)}
                  onDeletePatient={(id) => setState(prev => ({...prev, users: prev.users.filter(u => u.id !== id)}))}
                  onDeleteVisit={() => {}}
                  onToggleVisitStatus={() => {}}
                  currentUserRole={currentUser.role} searchFilter={patientSearch}
                />
              )}

              {(view === 'register' && currentUser.role !== UserRole.USER) && (
                <div className="max-w-5xl mx-auto space-y-10 animate-in zoom-in-95">
                  <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                      <div className="flex items-center gap-6">
                        <div className="bg-indigo-600 p-5 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100"><UserPlus size={32} /></div>
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{editingPatient ? 'Ubah Data Pasien' : 'Pendaftaran Pasien ANC'}</h2>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Integrasi Rekam Medis & Geospasial</p>
                        </div>
                      </div>
                      <div className={`px-8 py-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-500 ${currentRisk.color}`}>
                        <div className="text-left">
                            <p className="text-[8px] font-black uppercase opacity-60">Status Resiko Live</p>
                            <p className="text-sm font-black uppercase tracking-widest">{currentRisk.label}</p>
                        </div>
                        <Activity size={24} className="animate-pulse" />
                      </div>
                    </div>
                    
                    <form onSubmit={handleRegisterSubmit} className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nama Lengkap Ibu</label>
                          <input name="name" defaultValue={editingPatient?.name} className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tanggal Lahir</label>
                          <input type="date" name="dob" defaultValue={editingPatient?.dob} className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nomor WhatsApp</label>
                          <input type="tel" name="phone" defaultValue={editingPatient?.phone} className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Baby size={16} /> Riwayat Kehamilan (G-P-A)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">HPHT</label>
                            <input type="date" name="hpht" defaultValue={editingPatient?.hpht} className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-200" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Gravida (G)</label>
                            <input type="number" name="gravida" placeholder="Hamil ke-" defaultValue={editingPatient?.pregnancyNumber} className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-200" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Para (P)</label>
                            <input type="number" name="para" defaultValue={editingPatient?.parityP} className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-200" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Abortus (A)</label>
                            <input type="number" name="abortus" defaultValue={editingPatient?.parityA} className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-200" required />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={16} /> Alamat Domisili</h4>
                          <textarea name="address" rows={2} defaultValue={editingPatient?.address} className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" required />
                          <div className="grid grid-cols-2 gap-4">
                            <select name="kecamatan" className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none"><option value="Pasar Minggu">Pasar Minggu</option></select>
                            <select name="kelurahan" defaultValue={editingPatient?.kelurahan} className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none">
                              {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex justify-between items-center"><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><NavIcon size={16} /> Koordinat</h4>
                            <button type="button" onClick={getCurrentLocation} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">
                              {isGettingLocation ? <RefreshCw size={12} className="animate-spin" /> : <Crosshair size={12} />} Ambil Lokasi
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input name="lat" value={formCoords.lat} onChange={(e) => setFormCoords({...formCoords, lat: e.target.value})} className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="Lat" />
                            <input name="lng" value={formCoords.lng} onChange={(e) => setFormCoords({...formCoords, lng: e.target.value})} className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="Lng" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2"><ShieldAlert size={16} /> Faktor Resiko Poedji Rochjati</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(RISK_FACTORS_MASTER).map(([id, info]) => (
                            <label key={id} className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${tempRiskFactors.includes(id) ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                              <input type="checkbox" className="mt-1 accent-indigo-600 w-4 h-4" checked={tempRiskFactors.includes(id)} onChange={(e) => {
                                if (e.target.checked) setTempRiskFactors([...tempRiskFactors, id]);
                                else setTempRiskFactors(tempRiskFactors.filter(f => f !== id));
                              }} />
                              <div><p className="text-[11px] font-black text-gray-900 leading-tight">{info.label}</p><p className="text-[9px] font-bold text-indigo-600 mt-1">+{info.score} Poin</p></div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-12 border-t border-gray-100 flex gap-6">
                        <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl">Simpan Rekam Medis</button>
                        <button type="button" onClick={() => handleNavigate('patients')} className="px-12 py-6 bg-gray-100 text-gray-500 rounded-[2.5rem] font-black uppercase text-xs tracking-widest">Batal</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Visit Form Modal - MODUL TINDAK LANJUT ANC */}
              {isAddingVisit && (
                <div className="fixed inset-0 z-[100] bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-y-auto">
                  <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="bg-indigo-600 p-8 md:p-12 text-white flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Pemeriksaan ANC</h2>
                        <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest mt-2">Ibu {isAddingVisit.name} | G{isAddingVisit.pregnancyNumber}P{isAddingVisit.parityP}A{isAddingVisit.parityA}</p>
                      </div>
                      <button onClick={() => setIsAddingVisit(null)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleVisitSubmit} className="p-8 md:p-16 space-y-12">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">BB (kg)</label>
                            <input name="weight" type="number" step="0.1" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">TD (mmHg)</label>
                            <input name="bp" placeholder="120/80" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">TFU (cm)</label>
                            <input name="tfu" type="number" step="0.1" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">DJJ (x/m)</label>
                            <input name="djj" type="number" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Hb (g/dL)</label>
                            <input name="hb" type="number" step="0.1" className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold" required />
                          </div>
                      </div>

                      <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 underline decoration-indigo-200"><AlertCircle size={14}/> Deteksi Tanda Bahaya</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Pusing Hebat', 'Perdarahan', 'Nyeri Perut Hebat', 'Ketuban Pecah', 'Bengkak Wajah/Kaki', 'Demam Tinggi'].map(s => (
                              <label key={s} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all cursor-pointer">
                                <input type="checkbox" name="dangerSigns" value={s} className="accent-red-600" />
                                <span className="text-[10px] font-bold text-gray-600 uppercase">{s}</span>
                              </label>
                            ))}
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><ClipboardCheck size={14}/> Tindak Lanjut (Follow-Up)</h4>
                            <select name="followUp" className="w-full p-5 bg-white border border-indigo-200 rounded-2xl font-black text-xs outline-none" required>
                              <option value="RUTIN">ANC RUTIN PUSKESMAS</option>
                              <option value="KONSUL_DOKTER">KONSULTASI DOKTER SPESIALIS</option>
                              <option value="RUJUK_RS">RUJUK KE RUMAH SAKIT (KRT/KRST)</option>
                              <option value="PEMANTAUAN_KETAT">PEMANTAUAN KETAT DI RUMAH</option>
                            </select>
                            <textarea name="notes" placeholder="Catatan Tambahan Nakes..." className="w-full p-5 bg-white border border-indigo-200 rounded-2xl font-bold text-xs outline-none" rows={3}></textarea>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Rencana Kontrol</h4>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase ml-4">Tanggal Kunjungan Berikutnya</label>
                              <input type="date" name="nextVisit" className="w-full p-5 bg-white border border-indigo-200 rounded-2xl font-black outline-none" required />
                            </div>
                            <div className="p-4 bg-indigo-600/10 rounded-2xl">
                              <p className="text-[9px] font-bold text-indigo-600 uppercase leading-relaxed">
                                <Info size={12} className="inline mr-1" /> Pasien dengan risiko tinggi wajib dilakukan pemeriksaan penunjang USG/Laboratorium lengkap.
                              </p>
                            </div>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] transition-all">Simpan Pemeriksaan</button>
                          <button type="button" onClick={() => setIsAddingVisit(null)} className="px-10 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest">Batal</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {view === 'management' && <AccessManagement state={state} setState={setState} currentUser={currentUser!} addLog={()=>{}} />}
              {view === 'monitoring' && <RiskMonitoring state={state} onViewProfile={(id)=>setViewingPatientProfile(id)} onAddVisit={(u)=>setIsAddingVisit(u)} onToggleVisitStatus={()=>{}} />}
              {view === 'map' && <MapView users={state.users} visits={state.ancVisits} />}
              {view === 'smart-card' && <SmartCardModule state={state} setState={setState} isUser={currentUser?.role === UserRole.USER} user={currentUser!} />}
              {view === 'education' && <EducationModule />}
              {view === 'contact' && <ContactModule />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
