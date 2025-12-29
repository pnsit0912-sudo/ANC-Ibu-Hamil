
import React from 'react';
import { UserRole, EducationContent, User } from './types';
import { LayoutDashboard, Users, UserPlus, BookOpen, MapPin, QrCode, Phone, LogOut, Settings } from 'lucide-react';

export const PUSKESMAS_INFO = {
  name: "Puskesmas Pasar Minggu",
  address: "Jl. Kebagusan Raya No.4, RT.4/RW.4 12520 Jakarta Jakarta",
  phone: "+6289521868087",
  email: "kontak@puskesmas-pasarminggu.go.id",
  lat: -6.2996,
  lng: 106.8315
};

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'dashboard' },
  { name: 'Data Pasien', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'patients' },
  { name: 'Pendaftaran ANC', icon: <UserPlus size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'register' },
  { name: 'Monitoring & Tindak Lanjut', icon: <Settings size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'monitoring' },
  { name: 'Edukasi Ibu Hamil', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'education' },
  { name: 'Pemetaan Lokasi', icon: <MapPin size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'map' },
  { name: 'Kartu ANC Pintar', icon: <QrCode size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'smart-card' },
  { name: 'Kontak Kami', icon: <Phone size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'contact' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Siti Aminah',
    dob: '1995-05-15',
    address: 'Jl. Melati No. 5, Pasar Minggu',
    lat: -6.3010,
    lng: 106.8330,
    pregnancyMonth: 7,
    medicalHistory: 'Asma ringan',
    role: UserRole.USER,
    phone: '08571234567'
  },
  {
    id: 'u2',
    name: 'Dewi Lestari',
    dob: '1992-08-20',
    address: 'Jl. Mawar No. 12, Kebagusan',
    lat: -6.2980,
    lng: 106.8350,
    pregnancyMonth: 4,
    medicalHistory: 'Tidak ada',
    role: UserRole.USER,
    phone: '0857999888'
  },
  {
    id: 'admin',
    name: 'Admin Sistem',
    dob: '1980-01-01',
    address: 'Puskesmas Pasar Minggu',
    pregnancyMonth: 0,
    medicalHistory: 'N/A',
    role: UserRole.ADMIN,
    phone: '0812000000'
  },
  {
    id: 'nakes1',
    name: 'Bidan Ratna',
    dob: '1985-03-10',
    address: 'Puskesmas Pasar Minggu',
    pregnancyMonth: 0,
    medicalHistory: 'N/A',
    role: UserRole.NAKES,
    phone: '0813111111'
  }
];

export const EDUCATION_LIST: EducationContent[] = [
  {
    id: 'e1',
    title: 'Nutrisi Penting Trimester Pertama',
    type: 'TEXT',
    content: 'Fokus pada asam folat, zat besi, dan kalsium untuk pertumbuhan awal janin...',
    thumbnail: 'https://picsum.photos/seed/health1/400/250'
  },
  {
    id: 'e2',
    title: 'Senam Ibu Hamil di Rumah',
    type: 'VIDEO',
    content: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/health2/400/250'
  },
  {
    id: 'e3',
    title: 'Panduan Persiapan Melahirkan',
    type: 'IMAGE',
    content: 'https://picsum.photos/seed/infographic1/800/1200',
    thumbnail: 'https://picsum.photos/seed/health3/400/250'
  }
];
