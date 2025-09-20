
'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

// This function checks sessionStorage to see if the splash screen has been shown.
const hasBeenShown = () => {
  // This will only be called on the client side
  return sessionStorage.getItem('splashShown') === 'true';
};

const setShown = () => {
  sessionStorage.setItem('splashShown', 'true');
};

const SplashLoaderInternal = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out after a delay
    const timer = setTimeout(() => {
      setVisible(false);
      setShown();
    }, 1200); // Total time splash is visible

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ease-out',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="animate-fade-in">
        <Logo />
      </div>
    </div>
  );
};


const SplashLoader = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (!hasBeenShown()) {
      setIsFirstVisit(true);
    }
  }, []);

  // Only render the internal splash loader component if it's the first visit
  return isFirstVisit ? <SplashLoaderInternal /> : null;
}

export default SplashLoader;
