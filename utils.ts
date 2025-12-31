
import { UserRole } from './types';

/**
 * Menghitung progres kehamilan secara mendetail
 * Berdasarkan standar medis OBGYN
 */
export const calculatePregnancyProgress = (hphtString: string) => {
  if (!hphtString) return null;
  
  const hpht = new Date(hphtString);
  const today = new Date();
  
  // Perbedaan dalam milidetik
  const diffTime = today.getTime() - hpht.getTime();
  
  // Konversi ke hari
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) return null;

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  
  // Perhitungan bulan (rata-rata 28 hari per bulan medis atau 30.4 hari kalender)
  const months = Math.floor(totalDays / 30.417);

  // Perkiraan Lahir (HPL) - Rumus Naegele (HPHT + 7 hari - 3 bulan + 1 tahun)
  const hpl = new Date(hpht);
  hpl.setDate(hpl.getDate() + 7);
  hpl.setMonth(hpl.getMonth() + 9); // Sama dengan -3 bulan + 1 tahun

  return {
    weeks,
    days,
    months,
    totalDays,
    hpl: hpl.toISOString().split('T')[0],
    percentage: Math.min(Math.round((totalDays / 280) * 100), 100) // 280 hari = 40 minggu
  };
};

export const getMedicalRecommendation = (weeks: number) => {
  // Mapping minggu ke bulan untuk rekomendasi lama jika perlu, 
  // tapi lebih baik pakai minggu sekarang
  if (weeks <= 12) return {
    trimester: 'Trimester I (Minggu 1-12)',
    color: 'text-blue-600 bg-blue-50',
    description: 'Fokus pada pembentukan organ janin dan pencegahan kecacatan.',
    actions: [
      'Konsumsi Asam Folat 400mcg/hari',
      'Skrining Lab Awal (Hb, HIV, Sifilis)',
      'USG Konfirmasi Kehamilan',
      'Atasi mual muntah'
    ],
    dangerSigns: ['Perdarahan pervaginam', 'Mual muntah berlebihan', 'Nyeri perut hebat']
  };
  if (weeks <= 27) return {
    trimester: 'Trimester II (Minggu 13-27)',
    color: 'text-green-600 bg-green-50',
    description: 'Fokus pada pertumbuhan janin dan pemantauan tekanan darah.',
    actions: [
      'Konsumsi Tablet Tambah Darah (Fe)',
      'Imunisasi TT',
      'Cek Gerakan Janin Pertama',
      'Pemantauan Tekanan Darah'
    ],
    dangerSigns: ['Sakit kepala hebat', 'Pandangan kabur', 'Bengkak wajah/tangan']
  };
  return {
    trimester: 'Trimester III (Minggu 28-40)',
    color: 'text-purple-600 bg-purple-50',
    description: 'Persiapan persalinan dan pemantauan kesejahteraan janin.',
    actions: [
      'Hitung gerakan janin (Kick Count)',
      'Siapkan Tabulin (Tabungan Bersalin)',
      'Tentukan Tempat Persalinan (P4K)',
      'Konsultasi KB Pasca Salin'
    ],
    dangerSigns: ['Ketuban pecah dini', 'Gerakan janin berkurang', 'Perdarahan jalan lahir']
  };
};

export const formatDate = (date: string) => {
  if (!date || date === '-') return '-';
  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return date;
  }
};
