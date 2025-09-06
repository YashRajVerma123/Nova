"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Author } from '@/lib/data';
import { authors } from '@/lib/data';

interface AuthContextType {
  user: Author | null;
  isAdmin: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, Author> = {
  'yashrajverma916@gmail.com': authors['yash-raj'],
  'jane.doe@example.com': authors['jane-doe'],
  'john.smith@example.com': authors['john-smith'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('nova-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback((email: string) => {
    const foundUser = MOCK_USERS[email];
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('nova-user', JSON.stringify(foundUser));
    } else {
      // For demo, create a new user if not in MOCK_USERS
      const newUser = { id: 'new-user', name: 'New User', avatar: 'https://i.pravatar.cc/150', email };
      setUser(newUser);
      localStorage.setItem('nova-user', JSON.stringify(newUser));
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('nova-user');
  }, []);

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, isAdmin, signIn, signOut, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
