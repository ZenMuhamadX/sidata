import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/logger/logger';
import { handleAuthError } from '../../../lib/utils/error';
import type { LoginCredentials } from '../types/auth.types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const authService = {
  async login({ email, password }: LoginCredentials) {
    logger.info('Mencoba login admin', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      logger.info('Login admin berhasil', { userId: data.user?.id });
      return data;
    } catch (err) {
      const appError = handleAuthError(err);
      throw appError;
    }
  },

  async logout() {
    logger.info('Mencoba proses logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      logger.info('Proses logout berhasil');
    } catch (err) {
      const appError = handleAuthError(err);
      throw appError;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (err) {
      logger.warn('Gagal mengambil sesi aktif saat inisialisasi');
      return null;
    }
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      logger.info('Status autentikasi berubah', { event });
      callback(event, session);
    });
  },
};
