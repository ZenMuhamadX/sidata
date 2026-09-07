import { AuthError } from '@supabase/supabase-js';
import { logger } from '../logger/logger';

export interface AppError {
  message: string;
  code?: string;
  originalError?: unknown;
}

export function handleAuthError(error: unknown): AppError {
  let userMessage = 'Terjadi kesalahan pada sistem autentikasi. Silakan coba lagi.';
  let errorCode: string | undefined;

  if (error instanceof AuthError) {
    errorCode = error.code || error.name;
    // Terjemahkan atau rapikan pesan error Supabase yang umum
    switch (error.message.toLowerCase()) {
      case 'invalid login credentials':
        userMessage = 'Email atau password yang Anda masukkan salah.';
        break;
      case 'email not confirmed':
        userMessage = 'Email Anda belum dikonfirmasi. Hubungi administrator.';
        break;
      case 'user not found':
        userMessage = 'Akun dengan email tersebut tidak ditemukan.';
        break;
      case 'invalid email':
        userMessage = 'Format email tidak valid.';
        break;
      default:
        userMessage = error.message;
        break;
    }
  } else if (error instanceof Error) {
    userMessage = error.message;
  }

  logger.error('Auth error terjadi', {
    code: errorCode,
    message: userMessage,
  });

  return {
    message: userMessage,
    code: errorCode,
    originalError: import.meta.env.DEV ? error : undefined,
  };
}
