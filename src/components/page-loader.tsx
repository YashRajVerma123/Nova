
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the path changes, we can assume the loading is complete.
    // The key here is that this useEffect hook runs *after* the new page component has mounted.
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // This effect is for handling link clicks to show the loader immediately.
    const handleLinkClick = (e: MouseEvent) => {
      // Check if the click is on a Next.js Link component (an `<a>` tag)
      // and not an external link or a link to an anchor on the same page.
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && 
          anchor.target !== '_blank' && 
          new URL(anchor.href).origin === window.location.origin) {
        
        // Prevent showing loader for same-page navigation
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = new URL(anchor.href).pathname + new URL(anchor.href).search;

        if (currentPath !== targetPath) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-150',
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
