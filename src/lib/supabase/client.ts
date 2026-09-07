import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';
import { logger } from '../logger/logger';
import type { Database } from '../../types/database';

// Lazy-initialized singleton agar konfigurasi divalidasi saat aplikasi aktif
let supabaseInstance: SupabaseClient<Database, 'assyifa'> | null = null;

export function getSupabaseClient(): SupabaseClient<Database, 'assyifa'> {
  if (!supabaseInstance) {
    const env = getEnv();
    logger.info('Menginisialisasi Supabase Client dengan schema assyifa');

    supabaseInstance = createClient<Database, 'assyifa'>(env.supabaseUrl, env.supabaseAnonKey, {
      db: {
        schema: 'assyifa',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

// Proxy export untuk kemudahan pemanggilan supabase.* di service layer
export const supabase = new Proxy({} as SupabaseClient<Database, 'assyifa'>, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
