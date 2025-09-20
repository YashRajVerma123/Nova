'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('splashShown') === 'true';

    if (hasBeenShown) {
      setIsLoading(false);
      return;
    }

    sessionStorage.setItem('splashShown', 'true');

    // Timer to start showing the logo
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 200); // Short delay before logo starts fading in

    // Timer to start fading out the entire splash screen
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // Timer to remove the component from the DOM
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1700); // Should be fadeOut duration (500ms) + fadeOutTimer (1200ms)

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
        'transition-opacity duration-500 ease-out',
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
