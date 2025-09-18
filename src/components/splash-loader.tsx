
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
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (!loading) return;

    const logoTimer = setTimeout(() => {
        setShowLogo(true);
    }, 300);

    const mainTimer = setTimeout(() => {
      setLoading(false);
      setShown();
    }, 2000); // Total splash screen duration

    return () => {
        clearTimeout(logoTimer);
        clearTimeout(mainTimer);
    };
  }, [loading]);
  
  if (!loading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background',
        !loading && 'opacity-0 pointer-events-none'
      )}
    >
      <div className={cn('transition-opacity duration-1000', showLogo ? 'opacity-100 animate-fade-in-slow' : 'opacity-0')}>
        <Logo />
      </div>
    </div>
  );
};

export default SplashLoader;
