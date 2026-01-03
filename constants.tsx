
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
  {
    id: 'ANC-2025-0001',
    username: 'rina',
    password: 'rina123',
    name: 'Rina Kartika',
    dob: '1992-08-20',
    address: 'Jl. Kebagusan Dalam No. 4',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Kebagusan',
    lat: -6.3100,
    lng: 106.8300,
    hpht: '2024-07-15',
    pregnancyMonth: 7,
    pregnancyNumber: 3,
    parityP: 2,
    parityA: 0,
    medicalHistory: 'Hipertensi Kronis',
    role: UserRole.USER,
    phone: '081234567801',
    isActive: true,
    selectedRiskFactors: ['PRE_ECLAMPSIA', 'HYPERTENSION'],
    totalRiskScore: 20 // TRIASE HITAM (Karena Klinis Terakhir BP Tinggi)
  },
  {
    id: 'ANC-2025-0002',
    username: 'maya',
    password: 'maya123',
    name: 'Maya Indah',
    dob: '1982-11-30',
    address: 'Pejaten Estate Block C',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pejaten Timur',
    lat: -6.2880,
    lng: 106.8280,
    hpht: '2024-11-05',
    pregnancyMonth: 3,
    pregnancyNumber: 4,
    parityP: 3,
    parityA: 0,
    medicalHistory: 'Diabetes Melitus',
    role: UserRole.USER,
    phone: '081234567802',
    isActive: true,
    selectedRiskFactors: ['DIABETES', 'AGE_EXTREME'],
    totalRiskScore: 16 // TRIASE MERAH (Skor >= 12)
  },
  {
    id: 'ANC-2025-0003',
    username: 'dewi',
    password: 'dewi123',
    name: 'Dewi Sartika',
    dob: '1990-05-15',
    address: 'Jl. Jati Padang Baru No. 88',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Jati Padang',
    lat: -6.2950,
    lng: 106.8400,
    hpht: '2024-09-10',
    pregnancyMonth: 5,
    pregnancyNumber: 2,
    parityP: 1,
    parityA: 0,
    medicalHistory: 'Riwayat Sesar 2 tahun lalu',
    role: UserRole.USER,
    phone: '081234567803',
    isActive: true,
    selectedRiskFactors: ['HISTORY_SC'],
    totalRiskScore: 8 // TRIASE KUNING (Skor 6-10)
  },
  {
    id: 'ANC-2025-0004',
    username: 'ani',
    password: 'ani123',
    name: 'Ani Permata',
    dob: '1996-06-25',
    address: 'Jl. Pasar Minggu Raya No. 12',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pasar Minggu',
    lat: -6.3000,
    lng: 106.8320,
    hpht: '2024-12-20',
    pregnancyMonth: 2,
    pregnancyNumber: 1,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'Tidak ada penyakit kronis',
    role: UserRole.USER,
    phone: '081234567804',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0 // TRIASE HIJAU (Skor 2/KRR)
  }
];

export const MOCK_ANC_VISITS: ANCVisit[] = [
  // RINA KARTIKA (TRIASE HITAM)
  {
    id: 'v-rina-1',
    patientId: 'ANC-2025-0001',
    visitDate: '2025-01-10',
    scheduledDate: '2025-01-10',
    nextVisitDate: '2025-02-10',
    weight: 65.5,
    bloodPressure: '145/95',
    tfu: 24,
    djj: 144,
    hb: 10.5,
    complaints: 'Sakit kepala ringan',
    dangerSigns: ['Pusing Hebat'],
    edema: true,
    fetalMovement: 'Normal',
    followUp: 'KONSUL_DOKTER',
    nakesNotes: 'Waspada Pre-eklampsia, diet rendah garam.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  {
    id: 'v-rina-2',
    patientId: 'ANC-2025-0001',
    visitDate: '2025-02-15',
    scheduledDate: '2025-02-10',
    nextVisitDate: '2025-03-15',
    weight: 68.2,
    bloodPressure: '165/110', // KLINIS HITAM
    tfu: 28,
    djj: 150,
    hb: 10.2,
    complaints: 'Pandangan kabur',
    dangerSigns: ['Pusing Hebat', 'Nyeri Perut Hebat'],
    edema: true,
    fetalMovement: 'Normal',
    followUp: 'RUJUK_RS',
    nakesNotes: 'KRITIS: Tekanan darah sangat tinggi, tanda Pre-eklampsia Berat. Rujuk RS segera.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // MAYA INDAH (TRIASE MERAH)
  {
    id: 'v-maya-1',
    patientId: 'ANC-2025-0002',
    visitDate: '2025-02-05',
    scheduledDate: '2025-02-05',
    nextVisitDate: '2025-03-05',
    weight: 75.0,
    bloodPressure: '130/85',
    tfu: 18,
    djj: 142,
    hb: 11.0,
    complaints: 'Sering haus',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'KONSUL_DOKTER',
    nakesNotes: 'Pantauan ketat kadar gula darah.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // DEWI SARTIKA (TRIASE KUNING)
  {
    id: 'v-dewi-1',
    patientId: 'ANC-2025-0003',
    visitDate: '2025-01-20',
    scheduledDate: '2025-01-20',
    nextVisitDate: '2025-02-20',
    weight: 60.0,
    bloodPressure: '110/70',
    tfu: 20,
    djj: 138,
    hb: 11.5,
    complaints: 'Nyeri bekas jahitan SC',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'ANC_RUTIN',
    nakesNotes: 'Kondisi stabil, bekas SC aman.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  },
  // ANI PERMATA (TRIASE HIJAU)
  {
    id: 'v-ani-1',
    patientId: 'ANC-2025-0004',
    visitDate: '2025-02-18',
    scheduledDate: '2025-02-18',
    nextVisitDate: '2025-03-18',
    weight: 52.0,
    bloodPressure: '115/75',
    tfu: 12,
    djj: 140,
    hb: 12.0,
    complaints: 'Mual ringan di pagi hari',
    dangerSigns: [],
    edema: false,
    fetalMovement: 'Normal',
    followUp: 'ANC_RUTIN',
    nakesNotes: 'Ibu dan janin sangat sehat. Lanjutkan nutrisi bergizi.',
    nakesId: 'bidan',
    status: 'COMPLETED'
  }
];

export const EDUCATION_LIST: EducationContent[] = [
  {
    id: 'e1',
    title: 'Gizi Seimbang Ibu Hamil',
    type: 'TEXT',
    category: 'Gizi',
    content: 'Pentingnya asupan protein, zat besi, dan asam folat selama masa kehamilan untuk mencegah anemia dan stunting.',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    url: 'https://promkes.kemkes.go.id/pentingnya-gizi-seimbang-bagi-ibu-hamil'
  },
  {
    id: 'e2',
    title: 'Mengenali Tanda Bahaya Kehamilan',
    type: 'VIDEO',
    category: 'Emergensi',
    content: 'Pelajari gejala kritis seperti perdarahan, pusing hebat, dan ketuban pecah dini yang memerlukan tindakan segera.',
    thumbnail: 'https://images.unsplash.com/photo-1505751172107-597d5a4d73dd?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.youtube.com/watch?v=kYI0W7U2H_Y'
  }
];
