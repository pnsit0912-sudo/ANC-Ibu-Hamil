
import React, { useState, useEffect } from 'react';
import { UserRole, User, AppState, ANCVisit, SystemLog } from './types';
import { MOCK_USERS, PUSKESMAS_INFO, WILAYAH_DATA } from './constants';
import { 
  HeartPulse, Stethoscope, CheckCircle, AlertCircle, Users, Menu, MapPin, Navigation, CloudLightning, ShieldAlert, Calendar, Info, AlertTriangle, Bell,
  UserPlus, Edit3, X, Clock, Baby, ClipboardList, Map as MapIcon
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MapView } from './MapView';
import { PatientList } from './PatientList';
import { LoginScreen } from './LoginScreen';
import { AccessManagement } from './AccessManagement';
import { RiskMonitoring } from './RiskMonitoring';
import { getMedicalRecommendation, calculatePregnancyProgress, formatDate } from './utils';
import { SmartCardModule, EducationModule, ContactModule, AccessDenied } from './FeatureModules';
import { AuditTrail } from './AuditTrail';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoOpenHistoryId, setAutoOpenHistoryId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // State for Dynamic Form Region
  const [selectedKec, setSelectedKec] = useState<string>("Pasar Minggu");

  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: MOCK_USERS,
    ancVisits: [
      { id: 'v1', patientId: 'u1', visitDate: '2023-11-20', scheduledDate: '2023-11-20', nextVisitDate: '2023-12-20', bloodPressure: '120/80', complaints: 'Pusing ringan di pagi hari', edema: false, fetalMovement: 'Aktif', followUp: 'Tingkatkan istirahat dan nutrisi zat besi', nakesId: 'nakes1', status: 'COMPLETED' },
    ],
    selectedPatientId: null,
    logs: [
      { id: 'l1', timestamp: new Date().toISOString(), userId: 'system', userName: 'System', action: 'INITIALIZE', module: 'CORE', details: 'Sistem Smart ANC Berhasil Dimuat' }
    ]
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addLog = (action: string, module: string, details: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest',
      action,
      module,
      details
    };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 100) }));
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleLogout = () => { 
    if (confirm('Keluar dari sistem?')) {
      addLog('LOGOUT', 'AUTH', 'User keluar dari sesi');
      setCurrentUser(null);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const hpht = formData.get('hpht') as string;

    const progress = calculatePregnancyProgress(hpht);

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
      lat: isNaN(lat) ? PUSKESMAS_INFO.lat : lat,
      lng: isNaN(lng) ? PUSKESMAS_INFO.lng : lng,
    };

    if (editingPatient) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === editingPatient.id ? { ...u, ...data } : u)
      }));
      addLog('UPDATE_PATIENT', 'DATA', `Memperbarui data pasien: ${data.name}`);
      showNotification('Data pasien berhasil diperbarui');
      setEditingPatient(null);
    } else {
      const newUser: User = {
        ...data,
        id: `u${Date.now()}`,
        role: UserRole.USER,
        isActive: true,
      };
      setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
      addLog('REGISTER_PATIENT', 'DATA', `Mendaftarkan pasien baru: ${data.name}`);
      showNotification('Pasien baru berhasil didaftarkan');
    }
    setView('patients');
  };

  const handleAddVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAddingVisit) return;
    
    const formData = new FormData(e.currentTarget);
    const nextDate = formData.get('next_visit') as string;
    
    const newVisit: ANCVisit = {
      id: `v${Date.now()}`,
      patientId: isAddingVisit.id,
      visitDate: new Date().toISOString().split('T')[0],
      scheduledDate: new Date().toISOString().split('T')[0],
      nextVisitDate: nextDate,
      bloodPressure: formData.get('bp') as string,
      complaints: formData.get('complaints') as string,
      edema: formData.get('edema') === 'on',
      fetalMovement: formData.get('fetal') as string,
      followUp: formData.get('followup') as string,
      nakesId: currentUser?.id || 'system',
      status: 'COMPLETED'
    };

    setState(prev => ({
      ...prev,
      ancVisits: [...prev.ancVisits, newVisit]
    }));
    
    addLog('ADD_VISIT', 'MEDICAL', `Input kunjungan pasien: ${isAddingVisit.name}`);
    showNotification('Data kunjungan ANC berhasil disimpan');
    
    setIsAddingVisit(null);
    if (view !== 'patients') setView('monitoring');
  };

  const handleToggleVisitStatus = (visitId: string) => {
    const visit = state.ancVisits.find(v => v.id === visitId);
    if (!visit) return;

    const newStatus = visit.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
    
    setState(prev => ({
      ...prev,
      ancVisits: prev.ancVisits.map(v => 
        v.id === visitId ? { ...v, status: newStatus as any } : v
      )
    }));
    
    addLog('TOGGLE_VISIT_STATUS', 'MEDICAL', `Update status kunjungan ID ${visitId} menjadi ${newStatus}`);
    showNotification(`Status kunjungan diperbarui ke ${newStatus === 'COMPLETED' ? 'Selesai' : 'Dijadwalkan'}`);
  };

  const renderDashboard = () => {
    if (currentUser?.role === UserRole.USER) {
      const progress = calculatePregnancyProgress(currentUser.hpht);
      const rec = getMedicalRecommendation(progress?.weeks || 0);
      const myVisits = state.ancVisits.filter(v => v.patientId === currentUser.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate));
      const nextControl = myVisits[0]?.nextVisitDate;

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-indigo-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-2 relative z-10">Halo, Ibu {currentUser.name}!</h2>
            <p className="opacity-60 font-bold uppercase text-xs tracking-widest relative z-10">Perjalanan Kehamilan Anda - Terupdate Otomatis</p>
            
            <div className="mt-12 flex flex-col md:flex-row gap-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex-1">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Usia Kehamilan</p>
                <p className="text-4xl font-black">{progress?.weeks} Mgg {progress?.days} Hari</p>
                <p className="text-[10px] font-bold mt-2 text-indigo-200">Setara ~{progress?.months} Bulan</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex-1">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Estimasi Lahir (HPL)</p>
                <p className="text-4xl font-black">{formatDate(progress?.hpl || '')}</p>
                <p className="text-[10px] font-bold mt-2 text-indigo-200">Berdasarkan Rumus Naegele</p>
              </div>
              {nextControl && (
                <div className="bg-emerald-500/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-emerald-500/30 flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-emerald-100">Jadwal Kontrol</p>
                    <p className="text-4xl font-black text-emerald-300">{nextControl}</p>
                  </div>
                  <Calendar size={48} className="text-emerald-400 opacity-50" />
                </div>
              )}
            </div>

            <div className="mt-12 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
                <span>Konsepsi</span>
                <span>Progres: {progress?.percentage}%</span>
                <span>Kelahiran</span>
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-indigo-400 transition-all duration-1000 ease-out flex items-center justify-end pr-1"
                  style={{ width: `${progress?.percentage}%` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white shadow-xl animate-pulse" />
                </div>
              </div>
            </div>

            <HeartPulse className="absolute -right-20 -bottom-20 text-white/5" size={400} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3"><Stethoscope className="text-indigo-600" size={28} /> {rec.trimester}</h3>
               <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">{rec.description}</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tindakan Disarankan</p>
                    {rec.actions.map((act, i) => (
                      <div key={i} className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                        <span className="text-xs font-bold text-emerald-900 leading-tight">{act}</span>
                      </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Waspada Tanda Bahaya</p>
                    {rec.dangerSigns.map((sign, i) => (
                      <div key={i} className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                        <AlertCircle className="text-red-500 shrink-0" size={18} />
                        <span className="text-xs font-bold text-red-900 leading-tight">{sign}</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden relative">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><Clock className="text-indigo-600" size={28} /> Riwayat Pemeriksaan Terakhir</h3>
              <div className="space-y-6">
                {myVisits.length > 0 ? myVisits.map(v => (
                  <div key={v.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Kunjungan: {formatDate(v.visitDate)}</p>
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-full uppercase">ID: {v.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tekanan Darah</p><p className="text-base font-black text-gray-900">{v.bloodPressure}</p></div>
                      <div><p className="text-[9px] font-black text-gray-400 uppercase mb-1">Gerakan Janin</p><p className="text-base font-black text-gray-900">{v.fetalMovement}</p></div>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-2xl border border-dashed border-gray-200">
                      <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Instruksi Bidan</p>
                      <p className="text-xs font-bold italic text-gray-600">"{v.followUp}"</p>
                    </div>
                  </div>
                )) : <div className="p-12 text-center text-gray-300 font-bold italic uppercase tracking-widest">Belum ada riwayat kunjungan</div>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { label: "Total Pasien Aktif", val: state.users.filter(u => u.role === 'USER').length, icon: <Users />, color: "bg-indigo-600 shadow-indigo-100" },
            { label: "Kunjungan Bulan Ini", val: state.ancVisits.length, icon: <CheckCircle />, color: "bg-emerald-500 shadow-emerald-100" },
            { label: "Resiko Tinggi", val: state.ancVisits.filter(v => parseInt(v.bloodPressure.split('/')[0]) >= 140 || v.edema).length, icon: <AlertTriangle />, color: "bg-red-500 shadow-red-100" },
            { label: "Nakes Terdaftar", val: state.users.filter(u => u.role === 'NAKES').length, icon: <Stethoscope />, color: "bg-blue-500 shadow-blue-100" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:-translate-y-2 transition-all duration-500">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.val}</p>
              </div>
              <div className={`${stat.color} p-5 rounded-[1.5rem] text-white shadow-xl transform group-hover:rotate-12 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="bg-indigo-900 p-16 rounded-[4.5rem] text-white relative overflow-hidden shadow-2xl">
               <h2 className="text-5xl font-black tracking-tighter mb-4 relative z-10 leading-none">Pusat Kendali ANC</h2>
               <p className="text-indigo-200 font-bold max-w-lg relative z-10 leading-relaxed">Monitoring kesehatan ibu hamil di wilayah kerja {PUSKESMAS_INFO.name} secara real-time dan terintegrasi.</p>
               <button onClick={() => setView('register')} className="mt-10 px-10 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-3 relative z-10">
                 <UserPlus size={18} /> Daftarkan Pasien Baru
               </button>
               <div className="absolute -right-20 -bottom-20 opacity-10">
                 <CloudLightning size={400} />
               </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3"><Bell className="text-indigo-600" size={28} /> Notifikasi Sistem</h3>
                 <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded-full uppercase">Log Terakhir</span>
               </div>
               <div className="space-y-5">
                 {state.logs.slice(0, 5).map(log => (
                   <div key={log.id} className="flex gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                       {log.action.includes('REGISTER') ? <UserPlus size={20} /> : <Info size={20} />}
                     </div>
                     <div>
                       <p className="text-xs font-black text-gray-900 mb-1">{log.details}</p>
                       <div className="flex items-center gap-3">
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{log.action}</p>
                         <span className="w-1 h-1 rounded-full bg-gray-200" />
                         <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-10">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-8 text-center">Tindakan Cepat</h3>
               <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: "Peta Lokasi", icon: <MapPin />, color: "bg-blue-50 text-blue-600", path: "map" },
                   { label: "Dashboard", icon: <Navigation />, color: "bg-indigo-50 text-indigo-600", path: "monitoring" },
                   { label: "Audit Log", icon: <ClipboardList />, color: "bg-purple-50 text-purple-600", path: "audit" },
                   { label: "Manajemen", icon: <ShieldAlert />, color: "bg-red-50 text-red-600", path: "management" }
                 ].map((btn, i) => (
                   <button 
                    key={i} 
                    onClick={() => setView(btn.path)}
                    className={`${btn.color} p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-current`}
                   >
                     {btn.icon}
                     {btn.label}
                   </button>
                 ))}
               </div>
             </div>

             <div className="bg-emerald-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group">
               <h3 className="text-2xl font-black tracking-tighter mb-3 relative z-10">Status Integrasi</h3>
               <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-widest mb-6 relative z-10">Cloud Database Terhubung</p>
               <div className="flex items-center gap-4 bg-white/10 p-5 rounded-[1.5rem] relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-lg"><CloudLightning size={20} /></div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync Terakhir</p>
                   <p className="text-xs font-black">Just now</p>
                 </div>
               </div>
               <CloudLightning size={160} className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700" />
             </div>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) return <LoginScreen onLogin={(u) => { setCurrentUser(u); addLog('LOGIN', 'AUTH', `User ${u.name} berhasil masuk`); }} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        currentView={view} 
        onNavigate={setView} 
        onLogout={handleLogout} 
        userRole={currentUser.role} 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <main className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <Header 
          title={view === 'dashboard' ? 'Dashboard Utama' : view.split('-').map(s => s.toUpperCase()).join(' ')} 
          userName={currentUser.name} 
          userRole={currentUser.role}
          onToggleSidebar={toggleSidebar}
          onSearchChange={setPatientSearch}
          onLogout={handleLogout}
          isSyncing={isSyncing}
        />

        <div className="p-16 max-w-[1600px] mx-auto min-h-[calc(100vh-8rem)]">
          {notification && (
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-10 py-5 rounded-[2rem] shadow-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 font-black text-xs uppercase tracking-widest ${notification.type === 'success' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-red-600 border-red-100'}`}>
              {notification.type === 'success' ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
              {notification.message}
            </div>
          )}

          {view === 'dashboard' && renderDashboard()}
          
          {view === 'patients' && (
            <PatientList 
              users={state.users} 
              visits={state.ancVisits} 
              onEdit={(u) => { setEditingPatient(u); setView('register'); }} 
              onAddVisit={(u) => setIsAddingVisit(u)}
              onDeleteVisit={(id) => { if(confirm('Hapus data kunjungan ini?')) { setState(prev => ({...prev, ancVisits: prev.ancVisits.filter(v => v.id !== id)})); addLog('DELETE_VISIT', 'MEDICAL', `Menghapus kunjungan ID ${id}`); showNotification('Kunjungan berhasil dihapus'); } }}
              onToggleVisitStatus={handleToggleVisitStatus}
              currentUserRole={currentUser.role}
              searchFilter={patientSearch}
              initialSelectedHistoryId={autoOpenHistoryId}
              clearAutoOpen={() => setAutoOpenHistoryId(null)}
            />
          )}

          {view === 'management' && (
            <AccessManagement 
              state={state} 
              setState={setState} 
              currentUser={currentUser} 
              addLog={addLog}
            />
          )}

          {view === 'audit' && (
            <AuditTrail logs={state.logs} />
          )}
          
          {view === 'monitoring' && (
            <RiskMonitoring 
              state={state} 
              onNavigateToPatient={(id) => { setAutoOpenHistoryId(id); setView('patients'); }}
              onAddVisit={(u) => setIsAddingVisit(u)}
              onToggleVisitStatus={handleToggleVisitStatus}
            />
          )}
          
          {view === 'register' && (
            <div className="max-w-4xl mx-auto bg-white p-16 rounded-[4rem] shadow-sm border border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-4 mb-12 border-b border-gray-50 pb-8">
                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl"><UserPlus size={28} /></div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{editingPatient ? 'Perbarui Data Pasien' : 'Pendaftaran ANC Baru'}</h2>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Formulir Integrasi Rekam Medis Digital</p>
                </div>
              </div>
              
              <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Nama Lengkap Sesuai KTP</label>
                  <input name="name" defaultValue={editingPatient?.name} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Tanggal Lahir</label>
                  <input type="date" name="dob" defaultValue={editingPatient?.dob} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Nomor HP / WhatsApp Aktif</label>
                  <input name="phone" defaultValue={editingPatient?.phone} placeholder="08..." className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">HPHT (Hari Pertama Haid Terakhir)</label>
                  <input type="date" name="hpht" defaultValue={editingPatient?.hpht} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>

                {/* Region Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Kecamatan</label>
                  <select 
                    name="kecamatan" 
                    className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                    value={selectedKec}
                    onChange={(e) => setSelectedKec(e.target.value)}
                    required
                  >
                    {Object.keys(WILAYAH_DATA).map(kec => <option key={kec} value={kec}>{kec}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Kelurahan</label>
                  <select 
                    name="kelurahan" 
                    defaultValue={editingPatient?.kelurahan}
                    className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                    required
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {WILAYAH_DATA[selectedKec as keyof typeof WILAYAH_DATA].map(kel => <option key={kel} value={kel}>{kel}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Kehamilan Ke (Gravida)</label>
                  <input type="number" name="number" defaultValue={editingPatient?.pregnancyNumber} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Riwayat Medis / Alergi</label>
                  <input name="history" defaultValue={editingPatient?.medicalHistory} placeholder="Contoh: Asma, Alergi Paracetamol, dll" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Alamat Jalan / RT / RW</label>
                  <textarea name="address" defaultValue={editingPatient?.address} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-32 resize-none" required></textarea>
                </div>
                
                <div className="md:col-span-2 bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={14}/> Koordinat Lokasi (Input Manual/Otomatis)</p>
                  <div className="grid grid-cols-2 gap-6">
                    <input name="lat" defaultValue={editingPatient?.lat} placeholder="Latitude" className="w-full px-8 py-5 bg-white border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-200 transition-all" />
                    <input name="lng" defaultValue={editingPatient?.lng} placeholder="Longitude" className="w-full px-8 py-5 bg-white border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-200 transition-all" />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">
                    {editingPatient ? 'Simpan Perubahan' : 'Finalisasi Pendaftaran'}
                  </button>
                  <button type="button" onClick={() => { setEditingPatient(null); setView('patients'); }} className="px-10 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {view === 'map' && <MapView users={state.users} />}
          {view === 'education' && <EducationModule />}
          {view === 'smart-card' && <SmartCardModule state={state} setState={setState} isUser={currentUser.role === UserRole.USER} user={currentUser} />}
          {view === 'contact' && <ContactModule />}
        </div>
      </main>

      {/* Floating Modal for Visit Input */}
      {isAddingVisit && (
        <div 
          className="fixed inset-0 z-[100] bg-indigo-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsAddingVisit(null)} // Click on backdrop to close
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="bg-indigo-600 p-12 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Input Kunjungan ANC</h3>
                <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mt-1">Pasien: {isAddingVisit.name}</p>
              </div>
              <button 
                onClick={() => setIsAddingVisit(null)} 
                className="relative z-20 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all cursor-pointer shadow-lg"
                title="Tutup Modal"
              >
                <X size={24} />
              </button>
              {/* Added pointer-events-none to prevent decoration from blocking clicks */}
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Stethoscope size={200} />
              </div>
            </div>
            
            <form onSubmit={handleAddVisitSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tekanan Darah (S/D)</label>
                  <input name="bp" placeholder="120/80" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Gerakan Janin</label>
                  <select name="fetal" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all">
                    <option>Sangat Aktif</option>
                    <option>Aktif</option>
                    <option>Kurang Aktif</option>
                    <option>Tidak Ada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Jadwal Kontrol Selanjutnya</label>
                  <input type="date" name="next_visit" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all" required />
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl mt-6">
                  <input type="checkbox" name="edema" id="edema" className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                  <label htmlFor="edema" className="text-xs font-black text-gray-700 uppercase tracking-wider cursor-pointer">Ada Bengkak (Edema)</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Keluhan Pasien</label>
                <textarea name="complaints" placeholder="Tuliskan keluhan atau kondisi pasien..." className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-24 resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Instruksi & Tindak Lanjut</label>
                <textarea name="followup" placeholder="Contoh: Istirahat cukup, kurangi garam, rutin minum TTD" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-24 resize-none" required></textarea>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <CheckCircle size={20} /> Simpan Data Kunjungan
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingVisit(null)}
                  className="px-8 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
