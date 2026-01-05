
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
    // Fix: Added missing parity properties
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
    // Fix: Added missing parity properties
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
    // Fix: Added missing parity properties
    parityP: 1,
    parityA: 0,
    medicalHistory: 'Riwayat Penyakit Jantung',
    role: UserRole.USER,
    phone: '0895000001',
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
