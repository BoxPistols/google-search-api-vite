import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Breakpoint } from '@mui/material/styles';

/**
 * Custom hook for responsive design
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useResponsive();
 *
 * if (isMobile) {
 *   return <MobileView />;
 * }
 */
export function useResponsive() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isXLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isXLargeDesktop,
    isSmallScreen: isMobile || isTablet,
  };
}

/**
 * Hook to check if screen is at or above a specific breakpoint
 *
 * @example
 * const isLarge = useBreakpoint('lg');
 */
export function useBreakpoint(breakpoint: Breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

/**
 * Hook to get current screen orientation
 *
 * @example
 * const { isPortrait, isLandscape } = useOrientation();
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}

/**
 * Hook to detect touch device
 *
 * @example
 * const isTouchDevice = useTouchDevice();
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    interface NavigatorWithMSTouch extends Navigator {
      msMaxTouchPoints?: number;
    }

    const nav = navigator as NavigatorWithMSTouch;

    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || (nav.msMaxTouchPoints ?? 0) > 0
    );
  }, []);

  return isTouch;
}

/**
 * Hook to get viewport dimensions
 *
 * @example
 * const { width, height } = useViewport();
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
