
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
    pregnancyNumber: 2,
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
    pregnancyNumber: 1,
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
    pregnancyNumber: 0,
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
    pregnancyNumber: 0,
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
    content: 'Panduan lengkap mengenai asam folat, zat besi, dan kalsium untuk pertumbuhan janin.',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400',
    url: 'https://www.alodokter.com/nutrisi-ibu-hamil-trimester-1-yang-harus-dipenuhi'
  },
  {
    id: 'e2',
    title: 'Senam Ibu Hamil Trimester 2 & 3',
    type: 'VIDEO',
    content: 'Gerakan ringan untuk membantu kelancaran persalinan dan mengurangi nyeri punggung.',
    thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'e3',
    title: 'Infografis Tanda Bahaya Kehamilan',
    type: 'IMAGE',
    content: 'Kenali 6 tanda bahaya pada kehamilan yang mengharuskan Anda segera ke Puskesmas.',
    thumbnail: 'https://images.unsplash.com/photo-1584362946444-1e7c4f94c88e?auto=format&fit=crop&q=80&w=400',
    url: 'https://promkes.kemkes.go.id/tanda-bahaya-pada-kehamilan'
  }
];
