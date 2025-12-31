
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

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'dashboard' },
  { name: 'Data Pasien', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'patients' },
  { name: 'Manajemen Akses', icon: <ShieldCheck size={20} />, roles: [UserRole.ADMIN], path: 'management' }, // Diubah: Hanya Admin
  { name: 'Pendaftaran ANC', icon: <UserPlus size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'register' },
  { name: 'Monitoring Resiko', icon: <MapPin size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'monitoring' },
  { name: 'Pemetaan Lokasi', icon: <MapIcon size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES], path: 'map' },
  { name: 'Edukasi Ibu', icon: <BookOpen size={20} />, roles: [UserRole.ADMIN, UserRole.NAKES, UserRole.USER], path: 'education' },
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
    phone: '08571234567',
    isActive: true
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
    phone: '0812000000',
    isActive: true
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
    phone: '0813111111',
    isActive: true
  }
];

export const EDUCATION_LIST: EducationContent[] = [
  {
    id: 'e1',
    title: 'Gizi Seimbang Ibu Hamil',
    type: 'TEXT',
    content: 'Pentingnya asupan protein, zat besi, dan asam folat selama masa kehamilan untuk perkembangan janin yang optimal.',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    url: 'https://kesmas.kemkes.go.id/'
  },
  {
    id: 'e2',
    title: 'Senam Hamil Trimester III',
    type: 'VIDEO',
    content: 'Panduan gerakan ringan untuk melancarkan proses persalinan dan mengurangi nyeri punggung.',
    thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.youtube.com/results?search_query=senam+hamil'
  },
  {
    id: 'e3',
    title: 'Tanda Bahaya Kehamilan',
    type: 'IMAGE',
    content: 'Kenali tanda-tanda bahaya seperti perdarahan, bengkak pada wajah, dan janin kurang aktif.',
    thumbnail: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80',
    url: 'https://ayosehat.kemkes.go.id/'
  }
];
