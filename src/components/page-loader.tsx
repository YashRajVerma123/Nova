
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hide loader on initial load
    setLoading(false); 
    
    // On subsequent navigations, show loader
    setLoading(true);

    // Hide loader after a delay to simulate loading time and then fade out
    const timer = setTimeout(() => {
        setLoading(false)
    }, 1000); // Adjust time as needed

    return () => {
        clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <div className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500",
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
