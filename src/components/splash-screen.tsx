
'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, where sessionStorage is available.
    const hasBeenShown = sessionStorage.getItem('splashShown') === 'true';

    if (hasBeenShown) {
      setIsLoading(false);
      return;
    }

    // It's the first visit this session.
    sessionStorage.setItem('splashShown', 'true');

    // Start fade out after a delay
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // Hide the component completely after the fade-out animation finishes
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1700); // This must be longer than the fade-out animation duration (500ms)

    return () => {
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
        'animate-fade-in', // Initial fade-in
        isFadingOut && 'animate-fade-out' // Conditional fade-out
      )}
    >
      <div className="animate-fade-in-up">
        <Logo />
      </div>
    </div>
  );
};

export default SplashScreen;
