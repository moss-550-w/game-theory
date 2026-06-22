import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

const BREAKPOINTS = { mobile: 768, tablet: 1024, desktop: 1440 } as const;

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => getBreakpoint());

  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
}

function getBreakpoint(): Breakpoint {
  const w = window.innerWidth;
  if (w >= BREAKPOINTS.desktop) return 'wide';
  if (w >= BREAKPOINTS.tablet) return 'desktop';
  if (w >= BREAKPOINTS.mobile) return 'tablet';
  return 'mobile';
}
