
import React, { useState, useEffect } from 'react';
import { UserRole, User, AppState, ANCVisit, SystemLog } from './types';
import { MOCK_USERS, PUSKESMAS_INFO } from './constants';
import { 
  HeartPulse, Stethoscope, CheckCircle, AlertCircle, Users, Menu, MapPin, Navigation, CloudLightning, ShieldAlert, Calendar
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MapView } from './MapView';
import { PatientList } from './PatientList';
import { LoginScreen } from './LoginScreen';
import { AccessManagement } from './AccessManagement';
import { RiskMonitoring } from './RiskMonitoring';
import { getMedicalRecommendation } from './utils';
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

    const data = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      phone: formData.get('phone') as string,
      pregnancyMonth: parseInt(formData.get('month') as string),
      pregnancyNumber: parseInt(formData.get('number') as string),
      medicalHistory: formData.get('history') as string,
      address: formData.get('address') as string,
      lat: isNaN(lat) ? PUSKESMAS_INFO.lat : lat,
      lng: isNaN(lng) ? PUSKESMAS_INFO.lng : lng,
    };

    if (editingPatient) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === editingPatient.id ? { ...u, ...data } : u)
      }));
      addLog('UPDATE_PATIENT', 'DATA', `Memperbarui data pasien: ${data.name}`);
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
    }
    setView('patients');
  };

  const handleAddVisitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAddingVisit) return;
    
    const formData = new FormData(e.currentTarget);
    const sendWA = formData.get('wa_notif') === 'on';
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
    
    addLog('ADD_VISIT', 'MEDICAL', `Input kunjungan pasien: ${isAddingVisit.name}. Jadwal berikutnya: ${nextDate} ${sendWA ? '(WhatsApp Reminder Terjadwal)' : ''}`);
    
    setIsAddingVisit(null);
    setView('monitoring');
  };

  const handleDeleteVisit = (visitId: string) => {
    const visitToDelete = state.ancVisits.find(v => v.id === visitId);
    if (!visitToDelete) return;
    
    const patient = state.users.find(u => u.id === visitToDelete.patientId);

    if (confirm(`Hapus data kunjungan tanggal ${visitToDelete.visitDate} untuk pasien ${patient?.name || 'Unknown'}? Tindakan ini tidak dapat dibatalkan.`)) {
      setState(prev => ({
        ...prev,
        ancVisits: prev.ancVisits.filter(v => v.id !== visitId)
      }));
      addLog('DELETE_VISIT', 'MEDICAL', `Menghapus riwayat kunjungan ${visitToDelete.visitDate} milik ${patient?.name}`);
    }
  };

  const handleToggleVisitStatus = (visitId: string) => {
    setState(prev => ({
      ...prev,
      ancVisits: prev.ancVisits.map(v => 
        v.id === visitId 
          ? { ...v, status: v.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED' }
          : v
      )
    }));
    
    const visit = state.ancVisits.find(v => v.id === visitId);
    const patient = state.users.find(u => u.id === visit?.patientId);
    const newStatus = visit?.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    addLog('TOGGLE_VISIT_STATUS', 'MEDICAL', `Mengubah status kunjungan ${visit?.visitDate} milik ${patient?.name} menjadi ${newStatus}`);
  };

  const renderContent = () => {
    if (currentUser && !currentUser.isActive) return <AccessDenied />;

    if (isAddingVisit) {
      return <VisitForm patient={isAddingVisit} onSubmit={handleAddVisitSubmit} onCancel={() => setIsAddingVisit(null)} />;
    }

    switch(view) {
      case 'dashboard': return renderDashboard();
      case 'patients': return (
        <PatientList 
          users={state.users} 
          visits={state.ancVisits} 
          onEdit={(u) => { setEditingPatient(u); setView('register'); }} 
          onAddVisit={(u) => setIsAddingVisit(u)} 
          onDeleteVisit={handleDeleteVisit}
          onToggleVisitStatus={handleToggleVisitStatus}
          currentUserRole={currentUser?.role || UserRole.USER}
          searchFilter={patientSearch} 
        />
      );
      case 'map': return <MapView users={state.users} />;
      case 'register': return <RegistrationForm initialData={editingPatient} onSubmit={handleRegisterSubmit} onCancel={() => setView('patients')} />;
      case 'monitoring': return <RiskMonitoring state={state} />;
      case 'education': return <EducationModule />;
      case 'smart-card': return <SmartCardModule state={state} setState={setState} isUser={currentUser?.role === UserRole.USER} user={currentUser!} />;
      case 'contact': return <ContactModule />;
      case 'management': return (
        <div className="space-y-10">
          <AccessManagement state={state} setState={setState} currentUser={currentUser!} />
          {currentUser?.role === UserRole.ADMIN && <AuditTrail logs={state.logs} />}
        </div>
      );
      default: return <div className="p-40 text-center font-black text-gray-200 uppercase text-4xl">Modul Segera Hadir</div>;
    }
  };

  const renderDashboard = () => {
    if (currentUser?.role === UserRole.USER) {
      const rec = getMedicalRecommendation(currentUser.pregnancyMonth);
      const myVisits = state.ancVisits.filter(v => v.patientId === currentUser.id).sort((a,b) => b.visitDate.localeCompare(a.visitDate));
      const nextControl = myVisits[0]?.nextVisitDate;

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-indigo-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-2 relative z-10">Halo, Ibu {currentUser.name}!</h2>
            <div className="mt-12 flex flex-col md:flex-row gap-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex-1">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Usia Kehamilan</p>
                <p className="text-4xl font-black">{currentUser.pregnancyMonth} Bulan</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex-1">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Anak Ke-</p>
                <p className="text-4xl font-black">G{currentUser.pregnancyNumber}</p>
              </div>
              {nextControl && (
                <div className="bg-emerald-500/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-emerald-500/30 flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-emerald-100">Jadwal Kontrol Berikutnya</p>
                    <p className="text-4xl font-black text-emerald-300">{nextControl}</p>
                  </div>
                  <Calendar size={48} className="text-emerald-400 opacity-50" />
                </div>
              )}
            </div>
            <HeartPulse className="absolute -right-20 -bottom-20 text-white/5" size={400} />
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><Stethoscope className="text-indigo-600" size={28} /> Rekomendasi 10T</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {rec.actions.map((act, i) => (
                 <div key={i} className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-4 hover:bg-white transition-all">
                   <CheckCircle className="text-green-500" size={24} />
                   <p className="text-sm font-black text-indigo-900">{act}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );
    }
    
    const totalPatients = state.users.filter(u => u.role === UserRole.USER).length;
    const highRiskCount = state.ancVisits.filter(v => v.bloodPressure && (parseInt(v.bloodPressure.split('/')[0]) >= 140 || v.edema)).length;
    
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard icon={<Users size={40}/>} title="Ibu Hamil" value={totalPatients} color="indigo" />
          <StatCard icon={<CheckCircle size={40}/>} title="Kunjungan" value={state.ancVisits.length} color="blue" />
          <StatCard icon={<AlertCircle size={40}/>} title="Waspada Resiko" value={highRiskCount} color="red" />
        </div>
        {highRiskCount > 0 && (
          <div className="bg-red-600 p-10 rounded-[3.5rem] flex items-center justify-between text-white shadow-2xl">
            <div><h3 className="text-3xl font-black">Tindak Lanjut Segera!</h3><p className="text-red-100 font-bold">{highRiskCount} pasien terdeteksi resiko tinggi kehamilan.</p></div>
            <button onClick={() => setView('monitoring')} className="px-10 py-5 bg-white text-red-600 rounded-[2rem] font-black uppercase text-xs hover:bg-gray-100 transition-all">Lihat Dashboard Resiko</button>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) return <LoginScreen onLogin={(u) => { setCurrentUser(u); addLog('LOGIN', 'AUTH', `User ${u.name} masuk ke sistem`); }} />;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar currentView={view} onNavigate={setView} onLogout={handleLogout} userRole={currentUser.role} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className={`flex-1 transition-all duration-700 ease-in-out ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <Header 
          title={view === 'monitoring' ? 'Monitoring Resiko' : view} 
          userName={currentUser.name} 
          userRole={currentUser.role} 
          onToggleSidebar={toggleSidebar} 
          onSearchChange={(v) => { setPatientSearch(v); setView('patients'); }} 
          onLogout={handleLogout} 
          isSyncing={isSyncing}
        />
        <div className="p-10 lg:p-16 max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

const StatCard = ({ icon, title, value, color }: any) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border-b-[6px] border-${color}-600 shadow-sm flex items-center gap-6`}>
    <div className={`bg-${color}-50 p-5 rounded-3xl text-${color}-600`}>{icon}</div>
    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p><p className="text-5xl font-black text-gray-900">{value}</p></div>
  </div>
);

const RegistrationForm = ({ initialData, onSubmit, onCancel }: any) => {
  const [coords, setCoords] = useState({ lat: initialData?.lat || '', lng: initialData?.lng || '' });
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  const getGPS = () => {
    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        setIsLoadingGPS(false);
      },
      (err) => {
        alert("Gagal mengambil lokasi GPS. Pastikan izin lokasi aktif.");
        setIsLoadingGPS(false);
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 p-12 text-white">
          <h2 className="text-4xl font-black">{initialData ? 'Perbarui Data Pasien' : 'Daftarkan Pasien Baru'}</h2>
          <p className="opacity-70 mt-3 font-bold uppercase text-[10px] tracking-widest">Integrasi Geolocation & Medis</p>
        </div>
        <form className="p-12 space-y-10" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="font-black text-xs uppercase text-indigo-400 tracking-widest">01. Profil & Lokasi</h3>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase">Nama Lengkap</label>
                <input name="name" defaultValue={initialData?.name} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase">Alamat Domisili</label>
                <textarea name="address" defaultValue={initialData?.address} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none h-24" />
              </div>
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Titik Koordinat (Peta)</span>
                  <button type="button" onClick={getGPS} disabled={isLoadingGPS} className="flex items-center gap-2 text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all">
                    {isLoadingGPS ? "Mencari..." : <><Navigation size={12}/> Deteksi GPS</>}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="lat" placeholder="Latitude" value={coords.lat} onChange={e => setCoords({...coords, lat: e.target.value})} className="bg-white p-3 rounded-xl text-xs font-bold outline-none" required readOnly />
                  <input name="lng" placeholder="Longitude" value={coords.lng} onChange={e => setCoords({...coords, lng: e.target.value})} className="bg-white p-3 rounded-xl text-xs font-bold outline-none" required readOnly />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-black text-xs uppercase text-indigo-400 tracking-widest">02. Kondisi Medis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase">WhatsApp</label>
                  <input name="phone" defaultValue={initialData?.phone} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase">Bulan Hamil</label>
                  <input name="month" type="number" min="1" max="9" defaultValue={initialData?.pregnancyMonth} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase">Gravida (G)</label>
                <input name="number" type="number" min="1" defaultValue={initialData?.pregnancyNumber} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase">Riwayat Resiko</label>
                <input name="history" defaultValue={initialData?.medicalHistory} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="Misal: Hipertensi, Asma, dll" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onCancel} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest">Batal</button>
            <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all">Daftarkan Pasien & Lokasi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VisitForm = ({ patient, onSubmit, onCancel }: { patient: User, onSubmit: any, onCancel: any }) => (
  <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
    <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-emerald-600 p-12 text-white flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black leading-none uppercase tracking-tighter">Input Kunjungan ANC</h2>
          <p className="mt-4 font-bold text-emerald-100 uppercase text-[10px] tracking-widest flex items-center gap-2"><MapPin size={12}/> Pasien: {patient.name}</p>
        </div>
        <Stethoscope size={64} className="opacity-20" />
      </div>
      <form className="p-12 space-y-10" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
             <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">01. Data Klinis</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tekanan Darah (Tensi)</label>
                  <input name="bp" placeholder="Contoh: 120/80" required className="w-full p-5 bg-gray-50 border-none rounded-3xl font-black outline-none focus:ring-4 focus:ring-emerald-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gerakan Janin</label>
                  <select name="fetal" className="w-full p-5 bg-gray-50 border-none rounded-3xl font-black outline-none">
                    <option>Aktif</option>
                    <option>Kurang Aktif</option>
                    <option>Tidak Ada Gerakan</option>
                  </select>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-red-50 p-6 rounded-3xl border border-red-100">
                <input type="checkbox" name="edema" id="edema" className="w-6 h-6 rounded-lg accent-red-600" />
                <label htmlFor="edema" className="text-sm font-black text-red-700 uppercase">Terdapat Pembengkakan (Edema)</label>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Keluhan Saat Ini</label>
                <input name="complaints" placeholder="Mual, Pusing, dll..." className="w-full p-5 bg-gray-50 border-none rounded-3xl font-bold outline-none" />
              </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">02. Rencana Tindak Lanjut</h3>
             <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Tanggal Kunjungan Selanjutnya
                  </label>
                  <input type="date" name="next_visit" required className="w-full p-5 bg-white border-none rounded-2xl font-black text-indigo-900 outline-none shadow-sm" />
                </div>
                <div className="flex items-center gap-4">
                  <input type="checkbox" name="wa_notif" id="wa_notif" defaultChecked className="w-6 h-6 rounded-lg accent-emerald-600" />
                  <label htmlFor="wa_notif" className="text-[10px] font-black text-indigo-900 uppercase leading-tight">Aktifkan Reminder WhatsApp Otomatis (H-1)</label>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Instruksi Medis (Follow Up)</label>
                <textarea name="followup" required placeholder="Instruksi medis untuk pasien..." className="w-full p-6 bg-gray-50 border-none rounded-3xl font-bold italic outline-none h-32" />
              </div>
          </div>
        </div>
        
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs">Batal</button>
          <button type="submit" className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all">Simpan & Jadwalkan Kontrol</button>
        </div>
      </form>
    </div>
  </div>
);
