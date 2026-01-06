
import React from 'react';
import { UserRole, User, EducationContent, ANCVisit } from './types';
import { LayoutDashboard, Users, UserPlus, BookOpen, MapPin, QrCode, Phone, ShieldCheck, Map as MapIcon } from 'lucide-react';

export const PUSKESMAS_INFO = {
  name: "Puskesmas Pasar Minggu",
  address: "Jl. Kebagusan Raya No.4, RT.4/RW.4 12520 Jakarta Jakarta",
  phone: "+6289521868087",
  email: "kontak@puskesmas-pasarminggu.go.id",
  lat: -6.2996,
  lng: 106.8315
};

export const WILAYAH_DATA = {
  "Pasar Minggu": [
    "Pejaten Barat",
    "Pejaten Timur",
    "Pasar Minggu",
    "Kebagusan",
    "Jati Padang",
    "Ragunan",
    "Cilandak Timur"
  ]
};

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'dashboard' },
  { name: 'Data Pasien', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'patients' },
  { name: 'Monitoring Resiko', icon: <MapPin size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'monitoring' },
  { name: 'Pemetaan Lokasi', icon: <MapIcon size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'map' },
  { name: 'Pendaftaran ANC', icon: <UserPlus size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'register' },
  { name: 'Manajemen Akses', icon: <ShieldCheck size={20} />, roles: [UserRole.ADMIN], path: 'management' },
  { name: 'Kartu ANC Pintar', icon: <QrCode size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'smart-card' },
  { name: 'Edukasi Ibu', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'education' },
  { name: 'Kontak Kami', icon: <Phone size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'contact' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Ahmad (Admin)',
    dob: '1980-01-01',
    address: 'Kantor Puskesmas Pasar Minggu',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pasar Minggu',
    hpht: '',
    pregnancyMonth: 0,
    pregnancyNumber: 0,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'SYSTEM_ADMIN',
    role: UserRole.ADMIN,
    phone: '0812000000',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0
  },
  {
    id: 'bidan',
    username: 'bidan',
    password: 'bidan123',
    name: 'Bidan Siti, S.Tr.Keb',
    dob: '1985-03-10',
    address: 'Puskesmas Pasar Minggu',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pasar Minggu',
    hpht: '',
    pregnancyMonth: 0,
    pregnancyNumber: 0,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'SYSTEM_NAKES',
    role: UserRole.NAKES,
    phone: '0813000000',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0
  },
  // 1. PASIEN HIJAU - TEPAT WAKTU (Pejaten Barat)
  {
    id: 'ANC-2025-1001',
    username: 'siti',
    password: '123',
    name: 'Siti Aminah',
    dob: '1998-05-12',
    address: 'Jl. Pejaten Raya No. 45',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pejaten Barat',
    lat: -6.2850,
    lng: 106.8250,
    hpht: '2025-01-15',
    pregnancyMonth: 2,
    pregnancyNumber: 1,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'Tidak ada riwayat penyakit',
    role: UserRole.USER,
    phone: '081299887711',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0 // HIJAU
  },
  // 2. PASIEN KUNING - MANGKIR (Ragunan)
  {
    id: 'ANC-2025-1002',
    username: 'linda',
    password: '123',
    name: 'Linda Kusuma',
    dob: '1988-10-20',
    address: 'Kavling Polri Blok D, Ragunan',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Ragunan',
    lat: -6.3120,
    lng: 106.8210,
    hpht: '2024-11-05',
    pregnancyMonth: 4,
    pregnancyNumber: 4,
    parityP: 3,
    parityA: 0,
    medicalHistory: 'Riwayat persalinan lama',
    role: UserRole.USER,
    phone: '081299887722',
    isActive: true,
    selectedRiskFactors: ['PARITY_HIGH'],
    totalRiskScore: 4 // KUNING (Skor 4 + 2 = 6)
  },
  // 3. PASIEN MERAH - TEPAT WAKTU (Kebagusan)
  {
    id: 'ANC-2025-1003',
    username: 'dewi',
    password: '123',
    name: 'Dewi Rahayu',
    dob: '1990-02-14',
    address: 'Jl. Kebagusan Dalam IV',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Kebagusan',
    lat: -6.3050,
    lng: 106.8350,
    hpht: '2024-10-10',
    pregnancyMonth: 5,
    pregnancyNumber: 2,
    parityP: 1,
    parityA: 0,
    medicalHistory: 'Diabetes Melitus Tipe 2',
    role: UserRole.USER,
    phone: '081299887733',
    isActive: true,
    selectedRiskFactors: ['DIABETES'],
    totalRiskScore: 12 // MERAH
  },
  // 4. PASIEN HITAM - MANGKIR & EMERGENCY (Jati Padang)
  {
    id: 'ANC-2025-1004',
    username: 'fitri',
    password: '123',
    name: 'Fitri Handayani',
    dob: '1995-07-30',
    address: 'Gg. Seratus, Jati Padang',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Jati Padang',
    lat: -6.2920,
    lng: 106.8380,
    hpht: '2024-12-20',
    pregnancyMonth: 3,
    pregnancyNumber: 2,
    parityP: 1,
    parityA: 0,
    medicalHistory: 'Pernah keguguran sebelumnya',
    role: UserRole.USER,
    phone: '081299887744',
    isActive: true,
    selectedRiskFactors: ['SHORT_PREG'],
    totalRiskScore: 4 // Namun data ANC terakhir kritis
  },
  // 5. PASIEN HIJAU - TEPAT WAKTU (Cilandak Timur)
  {
    id: 'ANC-2025-1005',
    username: 'andini',
    password: '123',
    name: 'Andini Putri',
    dob: '1999-01-25',
    address: 'Jl. Ampera Raya No. 12',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Cilandak Timur',
    lat: -6.2980,
    lng: 106.8150,
    hpht: '2025-02-01',
    pregnancyMonth: 1,
    pregnancyNumber: 1,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'Sehat',
    role: UserRole.USER,
    phone: '081299887755',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0 // HIJAU
  }
];

export const MOCK_ANC_VISITS: ANCVisit[] = [
  // SITI AMINAH (HIJAU - Tepat Waktu)
  {
    id: 'v-siti-1',
    patientId: 'ANC-2025-1001',
    visitDate: '2025-02-15',
    scheduledDate: '2025-02-15',
    nextVisitDate: '2025-03-15',
    weight: 55.0,
    bloodPressure: '110/70',
    tfu: 10,
    djj: 140,
    hb: 12.5,
    complaints: 'Mual ringan',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'ANC_RUTIN',
    nakesNotes: 'Kondisi ibu dan janin sangat baik.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // LINDA KUSUMA (KUNING - MANGKIR)
  {
    id: 'v-linda-1',
    patientId: 'ANC-2025-1002',
    visitDate: '2025-01-05',
    scheduledDate: '2025-01-05',
    nextVisitDate: '2025-02-05', // SUDAH LEWAT -> MANGKIR
    weight: 62.0,
    bloodPressure: '120/80',
    tfu: 15,
    djj: 142,
    hb: 11.2,
    complaints: 'Nyeri punggung',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'ANC_RUTIN',
    nakesNotes: 'Edukasi senam hamil.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // DEWI RAHAYU (MERAH - Tepat Waktu)
  {
    id: 'v-dewi-1',
    patientId: 'ANC-2025-1003',
    visitDate: '2025-02-20',
    scheduledDate: '2025-02-20',
    nextVisitDate: '2025-03-05',
    weight: 68.5,
    bloodPressure: '135/85',
    tfu: 22,
    djj: 148,
    hb: 10.8,
    complaints: 'Cepat lelah',
    dangerSigns: [],
    edema: true,
    fetalMovement: 'Normal',
    followUp: 'KONSUL_DOKTER',
    nakesNotes: 'Pantau gula darah puasa tiap minggu.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // FITRI HANDAYANI (HITAM - MANGKIR & KRITIS)
  {
    id: 'v-fitri-1',
    patientId: 'ANC-2025-1004',
    visitDate: '2025-01-25',
    scheduledDate: '2025-01-25',
    nextVisitDate: '2025-02-08', // SUDAH LEWAT -> MANGKIR
    weight: 58.0,
    bloodPressure: '165/105', // KRITIS
    tfu: 14,
    djj: 110, // KRITIS (Bellow 120)
    hb: 9.5,
    complaints: 'Perdarahan bercak dan pusing hebat',
    dangerSigns: ['Perdarahan', 'Pusing Hebat'],
    edema: true,
    fetalMovement: 'Kurang Aktif',
    followUp: 'RUJUK_RS',
    nakesNotes: 'Gawat Darurat! Pasien harus segera ke RS. Terakhir terlihat mangkir kontrol ulang.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // ANDINI PUTRI (HIJAU - Tepat Waktu)
  {
    id: 'v-andini-1',
    patientId: 'ANC-2025-1005',
    visitDate: '2025-02-22',
    scheduledDate: '2025-02-22',
    nextVisitDate: '2025-03-22',
    weight: 50.5,
    bloodPressure: '110/70',
    tfu: 8,
    djj: 145,
    hb: 13.0,
    complaints: 'Tidak ada',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'ANC_RUTIN',
    nakesNotes: 'Kehamilan awal yang sehat.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  }
];

export const EDUCATION_LIST: EducationContent[] = [
  {
    id: 'e1',
    title: 'Gizi Seimbang Ibu Hamil (Kemenkes)',
    type: 'TEXT',
    category: 'Gizi',
    content: 'Pentingnya asupan protein, zat besi, dan asam folat selama masa kehamilan untuk mencegah anemia dan stunting.',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    url: 'https://ayosehat.kemkes.go.id/pentingnya-pemenuhan-gizi-seimbang-bagi-ibu-hamil'
  },
  {
    id: 'e2',
    title: 'Tanda Bahaya Kehamilan (Video)',
    type: 'VIDEO',
    category: 'Emergensi',
    content: 'Visualisasi gejala kritis seperti perdarahan, pusing hebat, dan bengkak pada kaki yang perlu segera ditangani.',
    thumbnail: 'https://images.unsplash.com/photo-1505751172107-597d5a4d73dd?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1'
  },
  {
    id: 'e3',
    title: 'Tips Persalinan Aman & Nyaman',
    type: 'TEXT',
    category: 'Persiapan',
    content: 'Persiapan fisik dan mental menjelang persalinan, termasuk teknik pernapasan dan perlengkapan tas rumah sakit.',
    thumbnail: 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&w=800&q=80',
    url: 'https://promkes.kemkes.go.id/6-persiapan-persalinan-yang-harus-diketahui-ibu-hamil'
  },
  {
    id: 'e4',
    title: 'Pentingnya Tablet Tambah Darah',
    type: 'TEXT',
    category: 'Gizi',
    content: 'Alasan mengapa ibu hamil wajib mengonsumsi TTD minimal 90 tablet selama masa kehamilan.',
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    url: 'https://sehatnegeriku.kemkes.go.id/baca/rilis-media/20230125/4742278/cegah-stunting-sejak-hamil-dengan-konsumsi-tablet-tambah-darah/'
  }
];
