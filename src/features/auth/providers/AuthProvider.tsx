import React, { createContext, useEffect, useState, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { logger } from '../../../lib/logger/logger';
import type { AuthContextType, LoginCredentials } from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const initialSession = await authService.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (err) {
        logger.error('Error saat inisialisasi session auth', { err });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: authSubscription } = authService.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      logger.debug('Auth state event diterima di provider', { event });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setSession(data.session);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: !!session && !!user,
      login,
      logout,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
