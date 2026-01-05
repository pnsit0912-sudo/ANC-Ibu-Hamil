
export const RISK_FACTORS_MASTER: Record<string, {label: string, score: number, category: string, level: 'LOW' | 'HIGH' | 'EXTREME'}> = {
  // Faktor Risiko I (Skor 4)
  'AGE_EXTREME': { label: 'Usia Terlalu Muda <20 / Tua >35 thn', score: 4, category: 'OBSTETRI', level: 'LOW' },
  'PARITY_HIGH': { label: 'Anak Banyak (>= 4)', score: 4, category: 'OBSTETRI', level: 'LOW' },
  'HEIGHT_LOW': { label: 'Tinggi Badan Rendah (<145 cm)', score: 4, category: 'MEDIS', level: 'LOW' },
  'SHORT_PREG': { label: 'Jarak Hamil Terlalu Dekat (<2 thn)', score: 4, category: 'OBSTETRI', level: 'LOW' },
  'ANEMIA': { label: 'Anemia (Hb <11 g/dL)', score: 4, category: 'MEDIS', level: 'LOW' },
  
  // Faktor Risiko II (Skor 8)
  'HISTORY_SC': { label: 'Riwayat Sesar (SC) Sebelumnya', score: 8, category: 'OBSTETRI', level: 'HIGH' },
  'HYPERTENSION': { label: 'Hipertensi (Tekanan Darah Tinggi)', score: 8, category: 'MEDIS', level: 'HIGH' },
  'TWINS': { label: 'Hamil Kembar (Gemelli)', score: 8, category: 'OBSTETRI', level: 'HIGH' },
  'POSITION_BAD': { label: 'Kelainan Letak (Sungsang/Lintang)', score: 8, category: 'OBSTETRI', level: 'HIGH' },
  
  // Faktor Risiko III (Skor 12)
  'HEART_DIS': { label: 'Penyakit Jantung / Gagal Ginjal', score: 12, category: 'MEDIS', level: 'EXTREME' },
  'DIABETES': { label: 'Diabetes Melitus (Gula Darah)', score: 12, category: 'MEDIS', level: 'EXTREME' },
  'PRE_ECLAMPSIA': { label: 'Pre-Eklampsia Berat / Eklampsia', score: 12, category: 'MEDIS', level: 'EXTREME' },
  'HEMORRHAGE': { label: 'Riwayat Perdarahan Hebat', score: 12, category: 'OBSTETRI', level: 'EXTREME' }
};

export const calculatePregnancyProgress = (hphtString: string) => {
  if (!hphtString) return null;
  const hpht = new Date(hphtString);
  const today = new Date();
  const diffTime = today.getTime() - hpht.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (totalDays < 0) return null;
  const weeks = Math.floor(totalDays / 7);
  const months = Math.floor(totalDays / 30.417);
  const hpl = new Date(hpht);
  hpl.setDate(hpl.getDate() + 280); 

  return {
    weeks,
    months,
    totalDays,
    hpl: hpl.toISOString().split('T')[0],
    percentage: Math.min(Math.round((totalDays / 280) * 100), 100)
  };
};

export const getRiskCategory = (score: number, currentAncData?: any) => {
  const baseScore = 2; // Skor awal ibu hamil (KRR)
  const total = score + baseScore;

  // 1. CEK KRITERIA DARURAT (TRIASE HITAM / KRITIS)
  if (currentAncData) {
    const [sys, dia] = (currentAncData.bloodPressure || "0/0").split('/').map(Number);
    const hasEmergencySigns = currentAncData.dangerSigns?.some((s: string) => 
      ['Perdarahan', 'Ketuban Pecah', 'Kejang', 'Nyeri Kepala Hebat', 'Pandangan Kabur', 'Pusing Hebat'].includes(s)
    );
    
    // Syarat Hitam: Hipertensi Berat ATAU Tanda Bahaya Fatal ATAU Gerak Janin Absen
    if (sys >= 160 || dia >= 110 || hasEmergencySigns || currentAncData.fetalMovement === 'Tidak Ada') {
      return { 
        label: 'HITAM', 
        desc: 'KRITIS / GAWAT DARURAT', 
        color: 'text-white bg-slate-950 border-slate-900', 
        hex: '#020617',
        priority: 0
      };
    }
  }

  // 2. CEK SKOR POEDJI ROCHJATI
  // Skor >= 12: Risiko Sangat Tinggi (MERAH)
  if (total >= 12) {
    return { 
      label: 'MERAH', 
      desc: 'Risiko Sangat Tinggi (KRST)', 
      color: 'text-red-700 bg-red-100 border-red-200', 
      hex: '#b91c1c',
      priority: 1
    };
  }
  
  // Skor 6 - 10: Risiko Tinggi (KUNING)
  if (total >= 6) {
    return { 
      label: 'KUNING', 
      desc: 'Risiko Tinggi (KRT)', 
      color: 'text-orange-700 bg-orange-100 border-orange-200', 
      hex: '#c2410c',
      priority: 2
    };
  }
  
  // Skor 2: Risiko Rendah (HIJAU)
  return { 
    label: 'HIJAU', 
    desc: 'Risiko Rendah (KRR)', 
    color: 'text-emerald-700 bg-emerald-100 border-emerald-200', 
    hex: '#047857',
    priority: 3
  };
};
