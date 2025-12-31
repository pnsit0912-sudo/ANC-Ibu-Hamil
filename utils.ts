
import { UserRole } from './types';

/**
 * Logika Klinis Standard 10T Kemenkes
 */
export const getMedicalRecommendation = (month: number) => {
  if (month <= 3) return {
    trimester: 'Trimester I',
    color: 'text-blue-600 bg-blue-50',
    actions: ['Skrining Asam Folat (1x1)', 'Cek Lab Lengkap (Hb, HIV, Sipilis)', 'USG Konfirmasi Kehamilan']
  };
  if (month <= 6) return {
    trimester: 'Trimester II',
    color: 'text-green-600 bg-green-50',
    actions: ['Tablet Fe (90 hari)', 'Monitor DJJ & Gerak Janin', 'Ukur Tinggi Fundus Uteri']
  };
  return {
    trimester: 'Trimester III',
    color: 'text-purple-600 bg-purple-50',
    actions: ['Rencana Persalinan (P4K)', 'Skrining Preeklampsia', 'Konsultasi KB Pasca Salin']
  };
};

/**
 * Format mata uang atau angka jika diperlukan di masa depan
 */
export const formatDate = (date: string) => {
  if (date === '-') return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
