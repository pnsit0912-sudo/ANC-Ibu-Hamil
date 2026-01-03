
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserRole, User, AppState, ANCVisit, SystemLog, SystemAlert } from './types';
import { MOCK_USERS, PUSKESMAS_INFO, WILAYAH_DATA, NAVIGATION, MOCK_ANC_VISITS } from './constants';
import { RISK_FACTORS_MASTER, calculatePregnancyProgress, getRiskCategory, getBabySizeByWeek } from './utils';
import { 
  CheckCircle, AlertCircle, Users, Calendar, AlertTriangle,
  UserPlus, Edit3, X, Clock, Baby, Trash2, ShieldCheck, LayoutDashboard, Activity, 
  MapPin, ShieldAlert, QrCode, BookOpen, Map as MapIcon, Phone, Navigation as NavIcon, Crosshair,
  RefreshCw, Stethoscope, Heart, Droplets, Thermometer, ClipboardCheck, ArrowRight, ExternalLink,
  Info, Bell, Eye, Star, TrendingUp, CheckSquare, Zap, Shield, List, Sparkles, BrainCircuit, Waves, Utensils, Download, Upload, Database
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
const DATABASE_VERSION = '4.0.1';

const DAILY_TASKS = [
  { task: 'Minum Tablet Tambah Darah', time: 'Malam Hari', icon: <Droplets size={16} /> },
  { task: 'Hitung 10 Gerakan Janin', time: 'Setiap Hari', icon: <Activity size={16} /> },
  { task: 'Konsumsi Protein Tinggi', time: 'Sarapan/Maksi', icon: <Utensils size={16} /> }
];

const getTrimesterAdvice = (weeks: number) => {
  if (weeks <= 13) return "Trimester 1: Fokus pada asupan Asam Folat untuk perkembangan saraf janin. Istirahat cukup jika sering mual (morning sickness).";
  if (weeks <= 26) return "Trimester 2: Mulai hitung gerakan janin. Konsumsi kalsium tinggi untuk pembentukan tulang bayi dan cegah anemia dengan zat besi.";
  return "Trimester 3: Waspadai tanda persalinan dan Pre-eklampsia (pusing hebat/kaki bengkak). Siapkan tas persalinan dan perlengkapan bayi.";
};

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
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formCoords, setFormCoords] = useState<{lat: string, lng: string}>({lat: '', lng: ''});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [visitPreviewData, setVisitPreviewData] = useState<Partial<ANCVisit>>({
    bloodPressure: '120/80',
    dangerSigns: [],
    fetalMovement: 'Normal',
    djj: 140
  });

  const [state, setState] = useState<AppState>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try { 
        const parsed = JSON.parse(savedData);
        // Validasi struktur data minimal
        if (parsed.users && Array.isArray(parsed.users)) {
           if (!parsed.userChecklists) parsed.userChecklists = {};
           if (!parsed.ancVisits || parsed.ancVisits.length === 0) parsed.ancVisits = MOCK_ANC_VISITS;
           return parsed; 
        }
      } catch (e) { console.error("Database Error:", e); }
    }
    
    // Default State jika database kosong/rusak
    return {
      currentUser: null,
      users: MOCK_USERS,
      ancVisits: MOCK_ANC_VISITS,
      alerts: [],
      selectedPatientId: null,
      logs: [
        { id: 'l1', timestamp: new Date().toISOString(), userId: 'system', userName: 'System', action: 'INIT', module: 'CORE', details: 'Database Smart ANC Berhasil Dimuat' }
      ],
      userChecklists: {}
    };
  });

  // Sinkronisasi otomatis ke LocalStorage dengan indikator "Sync"
  useEffect(() => {
    setIsSyncing(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const timer = setTimeout(() => setIsSyncing(false), 500);
    return () => clearTimeout(timer);
  }, [state]);

  const addLog = useCallback((action: string, module: string, details: string) => {
    if (!currentUser) return;
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      details
    };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100)
    }));
  }, [currentUser]);

  const handleExportSystemData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `SMART_ANC_DB_EXPORT_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification("Database berhasil diekspor");
  };

  const handleImportSystemData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedState = JSON.parse(content);
        if (importedState.users && Array.isArray(importedState.users)) {
          setState(importedState);
          showNotification("Database berhasil diimpor & disinkronkan");
          addLog('IMPORT_DB', 'SYSTEM', 'Admin melakukan restorasi database eksternal');
        } else {
          alert("File JSON tidak valid.");
        }
      } catch (err) {
        alert("Gagal membaca file database.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  const toggleDailyTask = (patientId: string, taskTitle: string) => {
    setState(prev => {
      const currentChecklist = prev.userChecklists[patientId] || {};
      const newStatus = !currentChecklist[taskTitle];
      
      const updated = {
        ...prev,
        userChecklists: {
          ...prev.userChecklists,
          [patientId]: {
            ...currentChecklist,
            [taskTitle]: newStatus
          }
        }
      };

      if (currentUser?.role === UserRole.USER) {
        const logAction = newStatus ? 'TASK_COMPLETED' : 'TASK_UNCHECKED';
        const newLog: SystemLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: logAction,
          module: 'DAILY_CHECKLIST',
          details: `${logAction}: ${taskTitle}`
        };
        updated.logs = [newLog, ...updated.logs].slice(0, 100);
      }

      return updated;
    });
  };

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
    const scoreFromFactors = tempRiskFactors.reduce((acc, id) => acc + (RISK_FACTORS_MASTER[id]?.score || 0), 0);

    const data = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      phone: formData.get('phone') as string,
      hpht: hpht,
      pregnancyMonth: progress?.months || 0,
      pregnancyNumber: parseInt(formData.get('gravida') as string || '0'),
      parityP: parseInt(formData.get('para') as string || '0'),
      parityA: parseInt(formData.get('abortus') as string || '0'),
      medicalHistory: formData.get('history') as string,
      address: formData.get('address') as string,
      kecamatan: formData.get('kecamatan') as string,
      kelurahan: formData.get('kelurahan') as string,
      lat: parseFloat(formData.get('lat') as string) || parseFloat(formCoords.lat) || undefined,
      lng: parseFloat(formData.get('lng') as string) || parseFloat(formCoords.lng) || undefined,
      selectedRiskFactors: tempRiskFactors,
      totalRiskScore: scoreFromFactors,
    };

    setState(prev => {
      if (editingPatient) {
        addLog('UPDATE_PATIENT', 'PATIENT', `Mengubah data pasien ${data.name}`);
        return {
          ...prev,
          users: prev.users.map(u => u.id === editingPatient.id ? { ...u, ...data } : u)
        };
      } else {
        const generatedId = `ANC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        addLog('REGISTER_PATIENT', 'PATIENT', `Mendaftarkan pasien baru ${data.name}`);
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
    const dangerSigns = formData.getAll('dangerSigns') as string[];
    
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
      dangerSigns: dangerSigns,
      edema: formData.get('edema') === 'on',
      fetalMovement: formData.get('fetalMovement') as string,
      followUp: formData.get('followUp') as string,
      nakesNotes: formData.get('notes') as string,
      nakesId: currentUser.id,
      status: 'COMPLETED'
    };

    const finalRisk = getRiskCategory(isAddingVisit.totalRiskScore, visitData);

    setState(prev => {
      const newAlerts = [...prev.alerts];
      if (finalRisk.label === 'HITAM' || finalRisk.label === 'MERAH') {
        newAlerts.unshift({
          id: `alert-${Date.now()}`,
          type: 'EMERGENCY',
          patientId: isAddingVisit.id,
          patientName: isAddingVisit.name,
          message: `Pasien terdeteksi risiko ${finalRisk.label} pada pemeriksaan hari ini!`,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      }

      addLog('ANC_VISIT', 'ANC', `Melakukan pemeriksaan ANC untuk ${isAddingVisit.name}`);
      return {
        ...prev,
        ancVisits: [...prev.ancVisits, visitData],
        alerts: newAlerts.slice(0, 50)
      };
    });

    setIsAddingVisit(null);
    showNotification('Pemeriksaan Berhasil Disimpan & Terintegrasi');
  };

  const liveTriase = useMemo(() => {
    if (!isAddingVisit) return null;
    return getRiskCategory(isAddingVisit.totalRiskScore, visitPreviewData);
  }, [isAddingVisit, visitPreviewData]);

  const DashboardHome = () => {
    const patients = useMemo(() => state.users.filter(u => u.role === UserRole.USER), [state.users]);
    const today = new Date().toISOString().split('T')[0];

    // --- ADMIN DASHBOARD ---
    if (currentUser?.role === UserRole.ADMIN) {
      return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Integritas Akun</p>
                  <h3 className="text-3xl md:text-4xl font-black mt-2 tracking-tighter">{state.users.length}</h3>
                </div>
                <Users className="text-indigo-500/20 self-end transition-transform group-hover:rotate-12" size={32} />
             </div>
             <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layanan Terpadu</p>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 tracking-tighter">{state.ancVisits.length}</h3>
                </div>
                <TrendingUp className="text-emerald-500 self-end transition-transform group-hover:-translate-y-1" size={32} />
             </div>
             <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Aktivitas</p>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 tracking-tighter">{state.logs.length}</h3>
                </div>
                <Shield className="text-indigo-500 self-end transition-transform group-hover:scale-110" size={32} />
             </div>
             <div className="bg-indigo-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Status Sistem</p>
                  <h3 className="text-lg md:text-xl font-black mt-2 flex items-center gap-2">Online <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/></h3>
                </div>
                <RefreshCw className={`text-white/20 self-end ${isSyncing ? 'animate-spin' : ''}`} size={32} />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Clock size={20} className="text-indigo-600"/> Audit Log Real-time</h4>
                  <button onClick={() => handleNavigate('management')} className="text-[9px] md:text-[10px] font-black uppercase text-indigo-600 hover:underline">Kelola Akses</button>
                </div>
                <div className="space-y-3 md:space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto no-scrollbar">
                  {state.logs.slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 transition-all hover:bg-indigo-50/50">
                       <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 border border-gray-200 shadow-sm shrink-0"><Zap size={16}/></div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-[11px] font-black text-gray-900 uppercase truncate">{log.action}</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-gray-400 mt-0.5 leading-tight line-clamp-1">{log.details}</p>
                       </div>
                       <p className="text-[8px] font-black text-gray-300 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-6 md:mb-8 flex items-center gap-3"><Users size={20} className="text-indigo-600"/> Matriks Pengguna</h4>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-6 md:p-8 bg-indigo-50 rounded-2xl md:rounded-3xl text-center border border-indigo-100">
                        <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Nakes Terdaftar</p>
                        <p className="text-3xl md:text-4xl font-black text-indigo-900">{state.users.filter(u => u.role === UserRole.NAKES).length}</p>
                    </div>
                    <div className="p-6 md:p-8 bg-emerald-50 rounded-2xl md:rounded-3xl text-center border border-emerald-100">
                        <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Pasien Aktif</p>
                        <p className="text-3xl md:text-4xl font-black text-emerald-900">{patients.length}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-8 p-6 md:p-8 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden group gap-4">
                   <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                      <Database className="text-emerald-400 shrink-0" size={24} />
                      <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Status Database</p>
                        <p className="text-xs md:text-sm font-black uppercase truncate">v{DATABASE_VERSION} Local-First</p>
                      </div>
                   </div>
                   <button onClick={handleExportSystemData} className="w-full md:w-auto relative z-10 px-5 md:px-6 py-2.5 md:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all">Download DB</button>
                   <Waves className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-45" />
                </div>
             </div>
          </div>
        </div>
      );
    }

    // --- NAKES DASHBOARD ---
    if (currentUser?.role === UserRole.NAKES) {
      const priorityList = patients.map(p => {
        const pVisits = state.ancVisits.filter(v => v.patientId === p.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate));
        const latest = pVisits[0];
        return { ...p, risk: getRiskCategory(p.totalRiskScore, latest), latestVisit: latest };
      }).filter(p => p.risk.label === 'HITAM' || p.risk.label === 'MERAH')
      .sort((a,b) => (a.risk.priority || 0) - (b.risk.priority || 0));

      return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-2 space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 gap-4">
                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3"><ShieldAlert className="text-red-600"/> Triase Pantauan Kritis</h4>
                <div className="px-4 md:px-5 py-2 md:py-2.5 bg-red-50 text-red-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100">{priorityList.length} Kasus Mendesak</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {priorityList.slice(0, 4).map(p => (
                  <div key={p.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm relative group overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                    <div className={`absolute top-0 right-0 w-24 md:w-32 h-1.5 md:h-2 ${p.risk.label === 'HITAM' ? 'bg-slate-950' : 'bg-red-600'}`} />
                    <div className="flex justify-between items-start mb-5 md:mb-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center font-black text-indigo-600 border border-gray-100">{p.name.charAt(0)}</div>
                        <div>
                          <h5 className="text-lg md:text-xl font-black text-gray-900 leading-none tracking-tighter uppercase truncate max-w-[120px]">{p.name}</h5>
                          <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase mt-1">Kel. {p.kelurahan}</p>
                        </div>
                      </div>
                      <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase ${p.risk.color}`}>
                        {p.risk.label}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                      <div className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                         <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">TD Terakhir</p>
                         <p className="text-xs md:text-sm font-black text-gray-900">{p.latestVisit?.bloodPressure || 'N/A'}</p>
                      </div>
                      <div className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                         <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Skor SPR</p>
                         <p className="text-xs md:text-sm font-black text-red-600">{p.totalRiskScore + 2}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <button onClick={() => setViewingPatientProfile(p.id)} className="flex-1 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">Lihat Profil</button>
                      <button onClick={() => setIsAddingVisit(p)} className="p-3 md:p-4 bg-gray-50 text-gray-400 rounded-xl md:rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0"><Activity size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
              {priorityList.length === 0 && (
                <div className="bg-white p-12 md:p-24 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 md:mb-6"><CheckCircle size={32} /></div>
                  <h5 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter">Situasi Terkendali</h5>
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Tidak ada pasien kritis saat ini.</p>
                </div>
              )}
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-between">
                <div className="relative z-10">
                  <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 md:mb-10 flex items-center gap-3"><Calendar size={24} className="text-indigo-400"/> Agenda Nakes</h4>
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2">Target ANC Hari Ini</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter">{state.ancVisits.filter(v => v.visitDate === today).length} <span className="text-xs md:text-sm font-bold opacity-40 uppercase ml-2">Selesai</span></p>
                    </div>
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2">Pasien Dalam Pantauan</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter">{patients.length} <span className="text-xs md:text-sm font-bold opacity-40 uppercase ml-2">Ibu</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10 space-y-3 md:space-y-4 pt-8 md:pt-10">
                    <button onClick={() => handleNavigate('register')} className="w-full py-5 md:py-6 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-900/50 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3">
                        <UserPlus size={16}/> Registrasi Pasien Baru
                    </button>
                    <button onClick={() => handleNavigate('patients')} className="w-full py-5 md:py-6 bg-white/10 text-white border border-white/10 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                        <List size={16}/> Buka Data Pasien
                    </button>
                </div>
                
                <Activity size={240} className="absolute -left-10 -bottom-10 opacity-5 pointer-events-none rotate-12" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- PATIENT DASHBOARD ---
    if (currentUser?.role === UserRole.USER) {
      const progress = calculatePregnancyProgress(currentUser.hpht);
      const patientVisits = state.ancVisits.filter(v => v.patientId === currentUser.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate));
      const latest = patientVisits[0];
      const risk = getRiskCategory(currentUser.totalRiskScore, latest);
      
      const weeks = progress?.weeks || 0;
      const babyInfo = getBabySizeByWeek(weeks);
      const percentage = progress?.percentage || 0;
      const userChecklist = state.userChecklists[currentUser.id] || {};
      const trimesterAdvice = getTrimesterAdvice(weeks);

      return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
          <div className="bg-indigo-600 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-16">
                <div className="text-center lg:text-left space-y-6 md:space-y-8 max-w-2xl">
                   <div>
                     <p className="text-[10px] md:text-[11px] font-black uppercase opacity-60 tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-3">Selamat Pagi,</p>
                     <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-3 md:mb-4">Ibu {currentUser.name.split(' ')[0]}</h3>
                     <p className="text-xs md:text-lg font-bold opacity-80 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2 md:gap-3">
                        <Calendar size={18} className="text-indigo-300"/> Usia Kandungan: {weeks} Minggu
                     </p>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform">
                         <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60 mb-1">HPL (HARI LAHIR)</p>
                         <p className="text-[10px] md:text-sm font-black truncate">{progress?.hpl || '-'}</p>
                      </div>
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform">
                         <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60 mb-1">Status Triase</p>
                         <p className="text-[10px] md:text-sm font-black">{risk.label}</p>
                      </div>
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform">
                         <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60 mb-1">Skor Kehamilan</p>
                         <p className="text-[10px] md:text-sm font-black">{currentUser.totalRiskScore + 2}</p>
                      </div>
                      <div className="px-4 md:px-6 py-3 md:py-4 bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform">
                         <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60 mb-1">Kunjungan</p>
                         <p className="text-[10px] md:text-sm font-black">{patientVisits.length} Kali</p>
                      </div>
                   </div>

                   <div className="bg-white/10 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 backdrop-blur-3xl flex items-start gap-3 md:gap-4 text-left shadow-xl group-hover:-translate-y-1 transition-transform">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shrink-0">
                         <ShieldCheck size={20} className="animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Panduan Cerdas Trimester</p>
                        <p className="text-[11px] md:text-sm font-bold leading-relaxed">{trimesterAdvice}</p>
                      </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border-[8px] md:border-[16px] border-white/20 flex items-center justify-center relative shadow-inner">
                      <div className="text-center animate-in zoom-in duration-1000">
                        <span className="text-5xl md:text-8xl mb-2 md:mb-4 block animate-bounce-slow transition-transform hover:scale-110 cursor-pointer">{babyInfo.icon}</span>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60">Janin Sebesar</p>
                        <p className="text-lg md:text-xl font-black uppercase tracking-tighter truncate max-w-[120px] mx-auto">{babyInfo.name}</p>
                      </div>
                      <svg className="absolute inset-0 w-full h-full -rotate-90 scale-105">
                        <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="16" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * percentage / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out hidden md:block" />
                        <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * percentage / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out md:hidden" />
                      </svg>
                      <div className="absolute -bottom-4 md:-bottom-6 bg-white text-indigo-900 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-sm md:text-lg shadow-xl shadow-indigo-900/40">
                         {percentage}% <span className="text-[9px] md:text-[10px] opacity-60">Selesai</span>
                      </div>
                   </div>
                </div>
             </div>
             <Baby size={300} className="absolute -left-10 -bottom-10 opacity-5 pointer-events-none rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-sm space-y-8 md:space-y-10 group hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3"><CheckSquare size={24} className="text-indigo-600"/> Agenda Harian</h4>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 font-black text-[10px] md:text-xs">
                    {Object.values(userChecklist).filter(Boolean).length}/{DAILY_TASKS.length}
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                   {DAILY_TASKS.map((item, i) => {
                     const isDone = userChecklist[item.task] || false;
                     return (
                       <button 
                         key={i} 
                         onClick={() => toggleDailyTask(currentUser.id, item.task)}
                         className={`w-full text-left flex items-center gap-4 md:gap-5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent hover:border-indigo-100'}`}
                       >
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shrink-0 ${isDone ? 'bg-emerald-500 text-white rotate-6' : 'bg-white text-gray-300 border border-gray-100 shadow-sm'}`}>
                             {isDone ? <CheckCircle size={20}/> : item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className={`text-[10px] md:text-xs font-black uppercase transition-all tracking-tight truncate ${isDone ? 'text-emerald-900 line-through opacity-40' : 'text-gray-900'}`}>{item.task}</p>
                             <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">{item.time}</p>
                          </div>
                       </button>
                     );
                   })}
                </div>
             </div>

             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
                <div>
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3 mb-8 md:mb-10"><Bell size={24} className="text-indigo-600"/> Resume Medis</h4>
                  <div className="space-y-4">
                    <div className="p-6 md:p-8 bg-indigo-50/50 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-100 flex flex-col items-center text-center">
                       <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4">Pemeriksaan Terakhir</p>
                       <p className="text-xl md:text-2xl font-black text-indigo-900 tracking-tighter leading-none mb-1">{latest?.visitDate || 'BELUM ADA'}</p>
                       <div className="h-1 w-10 bg-indigo-200 rounded-full my-4" />
                       <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
                          <div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase mb-1">Tekanan Darah</p>
                            <p className="text-xs md:text-sm font-black text-gray-900">{latest?.bloodPressure || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase mb-1">Berat Badan</p>
                            <p className="text-xs md:text-sm font-black text-gray-900">{latest?.weight ? `${latest.weight} kg` : '-'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleNavigate('smart-card')} className="w-full py-5 md:py-6 mt-8 md:mt-10 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                   <QrCode size={18}/> Kartu ANC Digital
                </button>
             </div>

             <div className="bg-red-600 p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl flex flex-col justify-between overflow-hidden relative group hover:shadow-red-300 transition-all duration-500 min-h-[300px]">
                <div className="relative z-10">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3 mb-6"><AlertTriangle size={24} className="text-white"/> Bantuan Darurat</h4>
                  <p className="text-[11px] md:text-xs font-bold opacity-80 leading-relaxed uppercase tracking-widest bg-white/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/20">Tekan tombol di bawah jika Anda mengalami perdarahan, pusing hebat, atau ketuban pecah.</p>
                </div>
                <button onClick={() => handleNavigate('contact')} className="w-full py-5 md:py-7 mt-8 md:mt-12 bg-white text-red-600 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-[0.2em] shadow-2xl relative z-10 hover:scale-[1.05] active:scale-95 transition-all">Hubungi Bidan</button>
                <ShieldAlert size={200} className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" />
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!currentUser) return <LoginScreen users={state.users} onLogin={(u) => setCurrentUser(u)} />;

  const currentRegisterRisk = getRiskCategory(tempRiskFactors.reduce((acc, id) => acc + (RISK_FACTORS_MASTER[id]?.score || 0), 0));

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
          title = {viewingPatientProfile ? "Analisis Rekam Medis" : view.toUpperCase()} 
          userName = {currentUser?.name || ''} 
          userRole = {currentUser?.role} 
          onToggleSidebar = {() => setIsSidebarOpen(!isSidebarOpen)} 
          onSearchChange = {setPatientSearch} 
          onLogout = {() => setCurrentUser(null)} 
          alerts = {state.alerts}
          onMarkAsRead = {(id) => setState(prev => ({ ...prev, alerts: prev.alerts.map(a => a.id === id ? { ...a, isRead: true } : a) }))}
          onNavigateToPatient = {handleNavigate}
          isSyncing = {isSyncing}
        />

        <div className="p-4 md:p-8 lg:p-12 xl:p-16 max-w-[1600px] mx-auto">
          {notification && (
            <div className="fixed top-6 md:top-10 left-1/2 -translate-x-1/2 z-[999] px-6 md:px-10 py-4 md:py-6 bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-10">
              <CheckCircle size={20} className="text-emerald-400" />
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">{notification.message}</p>
            </div>
          )}

          {view === 'dashboard' && <DashboardHome />}
          
          {(view === 'patients' && currentUser.role !== UserRole.USER) && (
            <PatientList 
              users={state.users} visits={state.ancVisits} 
              onEdit={(u) => { setEditingPatient(u); setTempRiskFactors(u.selectedRiskFactors); setView('register'); }} 
              onAddVisit={(u) => {
                setIsAddingVisit(u);
                setVisitPreviewData({ bloodPressure: '120/80', dangerSigns: [], fetalMovement: 'Normal', djj: 140 });
              }}
              onViewProfile={(id) => setViewingPatientProfile(id)}
              onDeletePatient={(id) => {
                if(window.confirm('Hapus data pasien secara permanen?')) {
                  addLog('DELETE_PATIENT', 'PATIENT', `Menghapus pasien ID: ${id}`);
                  setState(prev => ({...prev, users: prev.users.filter(u => u.id !== id)}))
                }
              }}
              onDeleteVisit={() => {}}
              onToggleVisitStatus={() => {}}
              currentUserRole={currentUser.role} searchFilter={patientSearch}
            />
          )}

          {(view === 'register' && currentUser.role !== UserRole.USER) && (
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 animate-in zoom-in-95">
              <div className="bg-white p-6 md:p-12 lg:p-20 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-10 mb-10 md:mb-16">
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="bg-indigo-600 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 shrink-0"><UserPlus size={28} /></div>
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight">{editingPatient ? 'Perbarui Profil Medis' : 'Registrasi Pasien Baru'}</h2>
                      <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2">Sistem Monitoring ANC Terpadu</p>
                    </div>
                  </div>
                  <div className={`w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 flex items-center justify-between md:justify-start gap-4 md:gap-5 transition-all duration-700 shadow-xl ${currentRegisterRisk.color}`}>
                    <div className="text-left">
                        <p className="text-[7px] md:text-[9px] font-black uppercase opacity-60 tracking-widest">Triase Live Prediction</p>
                        <p className="text-sm md:text-lg font-black uppercase tracking-tighter">{currentRegisterRisk.label} (Skor {tempRiskFactors.reduce((acc, id) => acc + (RISK_FACTORS_MASTER[id]?.score || 0), 2)})</p>
                    </div>
                    <Activity size={24} className="animate-pulse shrink-0" />
                  </div>
                </div>
                
                <form onSubmit={handleRegisterSubmit} className="space-y-10 md:space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-6">Nama Lengkap Ibu</label>
                      <input name="name" defaultValue={editingPatient?.name} className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-bold outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-100 transition-all text-sm md:text-base" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-6">Tanggal Lahir</label>
                      <input type="date" name="dob" defaultValue={editingPatient?.dob} className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-bold outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-100 transition-all text-sm md:text-base" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-6">Nomor WhatsApp</label>
                      <input type="tel" name="phone" defaultValue={editingPatient?.phone} className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-bold outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-100 transition-all text-sm md:text-base" required />
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-indigo-100 relative overflow-hidden">
                    <h4 className="text-[11px] md:text-sm font-black text-indigo-900 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-10 flex items-center gap-2 md:gap-3 relative z-10"><Baby size={18} /> Parameter Kehamilan Utama</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 md:ml-4">HPHT</label>
                        <input type="date" name="hpht" defaultValue={editingPatient?.hpht} className="w-full px-4 md:px-8 py-3.5 md:py-5 bg-white border border-indigo-100 rounded-xl md:rounded-[1.5rem] font-black outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-200 transition-all text-xs md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 md:ml-4">Gravida (G)</label>
                        <input type="number" name="gravida" placeholder="Hamil ke-" defaultValue={editingPatient?.pregnancyNumber} className="w-full px-4 md:px-8 py-3.5 md:py-5 bg-white border border-indigo-100 rounded-xl md:rounded-[1.5rem] font-black outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-200 transition-all text-xs md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 md:ml-4">Para (P)</label>
                        <input type="number" name="para" defaultValue={editingPatient?.parityP} className="w-full px-4 md:px-8 py-3.5 md:py-5 bg-white border border-indigo-100 rounded-xl md:rounded-[1.5rem] font-black outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-200 transition-all text-xs md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 md:ml-4">Abortus (A)</label>
                        <input type="number" name="abortus" defaultValue={editingPatient?.parityA} className="w-full px-4 md:px-8 py-3.5 md:py-5 bg-white border border-indigo-100 rounded-xl md:rounded-[1.5rem] font-black outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-200 transition-all text-xs md:text-base" required />
                      </div>
                    </div>
                    <Baby size={140} className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6 md:space-y-8">
                      <h4 className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 md:gap-3"><MapPin size={18} /> Data Domisili</h4>
                      <textarea name="address" rows={3} defaultValue={editingPatient?.address} className="w-full px-6 py-4 bg-gray-50 border-none rounded-[1.5rem] md:rounded-[2rem] font-bold outline-none focus:ring-4 md:focus:ring-8 focus:ring-indigo-100 transition-all text-sm md:text-base" placeholder="Alamat Lengkap..." required />
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                           <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Kecamatan</label>
                           <select name="kecamatan" className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs outline-none"><option value="Pasar Minggu">Pasar Minggu</option></select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Kelurahan</label>
                           <select name="kelurahan" defaultValue={editingPatient?.kelurahan} className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs outline-none">
                              {WILAYAH_DATA["Pasar Minggu"].map(kel => <option key={kel} value={kel}>{kel}</option>)}
                           </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><h4 className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 md:gap-3"><NavIcon size={18} /> Koordinat Geospasial</h4>
                        <button type="button" onClick={getCurrentLocation} className="w-full sm:w-auto px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                          {isGettingLocation ? <RefreshCw size={12} className="animate-spin" /> : <Crosshair size={12} />} Tag Lokasi
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Latitude</label>
                          <input name="lat" value={formCoords.lat} onChange={(e) => setFormCoords({...formCoords, lat: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs outline-none" placeholder="0.000000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Longitude</label>
                          <input name="lng" value={formCoords.lng} onChange={(e) => setFormCoords({...formCoords, lng: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs outline-none" placeholder="0.000000" />
                        </div>
                      </div>
                      <div className="p-4 md:p-6 bg-amber-50 rounded-2xl md:rounded-3xl border border-amber-100 flex items-start gap-3">
                         <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                         <p className="text-[8px] md:text-[9px] font-black text-amber-700 uppercase leading-relaxed tracking-widest">Penting untuk pemetaan wilayah resiko tinggi dan respon darurat.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    <label className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 md:gap-3 ml-2 md:ml-4"><ShieldAlert size={18} /> Penapisan Faktor Resiko (Skor Poedji Rochjati)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {Object.entries(RISK_FACTORS_MASTER).map(([id, info]) => (
                        <label key={id} className={`flex items-start gap-3 md:gap-5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 transition-all cursor-pointer group hover:scale-[1.01] ${tempRiskFactors.includes(id) ? 'bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-gray-50 border-transparent'}`}>
                          <input type="checkbox" className="mt-0.5 md:mt-1 accent-indigo-600 w-4 md:w-5 h-4 md:h-5 shrink-0" checked={tempRiskFactors.includes(id)} onChange={(e) => {
                            if (e.target.checked) setTempRiskFactors([...tempRiskFactors, id]);
                            else setTempRiskFactors(tempRiskFactors.filter(f => f !== id));
                          }} />
                          <div className="min-w-0"><p className="text-[10px] md:text-xs font-black text-gray-900 leading-tight uppercase group-hover:text-indigo-600 transition-colors line-clamp-2">{info.label}</p><p className="text-[8px] md:text-[10px] font-black text-indigo-400 mt-1 md:mt-2 tracking-widest">+{info.score} Poin Risiko</p></div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 md:pt-16 border-t border-gray-100 flex flex-col md:flex-row gap-4 md:gap-8">
                    <button type="submit" className="w-full md:flex-1 py-5 md:py-7 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-xs md:text-sm tracking-[0.1em] md:tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">Simpan Rekam Medis</button>
                    <button type="button" onClick={() => handleNavigate('patients')} className="w-full md:px-16 py-5 md:py-7 bg-gray-100 text-gray-500 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-xs md:text-sm tracking-widest hover:bg-gray-200 transition-all">Batalkan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isAddingVisit && (
            <div className="fixed inset-0 z-[100] bg-indigo-950/80 backdrop-blur-2xl flex items-start justify-center p-2 md:p-10 overflow-y-auto overscroll-contain">
              <div className="bg-white w-full max-w-5xl rounded-[1.5rem] md:rounded-[4.5rem] shadow-2xl my-4 md:my-auto animate-in zoom-in-95 duration-700 relative flex flex-col">
                <div className="bg-indigo-600 p-6 md:p-16 text-white flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 relative overflow-hidden rounded-t-[1.5rem] md:rounded-t-[4.5rem]">
                  <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter leading-none">Pemeriksaan ANC</h2>
                    <p className="text-indigo-200 font-bold text-[8px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2">Ibu {isAddingVisit.name} • {isAddingVisit.id}</p>
                  </div>
                  
                  <div className={`relative z-10 px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-[2rem] flex items-center gap-3 md:gap-4 border-2 md:border-4 animate-in fade-in duration-700 shadow-2xl ${liveTriase?.color}`}>
                     <div className="text-left">
                        <p className="text-[6px] md:text-[10px] font-black uppercase opacity-60 tracking-widest">Live Clinical Triase</p>
                        <p className="text-[10px] md:text-lg font-black uppercase tracking-tighter">{liveTriase?.label}</p>
                     </div>
                     <ShieldAlert size={16} className={`${liveTriase?.label === 'HITAM' ? 'animate-pulse' : ''} md:w-8 md:h-8`} />
                  </div>

                  <button onClick={() => setIsAddingVisit(null)} className="relative z-10 p-3 md:p-5 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl transition-all"><X size={18}/></button>
                  <Activity size={180} className="absolute -left-10 -bottom-10 opacity-5" />
                </div>
                
                <form onSubmit={handleVisitSubmit} className="p-6 md:p-20 space-y-8 md:y-16 overflow-y-visible">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
                      <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">BB (kg)</label>
                        <input name="weight" type="number" step="0.1" className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-sm md:text-lg outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" required />
                      </div>
                      <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">TD (mmHg)</label>
                        <input 
                          name="bp" 
                          placeholder="120/80" 
                          className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-sm md:text-lg outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" 
                          required 
                          onChange={(e) => setVisitPreviewData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">TFU (cm)</label>
                        <input name="tfu" type="number" step="0.1" className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-sm md:text-lg outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" required />
                      </div>
                      <div className="space-y-1.5 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">DJJ (x/m)</label>
                        <input 
                          name="djj" 
                          type="number" 
                          className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-sm md:text-lg outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" 
                          required 
                          onChange={(e) => setVisitPreviewData(prev => ({ ...prev, djj: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1.5 md:space-y-3 col-span-2 md:col-span-1">
                        <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">Hb (g/dL)</label>
                        <input name="hb" type="number" step="0.1" className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-sm md:text-lg outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" required />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="space-y-4 md:space-y-8">
                        <h4 className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2"><AlertCircle size={16}/> Observasi Tanda Bahaya</h4>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          {['Perdarahan', 'Ketuban Pecah', 'Kejang', 'Pusing Hebat', 'Nyeri Perut Hebat', 'Demam'].map(s => (
                            <label key={s} className="flex items-center gap-3 p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-red-50 transition-all cursor-pointer border-2 border-transparent hover:border-red-200 group">
                              <input 
                                type="checkbox" 
                                name="dangerSigns" 
                                value={s} 
                                className="accent-red-600 w-4 md:w-5 h-4 md:h-5 shrink-0" 
                                onChange={(e) => {
                                  const current = visitPreviewData.dangerSigns || [];
                                  const updated = e.target.checked ? [...current, s] : current.filter(x => x !== s);
                                  setVisitPreviewData(prev => ({ ...prev, dangerSigns: updated }));
                                }}
                              />
                              <span className="text-[8px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-red-600 truncate">{s}</span>
                            </label>
                          ))}
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-8">
                       <h4 className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2"><Baby size={16}/> Status Janin & Keluhan</h4>
                       <div className="space-y-2 md:space-y-4">
                          <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">Persepsi Gerak Janin</label>
                          <select 
                            name="fetalMovement" 
                            className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50"
                            onChange={(e) => setVisitPreviewData(prev => ({ ...prev, fetalMovement: e.target.value }))}
                            required
                          >
                            <option value="Normal">NORMAL / AKTIF</option>
                            <option value="Kurang Aktif">KURANG AKTIF</option>
                            <option value="Tidak Ada">TIDAK ADA GERAKAN (EMERGENCY)</option>
                          </select>
                       </div>
                       <div className="space-y-2 md:space-y-4">
                          <label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 md:ml-4">Keluhan Ibu</label>
                          <textarea name="complaints" placeholder="Deskripsikan keluhan jika ada..." className="w-full p-4 md:p-6 bg-gray-50 border-none rounded-[1.5rem] md:rounded-[2rem] font-bold text-[10px] md:text-sm outline-none focus:ring-4 md:ring-8 focus:ring-indigo-50" rows={3}></textarea>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 bg-indigo-50/50 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-indigo-100">
                      <div className="space-y-4 md:space-y-6">
                        <h4 className="text-[9px] md:text-xs font-black text-indigo-900 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3"><ClipboardCheck size={16}/> Keputusan Medis (Plan)</h4>
                        <select name="followUp" className="w-full p-4 md:p-6 bg-white border border-indigo-200 rounded-xl md:rounded-2xl font-black text-[8px] md:text-xs outline-none focus:ring-4 md:ring-8 focus:ring-indigo-100" required>
                          <option value="ANC_RUTIN">KONTROL RUTIN PUSKESMAS</option>
                          <option value="KONSUL_DOKTER">KONSULTASI DOKTER OBGYN</option>
                          <option value="RUJUK_RS">RUJUK KE RUMAH SAKIT (KONDISI KRITIS)</option>
                        </select>
                        <textarea name="notes" placeholder="Catatan Bidan / Nakes..." className="w-full p-4 md:p-6 bg-white border border-indigo-200 rounded-[1.5rem] md:rounded-[2rem] font-bold text-[8px] md:text-xs outline-none focus:ring-4 md:ring-8 focus:ring-indigo-100" rows={3}></textarea>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        <h4 className="text-[9px] md:text-xs font-black text-indigo-900 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3"><Calendar size={16}/> Penjadwalan Ulang</h4>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 md:ml-4">Kunjungan Berikutnya</label>
                          <input type="date" name="nextVisit" className="w-full p-4 md:p-6 bg-white border border-indigo-200 rounded-xl md:rounded-2xl font-black outline-none focus:ring-4 md:ring-8 focus:ring-indigo-100 text-[10px] md:text-base" required />
                        </div>
                        <div className="p-5 md:p-8 bg-indigo-600 rounded-[1.5rem] md:rounded-[2.5rem] text-white flex items-start gap-3 md:gap-4 shadow-xl">
                          <Info size={16} className="shrink-0" />
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed">Sistem akan otomatis mengirimkan sinyal peringatan jika kondisi pasien kritis (Hitam).</p>
                        </div>
                      </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 pb-4">
                      <button type="submit" className="w-full md:flex-1 py-5 md:py-7 bg-indigo-600 text-white rounded-xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">Selesaikan Pemeriksaan</button>
                      <button type="button" onClick={() => setIsAddingVisit(null)} className="w-full md:py-7 px-8 md:px-16 bg-gray-100 text-gray-500 rounded-xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-sm tracking-widest hover:bg-gray-200 transition-all">Batalkan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {view === 'management' && <AccessManagement state={state} setState={setState} currentUser={currentUser!} addLog={addLog} onExport={handleExportSystemData} onImport={handleImportSystemData} />}
          {view === 'monitoring' && <RiskMonitoring state={state} onViewProfile={(id)=>setViewingPatientProfile(id)} onAddVisit={(u)=>setIsAddingVisit(u)} onToggleVisitStatus={()=>{}} />}
          {view === 'map' && <MapView users={state.users} visits={state.ancVisits} />}
          {view === 'smart-card' && <SmartCardModule state={state} setState={setState} isUser={currentUser?.role === UserRole.USER} user={currentUser!} />}
          {view === 'education' && <EducationModule />}
          {view === 'contact' && <ContactModule />}

          {viewingPatientProfile && (
            <div className="fixed inset-0 z-[110] bg-indigo-950/90 backdrop-blur-3xl flex items-start justify-center p-2 md:p-12 overflow-y-auto pt-6 md:pt-10 pb-10">
              <div className="bg-gray-50 w-full max-w-7xl rounded-[1.5rem] md:rounded-[4.5rem] shadow-2xl relative border-2 md:border-4 border-indigo-500/20 my-auto">
                <PatientProfileView 
                  patient={state.users.find(u => u.id === viewingPatientProfile)!} 
                  visits={state.ancVisits} 
                  onClose={() => setViewingPatientProfile(null)} 
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
