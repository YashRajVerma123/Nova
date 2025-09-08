
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import ThoughtOfTheDay from './thought-of-the-day';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    // On route change, the loader is not needed because navigation is instant.
    // However, if we want to show a loader, we would need a more complex state management
    // that tracks navigation start and end. For now, we'll keep it simple and fast.
    setLoading(false);
  }, [pathname, searchParams]);

  // This component will only show a loader if we explicitly trigger it.
  // We'll manage loading state on navigation events inside ClientProviders.
  return (
    <div className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {/* The PageLoader component will be controlled by navigation events */}
        <PageLoader />
        {children}
        <ThoughtOfTheDay />
      </AuthProvider>
    </ThemeProvider>
  );
}
