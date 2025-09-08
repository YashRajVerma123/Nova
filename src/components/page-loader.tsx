
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // We use a timeout to avoid a flash of the loader on fast page transitions.
    let timer: NodeJS.Timeout;

    const startProgress = () => {
      timer = setTimeout(handleStart, 200);
    };

    const stopProgress = () => {
      clearTimeout(timer);
      handleStop();
    };

    // Initial load stop
    stopProgress();
    
    // Subsequent navigations
    startProgress();

    return () => {
      stopProgress();
    };
  }, [pathname, searchParams]);

  return null;
}
