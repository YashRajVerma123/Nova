
'use client';

import { useState, useEffect } from 'react';

const Animation = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full filter blur-3xl opacity-20 animate-move-circle-1"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-move-circle-2"></div>
    <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-move-circle-3"></div>
  </div>
);

const BackgroundAnimation = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Animation />;
}

export default BackgroundAnimation;
