
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
      <div className="absolute top-0 left-0 h-96 w-96 bg-purple-500/50 rounded-full filter blur-[100px] opacity-30 animate-move-circle-1"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-blue-500/50 rounded-full filter blur-[100px] opacity-30 animate-move-circle-2"></div>
      <div className="absolute bottom-1/2 left-1/2 h-96 w-96 bg-red-500/50 rounded-full filter blur-[80px] opacity-30 animate-move-circle-3"></div>
    </div>
  );
};

export default BackgroundAnimation;
