
import React from 'react';
import { UserRole, User, EducationContent } from './types';
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
  { name: 'Manajemen Akses', icon: <ShieldCheck size={20} />, roles: [UserRole.ADMIN], path: 'management' },
  { name: 'Pendaftaran ANC', icon: <UserPlus size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'register' },
  { name: 'Monitoring Resiko', icon: <MapPin size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'monitoring' },
  { name: 'Pemetaan Lokasi', icon: <MapIcon size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'map' },
  { name: 'Edukasi Ibu', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'education' },
  { name: 'Kartu ANC Pintar', icon: <QrCode size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'smart-card' },
  { name: 'Kontak Kami', icon: <Phone size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'contact' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    name: 'Kepala Puskesmas',
    dob: '1980-01-01',
    address: 'Kantor Puskesmas Pasar Minggu',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pasar Minggu',
    hpht: '',
    pregnancyMonth: 0,
    pregnancyNumber: 0,
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
    name: 'Bidan Koordinator',
    dob: '1985-03-10',
    address: 'Puskesmas Pasar Minggu',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pasar Minggu',
    hpht: '',
    pregnancyMonth: 0,
    pregnancyNumber: 0,
    medicalHistory: 'SYSTEM_NAKES',
    role: UserRole.NAKES,
    phone: '0813000000',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0
  },
  // 1. Pasien Triase Hitam (Kritis)
  {
    id: 'u1',
    username: 'u1',
    password: 'u1',
    name: 'Siti Aminah',
    dob: '1995-05-12',
    address: 'Jl. Pejaten No. 10',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Pejaten Barat',
    lat: -6.2850,
    lng: 106.8250,
    hpht: '2024-05-10',
    pregnancyMonth: 8,
    pregnancyNumber: 2,
    medicalHistory: 'Riwayat Penyakit Jantung',
    role: UserRole.USER,
    phone: '0895000001',
    isActive: true,
    selectedRiskFactors: ['HEART_DIS'],
    totalRiskScore: 12
  },
  // 2. Pasien Triase Merah (Risiko Sangat Tinggi)
  {
    id: 'u2',
    username: 'u2',
    password: 'u2',
    name: 'Lani Marlina',
    dob: '1992-08-20',
    address: 'Komp. Kebagusan Permai',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Kebagusan',
    lat: -6.3050,
    lng: 106.8350,
    hpht: '2024-06-15',
    pregnancyMonth: 7,
    pregnancyNumber: 3,
    medicalHistory: 'Bekas SC 1x, Anemia',
    role: UserRole.USER,
    phone: '0895000002',
    isActive: true,
    selectedRiskFactors: ['HISTORY_SC', 'ANEMIA'],
    totalRiskScore: 12
  },
  // 3. Pasien Triase Kuning (Risiko Tinggi)
  {
    id: 'u3',
    username: 'u3',
    password: 'u3',
    name: 'Diana Putri',
    dob: '1998-11-05',
    address: 'Gg. Jati No. 45',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Jati Padang',
    lat: -6.2950,
    lng: 106.8300,
    hpht: '2024-08-01',
    pregnancyMonth: 5,
    pregnancyNumber: 2,
    medicalHistory: 'Jarak kehamilan < 2 tahun',
    role: UserRole.USER,
    phone: '0895000003',
    isActive: true,
    selectedRiskFactors: ['SHORT_PREG'],
    totalRiskScore: 4
  },
  // 4. Pasien Triase Hijau (Risiko Rendah)
  {
    id: 'u4',
    username: 'u4',
    password: 'u4',
    name: 'Eka Safitri',
    dob: '2000-02-14',
    address: 'Jl. Ragunan Raya No. 1',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Ragunan',
    lat: -6.3120,
    lng: 106.8200,
    hpht: '2024-09-20',
    pregnancyMonth: 3,
    pregnancyNumber: 1,
    medicalHistory: 'Normal / Tidak ada',
    role: UserRole.USER,
    phone: '0895000004',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0
  }
];

export const EDUCATION_LIST: EducationContent[] = [
  {
    id: 'e1',
    title: 'Gizi Seimbang Ibu Hamil',
    type: 'TEXT',
    category: 'Gizi',
    content: 'Pentingnya asupan protein, zat besi, dan asam folat selama masa kehamilan.',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    url: 'https://promkes.kemkes.go.id/pentingnya-gizi-seimbang-bagi-ibu-hamil'
  },
  {
    id: 'e2',
    title: 'Senam Hamil Trimester III',
    type: 'VIDEO',
    category: 'Fisik',
    content: 'Panduan gerakan ringan untuk melancarkan proses persalinan.',
    thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'e3',
    title: 'Kenali Tanda Bahaya Kehamilan',
    type: 'TEXT',
    category: 'Bahaya',
    content: 'Informasi mengenai gejala yang memerlukan penanganan medis segera seperti pusing hebat.',
    thumbnail: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80',
    url: 'https://ayosehat.kemkes.go.id/tanda-bahaya-pada-kehamilan'
  },
  {
    id: 'e4',
    title: 'Persiapan Persalinan Nyaman',
    type: 'TEXT',
    category: 'Persalinan',
    content: 'Daftar persiapan fisik dan mental menjelang hari perkiraan lahir.',
    thumbnail: 'https://images.unsplash.com/photo-1555252333-978fe317e674?auto=format&fit=crop&w=800&q=80',
    url: 'https://promkes.kemkes.go.id/persiapan-persalinan'
  }
];
