
'use client';

import { useState, useEffect } from 'react';

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
      <div className="absolute top-0 left-0 h-64 w-64 bg-purple-500/50 rounded-full filter blur-3xl opacity-50 animate-move-circle-1"></div>
      <div className="absolute bottom-0 right-0 h-64 w-64 bg-blue-500/50 rounded-full filter blur-3xl opacity-50 animate-move-circle-2"></div>
      <div className="absolute bottom-1/2 left-1/2 h-56 w-56 bg-red-500/50 rounded-full filter blur-2xl opacity-50 animate-move-circle-3"></div>
    </div>
  );
};

export default BackgroundAnimation;
