
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const BackgroundAnimation = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div id="stars-sm"></div>
      <div id="stars-md"></div>
      <div id="stars-lg"></div>
    </div>
  );
};

export default BackgroundAnimation;
