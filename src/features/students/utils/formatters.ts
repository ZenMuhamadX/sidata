const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format tanggal ISO (YYYY-MM-DD) menjadi format bahasa Indonesia
 * Contoh: "2020-08-17" -> "17 Agustus 2020"
 */
export function formatIndonesianDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month < 12) {
        return `${day} ${MONTH_NAMES_ID[month]} ${year}`;
      }
    }

    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = MONTH_NAMES_ID[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  } catch {
    // Fallback jika parsing gagal
  }

  return dateString;
}
