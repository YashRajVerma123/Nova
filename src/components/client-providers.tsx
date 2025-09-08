
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Preloader from '@/components/preloader';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import ThoughtOfTheDay from './thought-of-the-day';

export function ClientProviders({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
        <ThoughtOfTheDay />
      </AuthProvider>
    </ThemeProvider>
  );
}
