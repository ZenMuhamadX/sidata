import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import type { AuthContextType } from '../types/auth.types';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
