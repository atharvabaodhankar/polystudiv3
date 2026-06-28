import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Applies Lenis smooth scroll to the window/body.
// Automatically skips the dashboard page which has its own internal scroll container.
const useLenis = () => {
  const location = useLocation();

  useEffect(() => {
    // Dashboard uses internal flex overflow-y-auto — skip Lenis there
    if (location.pathname === '/dashboard') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);
};

export default useLenis;
