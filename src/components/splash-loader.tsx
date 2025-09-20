'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashLoader = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This effect runs only on the client
    if (sessionStorage.getItem('splashShown') !== 'true') {
      setIsFirstVisit(true);
      setIsVisible(true);
      sessionStorage.setItem('splashShown', 'true');

      // Set a timer to start the fade-out animation
      const fadeOutTimer = setTimeout(() => {
        setIsExiting(true);
      }, 1200); // Time the logo is visible before fade-out starts

      // Set a timer to remove the component from the DOM after animation
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 1700); // This should be fadeOutTimer delay + animation duration (500ms)
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!isFirstVisit || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ease-out',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="animate-fade-in">
        <Logo />
      </div>
    </div>
  );
};

export default SplashLoader;
