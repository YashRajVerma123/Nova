
'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showLogo, setShowLogo] = useState(false); // New state for logo animation

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('splashShown') === 'true';

    if (hasBeenShown) {
      setIsLoading(false);
      return;
    }

    sessionStorage.setItem('splashShown', 'true');

    // Show logo after a short delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 200); 

    // Start fade out after a longer delay
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // Hide the component completely after the fade-out animation finishes
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1700); 

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background',
        'transition-opacity duration-500',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className={cn(
        'transition-all duration-700 ease-out',
        showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      )}>
        <Logo />
      </div>
    </div>
  );
};

export default SplashScreen;
