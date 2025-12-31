
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, User, ANCVisit, AppState } from './types';
import { MOCK_USERS, NAVIGATION, PUSKESMAS_INFO, EDUCATION_LIST } from './constants';
import { 
  LogOut, Menu, X, CheckCircle, AlertCircle, 
  Printer, Download, Search, MapPin, Phone, 
  LayoutDashboard, Users, UserPlus, Settings, BookOpen, QrCode,
  Bell, Info
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
            <CheckCircle size={24} />
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
            <p className="text-red-700 text-sm mt-1">Ditemukan {missedCount} pasien yang tidak hadir sesuai jadwal. Segera lakukan tindak lanjut (monitoring kunjungan).</p>
          </div>
          <button 
            onClick={() => setView('monitoring')}
            className="text-xs font-bold text-red-800 underline uppercase tracking-tighter"
          >
            Tindak Lanjut Sekarang
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
                        {v.status === 'MISSED' ? 'AUTO-FLAG: MISSED' : v.status}
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
              <th className="px-6 py-4">Usia Kehamilan</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4">Alamat</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.filter(u => u.role === UserRole.USER).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.pregnancyMonth} Bulan</td>
                <td className="px-6 py-4">{u.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{u.address}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Lihat Detail</button>
                  {role === UserRole.ADMIN && (
                    <button className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ANCSmartCard = ({ user, isAdmin }: { user: User, isAdmin: boolean }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 print:shadow-none print:border-none" id="anc-card">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-white border-4 border-blue-600 rounded-xl">
            <QRCode value={`ANC-PROFILE-${user.id}`} size={180} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-blue-800">KARTU ANC PINTAR</h1>
              <p className="text-gray-500 text-sm">{PUSKESMAS_INFO.name}</p>
            </div>
            <div className="space-y-2 text-left inline-block w-full">
              <div className="flex gap-4">
                <span className="text-gray-400 font-medium w-24">Nama:</span>
                <span className="font-bold text-gray-800">{user.name}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-400 font-medium w-24">ID Pasien:</span>
                <span className="font-bold text-gray-800">{user.id}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-400 font-medium w-24">Tgl Lahir:</span>
                <span className="font-bold text-gray-800">{user.dob}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-400 font-medium w-24">Alamat:</span>
                <span className="font-bold text-gray-800 text-sm">{user.address}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center">
          <p className="text-xs text-gray-400">Pindai kode QR untuk melihat riwayat perkembangan kehamilan dan jadwal ANC.</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-4 no-print">
        {isAdmin && (
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            <Printer size={18} /> Cetak Kartu
          </button>
        )}
        <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">
          <Download size={18} /> Simpan PDF
        </button>
      </div>
    </div>
  );
};

const MapView = ({ users }: { users: User[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize Map
      const map = L.map(mapRef.current).setView([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], 14);
      leafletMap.current = map;

      // Add Tile Layer (OpenStreetMap - Free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom Icons
      const clinicIcon = L.divIcon({
        html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const patientIcon = L.divIcon({
        html: `<div class="bg-red-500 p-1.5 rounded-full border-2 border-white shadow-md text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add Puskesmas Marker
      L.marker([PUSKESMAS_INFO.lat, PUSKESMAS_INFO.lng], { icon: clinicIcon })
        .addTo(map)
        .bindPopup(`<strong>${PUSKESMAS_INFO.name}</strong><br/>Pusat Layanan Kesehatan`)
        .openPopup();

      // Add Patient Markers
      users.filter(u => u.role === UserRole.USER && u.lat && u.lng).forEach(patient => {
        L.marker([patient.lat!, patient.lng!], { icon: patientIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1">
              <strong class="text-blue-700">${patient.name}</strong><br/>
              <span class="text-xs text-gray-500">Hamil: ${patient.pregnancyMonth} Bulan</span><br/>
              <span class="text-[10px] text-gray-400">${patient.address}</span>
            </div>
          `);
      });
    }

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [users]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-xl text-gray-800">Pemetaan Distribusi Pasien</h2>
            <p className="text-sm text-gray-500">Visualisasi lokasi tempat tinggal ibu hamil di wilayah kerja Puskesmas.</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Puskesmas</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Ibu Hamil</div>
          </div>
        </div>
        
        <div className="relative border-4 border-gray-50 rounded-2xl overflow-hidden shadow-inner">
          <div id="map-container" ref={mapRef}></div>
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-[10px] font-medium max-w-[200px]">
            <p className="text-gray-400 uppercase tracking-widest mb-1">Status Sistem</p>
            <p className="text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Peta Berbasis OpenStreetMap (Gratis)
            </p>
          </div>
        </div>
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

  const handleLogout = () => {
    setTimeout(() => {
      if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        setCurrentUser(null);
        setView('dashboard');
        setState(prev => ({ ...prev, selectedPatientId: null }));
        setShowNotificationPanel(false);
      }
    }, 10);
  };

  // Login Simulation
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6 text-blue-600">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Smart ANC</h1>
          <p className="text-gray-500 mb-8">Sistem Monitoring Ibu Hamil Pintar</p>
          <div className="space-y-4">
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              Login sebagai Admin
            </button>
            <button onClick={() => setCurrentUser(MOCK_USERS[3])} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              Login sebagai Nakes
            </button>
            <button onClick={() => setCurrentUser(MOCK_USERS[0])} className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-200">
              Login sebagai Ibu Hamil
            </button>
          </div>
          <p className="mt-8 text-xs text-gray-400">© 2023 Smart ANC - Puskesmas Pasar Minggu</p>
        </div>
      </div>
    );
  }

  const filteredNav = NAVIGATION.filter(nav => nav.roles.includes(currentUser.role));

  const renderContent = () => {
    switch(view) {
      case 'dashboard': return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} setView={setView} />;
      case 'patients': return <PatientList users={state.users} role={currentUser.role} />;
      case 'smart-card': return (
        <div className="space-y-6">
          {currentUser.role === UserRole.USER ? (
            <ANCSmartCard user={currentUser} isAdmin={false} />
          ) : (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h2 className="font-bold text-lg mb-4">Cetak Kartu ANC Pasien</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {state.users.filter(u => u.role === UserRole.USER).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => setState(prev => ({ ...prev, selectedPatientId: u.id }))}
                      className={`p-4 border rounded-xl text-left transition ${state.selectedPatientId === u.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-300'}`}
                    >
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-gray-500">ID: {u.id}</p>
                    </button>
                  ))}
                </div>
              </div>
              {state.selectedPatientId && (
                <ANCSmartCard 
                  user={state.users.find(u => u.id === state.selectedPatientId)!} 
                  isAdmin={currentUser.role === UserRole.ADMIN} 
                />
              )}
            </div>
          )}
        </div>
      );
      case 'education': return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDUCATION_LIST.map(item => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
              <img src={item.thumbnail} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-100 text-blue-600 mb-2 inline-block">
                  {item.type}
                </span>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                <button className="mt-4 w-full py-2 bg-gray-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-50 transition">
                  Pelajari Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>
      );
      case 'map': return <MapView users={state.users} />;
      case 'notifications': return (
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Pusat Notifikasi Auto-Flag</h2>
          <div className="space-y-3">
            {missedVisits.length > 0 ? missedVisits.map((v) => {
              const patient = state.users.find(u => u.id === v.patientId);
              return (
                <div key={v.id} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0 h-fit">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">Pasien Melewatkan Jadwal</h3>
                      <span className="text-xs font-medium text-gray-400">{v.scheduledDate}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      <span className="font-bold text-gray-800">{patient?.name}</span> tidak terdeteksi melakukan pendaftaran/kunjungan ANC pada tanggal yang dijadwalkan.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => setView('monitoring')}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
                      >
                        Lakukan Monitoring
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition">
                        Hubungi Pasien
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                  <Bell className="text-gray-300" size={48} />
                </div>
                <p className="text-gray-500 font-medium">Tidak ada notifikasi baru saat ini.</p>
              </div>
            )}
          </div>
        </div>
      );
      case 'register': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Pendaftaran / Input Data Ibu Hamil</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Data berhasil disimpan!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input type="text" required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                <input type="date" required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              Simpan Data
            </button>
          </form>
        </div>
      );
      case 'monitoring': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Fitur Monitoring & Tindak Lanjut</h2>
          <p className="text-gray-500 mb-8">Menu ini digunakan untuk nakes menginput hasil pemeriksaan (tekanan darah, keluhan, edema, janin) dan tindak lanjut pasca notifikasi auto-flag.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
               <h3 className="font-bold text-blue-800 mb-2">Evaluasi Janin</h3>
               <p className="text-sm text-blue-600">Nakes dapat memonitor pergerakan janin yang diinput oleh ibu atau diperiksa di tempat.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
               <h3 className="font-bold text-green-800 mb-2">Penjadwalan ANC</h3>
               <p className="text-sm text-green-600">Update jadwal kunjungan berikutnya untuk menghindari flag di masa depan.</p>
            </div>
          </div>
        </div>
      );
      case 'contact': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6 text-blue-600">
            <Phone size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">{PUSKESMAS_INFO.name}</h2>
          <div className="space-y-4 text-left border-t pt-8">
            <div className="flex items-start gap-4 p-4">
              <MapPin size={24} className="text-blue-600 shrink-0" />
              <p className="text-gray-600">{PUSKESMAS_INFO.address}</p>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Phone size={24} className="text-green-600 shrink-0" />
              <p className="text-gray-600">{PUSKESMAS_INFO.phone}</p>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} setView={setView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <CheckCircle size={24} />
              </div>
              <span className="text-xl font-black text-gray-900">Smart ANC</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredNav.map((nav) => (
              <button
                key={nav.path}
                onClick={() => setView(nav.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  view === nav.path ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {nav.icon}
                {nav.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="no-print h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden">
              <Menu size={24} className="text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {NAVIGATION.find(n => n.path === view)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell (Only for Admin/Nakes) */}
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.NAKES) && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className={`p-2 rounded-full transition-colors relative ${showNotificationPanel ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Bell size={22} />
                  {missedVisits.length > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                      {missedVisits.length}
                    </span>
                  )}
                </button>
                
                {/* Mini Dropdown Notification */}
                {showNotificationPanel && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Notifikasi Terkini</span>
                      <button onClick={() => setShowNotificationPanel(false)}><X size={16} className="text-gray-400" /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {missedVisits.length > 0 ? missedVisits.map(v => (
                        <div key={v.id} className="p-4 border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer" onClick={() => { setView('notifications'); setShowNotificationPanel(false); }}>
                          <div className="flex gap-3">
                            <div className="bg-red-100 p-2 rounded-lg text-red-600 shrink-0 h-fit">
                              <AlertCircle size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">Jadwal Melewatkan: {state.users.find(u => u.id === v.patientId)?.name}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Sistem auto-flag mendeteksi ketidakhadiran.</p>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{v.scheduledDate}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center">
                          <Info size={32} className="mx-auto text-gray-200 mb-2" />
                          <p className="text-xs text-gray-400">Semua pasien hadir sesuai jadwal.</p>
                        </div>
                      )}
                    </div>
                    {missedVisits.length > 0 && (
                      <button 
                        onClick={() => { setView('notifications'); setShowNotificationPanel(false); }}
                        className="w-full p-3 text-center text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 transition border-t border-gray-50"
                      >
                        Lihat Semua Notifikasi
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Keluar Sesi"
            >
              <LogOut size={22} />
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}