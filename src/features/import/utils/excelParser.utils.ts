import type { Agama, JenisKelamin } from '../../../types/database';

export const VALID_AGAMA: Agama[] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

/**
 * Deteksi kelas 1-6 dari nama sheet
 * "Kelas 1", "Kelas 1A", "KLS 2", "1", "1A"
 */
export function detectClassFromSheetName(sheetName: string): { detected: number | null; isAmbiguous: boolean } {
  const normalized = sheetName.trim().toLowerCase();

  // Pola "kelas 1", "kelas 2", "kls 3"
  const matchExplicit = normalized.match(/(?:kelas|kls)\s*([1-6])/i);
  if (matchExplicit) {
    const classNum = parseInt(matchExplicit[1], 10);
    return { detected: classNum, isAmbiguous: false };
  }

  // Pola jika hanya angka 1-6 atau "1A", "2B"
  const matchSimple = normalized.match(/^([1-6])([a-z])?$/i);
  if (matchSimple) {
    const classNum = parseInt(matchSimple[1], 10);
    return { detected: classNum, isAmbiguous: false };
  }

  // Pola jika mengandung angka 1-6 di awal atau akhir kata
  const matchAny = normalized.match(/\b([1-6])\b/);
  if (matchAny) {
    const classNum = parseInt(matchAny[1], 10);
    return { detected: classNum, isAmbiguous: true };
  }

  // "Sheet1", "Data Baru", dll tidak bisa ditebak
  return { detected: null, isAmbiguous: true };
}

/**
 * Parsing dan normalisasi tanggal dari Excel
 * Mendukung:
 * - Date object native
 * - Excel serial number (misal 43789)
 * - String format: DD-MMM-YY, DD-MMM-YYYY, DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 * Output: YYYY-MM-DD
 */
export function normalizeExcelDate(value: unknown): string | null {
  if (!value) return null;

  // 1. Jika sudah Date instance
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDateToYYYYMMDD(value);
  }

  // 2. Jika integer/float (Excel serial date)
  if (typeof value === 'number') {
    // Excel base date adalah 1899-12-30 (karena bug leap year 1900 di Lotus 1-2-3 / Excel)
    // 25569 adalah offset hari antara 1899-12-30 dan 1970-01-01
    const msPerDay = 86400 * 1000;
    const date = new Date((value - 25569) * msPerDay);
    if (!isNaN(date.getTime())) {
      return formatDateToYYYYMMDD(date);
    }
  }

  const str = String(value).trim();
  if (!str || str === '-') return null;

  // 3. Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return str;
  }

  // 4. Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 5. Format DD-MMM-YY atau DD-MMM-YYYY (contoh: 20-Nov-19, 20-Nov-2019)
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
    jun: '06', jul: '07', agu: '08', aug: '08', sep: '09', okt: '10', oct: '10',
    nop: '11', nov: '11', des: '12', dec: '12'
  };

  const textMonthMatch = str.match(/^(\d{1,2})[-/ ]([a-zA-Z]{3,})[-/ ](\d{2,4})$/);
  if (textMonthMatch) {
    const day = textMonthMatch[1].padStart(2, '0');
    const monthKey = textMonthMatch[2].toLowerCase().substring(0, 3);
    const month = monthMap[monthKey];
    let year = textMonthMatch[3];
    if (year.length === 2) {
      const yrNum = parseInt(year, 10);
      // Pivot year (asumsi jika <= 30 maka 2000-an, jika > 30 maka 1900-an)
      year = yrNum <= 40 ? `20${year}` : `19${year}`;
    }
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  // 6. Coba fallback Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return formatDateToYYYYMMDD(parsed);
  }

  return null;
}

function formatDateToYYYYMMDD(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Preserve string value exactly, trim whitespace, and preserve leading zeroes.
 */
export function sanitizeString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Sanitize NIK: harus string 16 digit angka
 */
export function sanitizeNik(val: unknown): string {
  if (!val) return '';
  // Jika terbaca scientific notation atau float, hilangkan desimal
  const str = String(val).trim();
  if (str === '-') return '';
  return str.replace(/\D/g, '');
}

/**
 * Normalisasi JK ke 'L' atau 'P'
 */
export function normalizeJK(val: unknown): JenisKelamin | null {
  if (!val) return null;
  const str = String(val).trim().toUpperCase();
  if (str === 'L' || str.startsWith('LAKI')) return 'L';
  if (str === 'P' || str.startsWith('PEREMPUAN') || str.startsWith('WANITA')) return 'P';
  return null;
}

/**
 * Normalisasi Agama ke enum Agama
 */
export function normalizeAgama(val: unknown): Agama | null {
  if (!val) return null;
  const str = String(val).trim().toLowerCase();
  for (const ag of VALID_AGAMA) {
    if (str.includes(ag.toLowerCase())) {
      return ag;
    }
  }
  return null;
}
