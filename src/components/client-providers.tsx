
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import ThoughtOfTheDay from './thought-of-the-day';

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
        <ThoughtOfTheDay />
      </AuthProvider>
    </ThemeProvider>
  );
}
