
export enum UserRole {
  ADMIN = 'ADMIN',
  NAKES = 'NAKES',
  USER = 'USER'
}

export interface User {
  id: string;
  username?: string; // ID Login
  password?: string; // Kata Sandi Login
  name: string;
  dob: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  lat?: number;
  lng?: number;
  hpht: string; // Hari Pertama Haid Terakhir (ISO String)
  pregnancyMonth: number; 
  pregnancyNumber: number;
  medicalHistory: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
}

export interface ANCVisit {
  id: string;
  patientId: string;
  visitDate: string;
  scheduledDate: string;
  nextVisitDate: string;
  bloodPressure: string;
  complaints: string;
  edema: boolean;
  fetalMovement: string;
  followUp: string;
  nakesId: string;
  status: 'COMPLETED' | 'MISSED' | 'SCHEDULED';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  ancVisits: ANCVisit[];
  selectedPatientId: string | null;
  logs: SystemLog[];
}

export interface EducationContent {
  id: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'IMAGE';
  content: string;
  thumbnail: string;
  url: string;
}
