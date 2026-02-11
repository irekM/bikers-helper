'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, logoutUser } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Funkcja do odświeżenia stanu użytkownika z localStorage
  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    // Przy załadowaniu sprawdź czy użytkownik jest zalogowany
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
