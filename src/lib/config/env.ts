import { logger } from '../logger/logger';

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function validateEnv(): EnvConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const missingVars: string[] = [];
  if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
    missingVars.push('VITE_SUPABASE_URL');
  }
  if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    const errorMsg = `Konfigurasi environment tidak lengkap: Variabel [${missingVars.join(', ')}] belum diisi di file .env`;
    logger.error('Validasi environment gagal: variabel wajib belum terisi', { missingVars });
    // Throw error agar runtime fail-fast dengan pesan informatif
    throw new Error(errorMsg);
  }

  return {
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: supabaseAnonKey.trim(),
  };
}

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
