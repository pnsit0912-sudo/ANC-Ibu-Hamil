
export enum UserRole {
  ADMIN = 'ADMIN',
  NAKES = 'NAKES',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  dob: string;
  address: string;
  lat?: number;
  lng?: number;
  pregnancyMonth: number;
  medicalHistory: string;
  role: UserRole;
  phone: string;
}

export interface ANCVisit {
  id: string;
  patientId: string;
  visitDate: string;
  scheduledDate: string;
  bloodPressure: string;
  complaints: string;
  edema: boolean;
  fetalMovement: string;
  followUp: string;
  nakesId: string;
  status: 'COMPLETED' | 'MISSED' | 'SCHEDULED';
}

export interface EducationContent {
  id: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'IMAGE';
  content: string;
  thumbnail: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  ancVisits: ANCVisit[];
  selectedPatientId: string | null;
}
