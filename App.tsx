
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, User, ANCVisit, AppState, EducationContent } from './types';
import { MOCK_USERS, NAVIGATION, PUSKESMAS_INFO, EDUCATION_LIST } from './constants';
import { 
  LogOut, Menu, X, CheckCircle, AlertCircle, 
  Printer, Download, Search, MapPin, Phone, 
  LayoutDashboard, Users, UserPlus, Settings, BookOpen, QrCode,
  Bell, Info, ExternalLink, PlayCircle
} from 'lucide-react';
import QRCode from 'react-qr-code';
import L from 'leaflet';

// Views
const Dashboard = ({ state, patients, setView }: { state: AppState, patients: User[], setView: (v: string) => void }) => {
  const missedVisits = state.ancVisits.filter(v => v.status === 'MISSED');
  const missedCount = missedVisits.length;
  const activePatients = patients.length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Ibu Hamil</p>
            <p className="text-2xl font-bold">{activePatients}</p>
          </div>
        </div>
        <div 
          onClick={() => missedCount > 0 && setView('notifications')}
          className={`p-6 rounded-xl shadow-sm border flex items-center space-x-4 cursor-pointer transition-all ${
            missedCount > 0 ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white border-gray-100'
          }`}
        >
          <div className={`p-3 rounded-lg ${missedCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Auto-Flag (Melewatkan ANC)</p>
            <p className={`text-2xl font-bold ${missedCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>{missedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Jadwal Minggu Ini</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
      </div>

      {missedCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-red-800 font-bold text-sm uppercase tracking-wide">Peringatan Sistem Auto-Flag</h3>
            <p className="text-red-700 text-sm mt-1">Ditemukan {missedCount} pasien yang tidak hadir sesuai jadwal. Segera lakukan tindak lanjut.</p>
          </div>
          <button 
            onClick={() => setView('monitoring')}
            className="text-xs font-bold text-red-800 underline uppercase tracking-tighter"
          >
            Tindak Lanjut
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Daftar Kunjungan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Pasien</th>
                <th className="px-6 py-4">Tanggal Kunjungan</th>
                <th className="px-6 py-4">Tekanan Darah</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.ancVisits.slice(0, 10).map((v) => {
                const patient = state.users.find(u => u.id === v.patientId);
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">{v.status === 'MISSED' ? v.scheduledDate : v.visitDate}</td>
                    <td className="px-6 py-4 text-gray-600">{v.bloodPressure || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                        v.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        v.status === 'MISSED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {v.status === 'MISSED' ? 'AUTO-FLAG' : v.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PatientList = ({ users, role }: { users: User[], role: UserRole }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <h2 className="font-bold text-gray-800">Manajemen Data Pasien</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari pasien..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Hamil / Ke-</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4">Riwayat</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.filter(u => u.role === UserRole.USER).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.pregnancyMonth} Bln / G{u.pregnancyNumber}</td>
                <td className="px-6 py-4">{u.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{u.medicalHistory || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EducationCard = ({ content }: { content: EducationContent }) => {
  const isVideo = content.type === 'VIDEO';
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition group">
      <div className="relative h-48 overflow-hidden">
        <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="text-white drop-shadow-lg" size={48} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
            isVideo ? 'bg-red-500 text-white' : content.type === 'TEXT' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {content.type}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 mb-2 leading-tight">{content.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{content.content}</p>
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition group"
        >
          {isVideo ? 'Tonton Video' : 'Baca Selengkapnya'}
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: MOCK_USERS,
    ancVisits: [
      { id: 'v1', patientId: 'u1', visitDate: '2023-11-20', scheduledDate: '2023-11-20', bloodPressure: '120/80', complaints: 'Pusing ringan', edema: false, fetalMovement: 'Aktif', followUp: 'Tingkatkan istirahat', nakesId: 'nakes1', status: 'COMPLETED' },
      { id: 'v2', patientId: 'u2', visitDate: '2023-11-15', scheduledDate: '2023-11-15', bloodPressure: '110/70', complaints: 'Mual pagi hari', edema: false, fetalMovement: 'Normal', followUp: 'Pemberian vit B6', nakesId: 'nakes1', status: 'COMPLETED' },
      { id: 'v3', patientId: 'u1', visitDate: '-', scheduledDate: '2023-10-15', bloodPressure: '-', complaints: '-', edema: false, fetalMovement: '-', followUp: '-', nakesId: 'nakes1', status: 'MISSED' },
    ],
    selectedPatientId: null,
  });

  const missedVisits = useMemo(() => state.ancVisits.filter(v => v.status === 'MISSED'), [state.ancVisits]);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newUser: User = {
      id: `u${Date.now()}`,
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      address: formData.get('address') as string,
      pregnancyMonth: parseInt(formData.get('month') as string),
      pregnancyNumber: parseInt(formData.get('number') as string),
      medicalHistory: formData.get('history') as string,
      phone: formData.get('phone') as string,
      role: UserRole.USER,
      // Random coords around Pasar Minggu for demo
      lat: PUSKESMAS_INFO.lat + (Math.random() - 0.5) * 0.02,
      lng: PUSKESMAS_INFO.lng + (Math.random() - 0.5) * 0.02,
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    alert('Pendaftaran Berhasil! Data pasien telah tersimpan dalam sistem.');
    setView('patients');
  };

  const handleLogout = () => {
    if (window.confirm('Keluar dari sistem?')) {
      setCurrentUser(null);
      setView('dashboard');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Smart ANC</h1>
          <p className="text-gray-500 mb-8">Puskesmas Pasar Minggu</p>
          <div className="space-y-4">
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Login Admin</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[3])} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200">Login Bidan</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[0])} className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition shadow-lg shadow-teal-200">Login Ibu Hamil</button>
          </div>
        </div>
      </div>
    );
  }

  const filteredNav = NAVIGATION.filter(nav => nav.roles.includes(currentUser.role));

  const renderContent = () => {
    switch(view) {
      case 'dashboard': return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} setView={setView} />;
      case 'patients': return <PatientList users={state.users} role={currentUser.role} />;
      case 'register': return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 p-8 text-white">
              <h2 className="text-2xl font-bold">Formulir Pendaftaran ANC</h2>
              <p className="opacity-80 text-sm mt-1">Lengkapi data ibu hamil secara akurat untuk monitoring yang lebih baik.</p>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Identitas Dasar</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                    <input name="name" type="text" required placeholder="Contoh: Siti Rahma" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tanggal Lahir</label>
                    <input name="dob" type="date" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nomor HP / WhatsApp</label>
                    <input name="phone" type="tel" required placeholder="08xxxxxxxxxx" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Klinis & Kehamilan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Usia Hamil (Bulan)</label>
                      <input name="month" type="number" min="1" max="9" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Hamil Ke- (Gravida)</label>
                      <input name="number" type="number" min="1" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Alamat Lengkap (Domisili)</label>
                    <textarea name="address" required rows={3} placeholder="Jl. Raya No. 123..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Riwayat Penyakit / Alergi (Jika ada)</label>
                <input name="history" type="text" placeholder="Asma, Hipertensi, Alergi Obat, dll." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  <UserPlus size={24} /> Simpan Data & Daftarkan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      );
      case 'education': return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EDUCATION_LIST.map(content => (
            <EducationCard key={content.id} content={content} />
          ))}
        </div>
      );
      case 'map': return <MapView users={state.users} />;
      case 'contact': return (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <Phone className="mx-auto text-blue-600 mb-6" size={64} />
          <h2 className="text-3xl font-black text-gray-800 mb-4">{PUSKESMAS_INFO.name}</h2>
          <div className="space-y-6 text-left border-t pt-10">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><MapPin size={24} /></div>
              <p className="text-gray-600 font-medium">{PUSKESMAS_INFO.address}</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600"><Phone size={24} /></div>
              <div>
                <p className="text-gray-900 font-bold">{PUSKESMAS_INFO.phone}</p>
                <p className="text-sm text-gray-500">Layanan Darurat & Konsultasi KIA</p>
              </div>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} setView={setView} />;
    }
  };

  const MapView = ({ users }: { users: User[] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
      if (mapRef.current && !leafletMap.current) {
        const map = L.map(mapRef.current).setView([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], 14);
        leafletMap.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const clinicIcon = L.divIcon({
          html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg></div>`,
          iconSize: [32, 32],
          className: ''
        });

        const patientIcon = L.divIcon({
          html: `<div class="bg-red-500 p-1.5 rounded-full border-2 border-white shadow-md text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
          iconSize: [24, 24],
          className: ''
        });

        L.marker([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], { icon: clinicIcon }).addTo(map).bindPopup(PUSKESMAS_INFO.name);

        users.filter(u => u.role === UserRole.USER && u.lat).forEach(p => {
          L.marker([p.lat!, p.lng!], { icon: patientIcon }).addTo(map).bindPopup(`<b>${p.name}</b><br/>Hamil: ${p.pregnancyMonth} Bln`);
        });
      }
      return () => { if (leafletMap.current) leafletMap.current.remove(); leafletMap.current = null; };
    }, [users]);

    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Peta Sebaran Ibu Hamil</h2>
        <div id="map-container" ref={mapRef} className="h-[600px]"></div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200"><CheckCircle size={28} /></div>
            <span className="text-2xl font-black tracking-tight">Smart ANC</span>
          </div>
          <nav className="flex-1 space-y-1">
            {filteredNav.map((nav) => (
              <button key={nav.path} onClick={() => setView(nav.path)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${view === nav.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                {nav.icon} {nav.name}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-50">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={20} /> Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden"><Menu size={24} /></button>
            <h1 className="text-lg font-black text-gray-800 capitalize">{NAVIGATION.find(n => n.path === view)?.name || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">{currentUser.name.charAt(0)}</div>
             <div className="hidden sm:block">
               <p className="text-sm font-bold leading-none">{currentUser.name}</p>
               <p className="text-[10px] uppercase font-black text-gray-400 mt-1">{currentUser.role}</p>
             </div>
          </div>
        </header>
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
