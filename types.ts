
export enum UserRole {
  ADMIN = 'ADMIN',
  NAKES = 'NAKES',
  USER = 'USER'
}

export type RiskFactor = {
  id: string;
  label: string;
  score: number;
  category: 'MEDIS' | 'OBSTETRI' | 'SOSIAL';
};

export interface User {
  id: string;
  username?: string;
  password?: string;
  name: string;
  dob: string;
  address: string;
  kecamatan: string;
  kelurahan: string;
  lat?: number;
  lng?: number;
  hpht: string;
  pregnancyMonth: number; 
  pregnancyNumber: number;
  medicalHistory: string; // Deskripsi singkat
  selectedRiskFactors: string[]; // ID dari faktor resiko
  totalRiskScore: number;
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
  weight: number; // kg
  bloodPressure: string;
  tfu: number; // cm
  djj: number; // bpm
  hb: number; // g/dL
  complaints: string;
  dangerSigns: string[]; // Checkbox tanda bahaya
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

/**
 * Added missing EducationContent interface to fix import error in constants.tsx
 */
export interface EducationContent {
  id: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'IMAGE';
  content: string;
  thumbnail: string;
  url: string;
}
