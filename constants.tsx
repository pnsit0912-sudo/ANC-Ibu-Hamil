
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
    id: 'u2',
    username: 'rina',
    password: 'u2',
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
    phone: '081234567802',
    isActive: true,
    selectedRiskFactors: ['PRE_ECLAMPSIA', 'HYPERTENSION'],
    totalRiskScore: 20
  },
  {
    id: 'u3',
    username: 'dewi',
    password: 'u3',
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
    medicalHistory: 'Riwayat SC 2 tahun lalu',
    role: UserRole.USER,
    phone: '081234567803',
    isActive: true,
    selectedRiskFactors: ['HISTORY_SC'],
    totalRiskScore: 8
  },
  {
    id: 'u4',
    username: 'maya',
    password: 'u4',
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
    phone: '081234567804',
    isActive: true,
    selectedRiskFactors: ['DIABETES', 'AGE_EXTREME'],
    totalRiskScore: 16
  },
  {
    id: 'u5',
    username: 'anisa',
    password: 'u5',
    name: 'Anisa Rahma',
    dob: '1998-02-12',
    address: 'Jl. Ragunan No. 12',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Ragunan',
    lat: -6.3200,
    lng: 106.8200,
    hpht: '2025-01-05',
    pregnancyMonth: 1,
    pregnancyNumber: 1,
    parityP: 0,
    parityA: 0,
    medicalHistory: 'Sehat',
    role: UserRole.USER,
    phone: '081234567805',
    isActive: true,
    selectedRiskFactors: [],
    totalRiskScore: 0
  },
  {
    id: 'u6',
    username: 'lia',
    password: 'u6',
    name: 'Lia Permata',
    dob: '1994-06-25',
    address: 'Cilandak Townhouse No. 5',
    kecamatan: 'Pasar Minggu',
    kelurahan: 'Cilandak Timur',
    lat: -6.2900,
    lng: 106.8100,
    hpht: '2024-06-20',
    pregnancyMonth: 8,
    pregnancyNumber: 2,
    parityP: 1,
    parityA: 0,
    medicalHistory: 'Penyakit Jantung Bawaan',
    role: UserRole.USER,
    phone: '081234567806',
    isActive: true,
    selectedRiskFactors: ['HEART_DIS'],
    totalRiskScore: 12
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
  }
];
