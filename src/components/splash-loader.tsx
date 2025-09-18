'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

// This function checks sessionStorage to see if the splash screen has been shown.
const hasBeenShown = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem('splashShown') === 'true';
};

const setShown = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('splashShown', 'true');
  }
};

const SplashLoader = () => {
  const [loading, setLoading] = useState(hasBeenShown() ? false : true);

  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      setLoading(false);
      setShown();
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, [loading]);
  
  if (!loading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-1000',
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className={cn('transition-transform duration-1000', loading ? 'scale-100' : 'scale-125')}>
        <div className="animate-fade-in-slow">
            <Logo />
        </div>
      </div>
    </div>
  );
};

export default SplashLoader;
