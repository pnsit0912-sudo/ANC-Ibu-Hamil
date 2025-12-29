
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, User, ANCVisit, AppState } from './types';
import { MOCK_USERS, NAVIGATION, PUSKESMAS_INFO, EDUCATION_LIST } from './constants';
import { LogOut, Menu, X, CheckCircle, AlertCircle, Printer, Download, Search, MapPin, Phone } from 'lucide-react';
import QRCode from 'react-qr-code';

// Views
const Dashboard = ({ state, patients }: { state: AppState, patients: User[] }) => {
  const missedCount = state.ancVisits.filter(v => v.status === 'MISSED').length;
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Absensi Terlewat (Auto-Flag)</p>
            <p className="text-2xl font-bold">{missedCount}</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
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
              {state.ancVisits.slice(0, 5).map((v) => {
                const patient = state.users.find(u => u.id === v.patientId);
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">{v.visitDate}</td>
                    <td className="px-6 py-4 text-gray-600">{v.bloodPressure}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        v.status === 'MISSED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {v.status}
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
            <div className="space-y-2">
              <div className="flex justify-between md:justify-start gap-4">
                <span className="text-gray-400 font-medium w-32">Nama:</span>
                <span className="font-bold text-gray-800">{user.name}</span>
              </div>
              <div className="flex justify-between md:justify-start gap-4">
                <span className="text-gray-400 font-medium w-32">ID Pasien:</span>
                <span className="font-bold text-gray-800">{user.id}</span>
              </div>
              <div className="flex justify-between md:justify-start gap-4">
                <span className="text-gray-400 font-medium w-32">Tgl Lahir:</span>
                <span className="font-bold text-gray-800">{user.dob}</span>
              </div>
              <div className="flex justify-between md:justify-start gap-4">
                <span className="text-gray-400 font-medium w-32">Alamat:</span>
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
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-lg mb-4">Pemetaan Distribusi Ibu Hamil</h2>
        <div className="h-[500px] w-full bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
          <img src="https://picsum.photos/seed/map/1200/800" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="map placeholder" />
          <div className="relative z-10 flex flex-col items-center">
            <MapPin className="text-blue-600 mb-2" size={48} />
            <p className="text-gray-600 font-medium">Integrasi Google Maps API</p>
            <p className="text-gray-400 text-sm">Menampilkan {users.filter(u => u.role === UserRole.USER).length} pasien terdaftar</p>
          </div>
          {/* Mock Markers */}
          <div className="absolute top-1/4 left-1/3 p-1 bg-white rounded-full shadow-lg border-2 border-red-500"><MapPin size={16} className="text-red-500" /></div>
          <div className="absolute bottom-1/2 right-1/4 p-1 bg-white rounded-full shadow-lg border-2 border-red-500"><MapPin size={16} className="text-red-500" /></div>
          <div className="absolute top-2/3 left-1/2 p-1 bg-white rounded-full shadow-lg border-2 border-blue-600"><MapPin size={16} className="text-blue-600" /></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      setCurrentUser(null);
      setView('dashboard');
      // Reset state pilihan pasien juga untuk keamanan
      setState(prev => ({ ...prev, selectedPatientId: null }));
    }
  };

  // Login Simulation early return
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6 text-blue-600">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Smart ANC</h1>
          <p className="text-gray-500 mb-8">Pilih akun untuk mulai eksplorasi prototipe</p>
          <div className="space-y-4">
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              Login sebagai Admin
            </button>
            <button onClick={() => setCurrentUser(MOCK_USERS[3])} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2">
              Login sebagai Nakes
            </button>
            <button onClick={() => setCurrentUser(MOCK_USERS[0])} className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition flex items-center justify-center gap-2">
              Login sebagai Ibu Hamil
            </button>
          </div>
          <p className="mt-8 text-xs text-gray-400">© 2023 Smart ANC - Monitoring Ibu Hamil Pintar</p>
        </div>
      </div>
    );
  }

  const filteredNav = NAVIGATION.filter(nav => nav.roles.includes(currentUser.role));

  const renderContent = () => {
    switch(view) {
      case 'dashboard': return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} />;
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
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    item.type === 'VIDEO' ? 'bg-red-100 text-red-600' : 
                    item.type === 'TEXT' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.type}
                  </span>
                </div>
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
      case 'register': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Pendaftaran / Input Data Ibu Hamil</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Data berhasil disimpan!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Siti Aminah" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                <input type="date" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Usia Kehamilan (Bulan)</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>{m} Bulan</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">No. Telepon / WhatsApp</label>
                <input type="tel" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="08..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Alamat Lengkap (Terintegrasi Map)</label>
              <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Masukkan alamat lengkap..."></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Riwayat Penyakit</label>
              <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Contoh: Asma, Alergi, dll"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Simpan Data Pendaftaran
            </button>
          </form>
        </div>
      );
      case 'monitoring': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Input Monitoring Nakes (Follow-up)</h2>
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">Pilih Pasien Terdaftar</label>
            <select className="w-full p-3 border-none bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              {state.users.filter(u => u.role === UserRole.USER).map(u => <option key={u.id} value={u.id}>{u.name} - ID: {u.id}</option>)}
            </select>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Monitoring berhasil disimpan!'); }}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tekanan Darah (mmHg)</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 120/80" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Bengkak Kaki/Tangan (Edema)</label>
                <div className="flex gap-4 p-3 border border-gray-200 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="edema" value="ya" /> Ya</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="edema" value="tidak" /> Tidak</label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Gerakan Janin</label>
                <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sangat Aktif</option>
                  <option>Aktif</option>
                  <option>Kurang Aktif</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Penjadwalan Kunjungan Berikutnya (ANC)</label>
                <input type="date" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Keluhan Ibu</label>
              <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Masukkan keluhan jika ada..."></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Evaluasi & Tindak Lanjut Nakes</label>
              <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Saran/tindakan medis..."></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
              Simpan Hasil Monitoring
            </button>
          </form>
        </div>
      );
      case 'contact': return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6 text-blue-600">
            <Phone size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">{PUSKESMAS_INFO.name}</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Kami siap melayani Anda dengan sepenuh hati. Silakan hubungi kami atau kunjungi alamat kami untuk pelayanan kesehatan.</p>
          <div className="space-y-4 text-left border-t pt-8">
            <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MapPin size={24} /></div>
              <div>
                <p className="font-bold text-gray-800">Alamat</p>
                <p className="text-gray-600">{PUSKESMAS_INFO.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Phone size={24} /></div>
              <div>
                <p className="font-bold text-gray-800">Telepon / WhatsApp</p>
                <p className="text-gray-600">{PUSKESMAS_INFO.phone}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 h-48 bg-gray-100 rounded-xl overflow-hidden relative">
            <img src="https://picsum.photos/seed/puskesmas/800/400" className="w-full h-full object-cover opacity-50" alt="map" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-blue-200 font-bold text-blue-600 flex items-center gap-2">
                <MapPin size={16} /> Lokasi Puskesmas
              </div>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard state={state} patients={state.users.filter(u => u.role === UserRole.USER)} />;
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
              <span className="text-xl font-black text-gray-900 tracking-tight">Smart ANC</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredNav.map((nav) => (
              <button
                key={nav.path}
                onClick={() => setView(nav.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  view === nav.path ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {nav.icon}
                {nav.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3">
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
              className="mt-2 w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="no-print h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {NAVIGATION.find(n => n.path === view)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peran Akses</span>
              <span className="text-sm font-bold text-blue-600">{currentUser.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
