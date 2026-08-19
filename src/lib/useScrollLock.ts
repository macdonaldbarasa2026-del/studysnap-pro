import { useEffect } from 'react';

/**
 * Locks body scroll while active === true and restores original values when inactive/unmounted.
 * It also leaves a padding-right compensation to avoid layout shift on desktops with scrollbars.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (active) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [active]);
}
