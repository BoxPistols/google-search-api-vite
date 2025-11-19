/**
 * Mobile utility functions
 */

// Type declarations for browser APIs
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Prevents body scroll (useful for modals on mobile)
 */
export function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

/**
 * Enables body scroll
 */
export function enableBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

/**
 * Get safe area insets for iOS devices with notch
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Check if app is running in standalone mode (PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorStandalone).standalone === true
  );
}

/**
 * Vibrate device (if supported)
 */
export function vibrate(pattern: number | number[]): boolean {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
}

/**
 * Get device pixel ratio
 */
export function getPixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device is in landscape mode
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

/**
 * Check if device is in portrait mode
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Get network information (if supported)
 */
export function getNetworkInfo(): NetworkInformation | null {
  const nav = navigator as NavigatorConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // ms
    saveData: connection.saveData, // boolean
  };
}

/**
 * Check if device is on slow network
 */
export function isSlowNetwork(): boolean {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return false;

  return (
    networkInfo.saveData ||
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g'
  );
}

/**
 * Optimize images for mobile
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const { width, quality = 80, format = 'webp' } = options;

  // This is a placeholder - implement based on your image optimization service
  // Examples: Cloudinary, imgix, etc.
  const params = new URLSearchParams();

  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());
  params.append('f', format);

  return `${url}?${params.toString()}`;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get touch-friendly tap area size (minimum 44x44px for iOS)
 */
export function getTapAreaSize(): number {
  return isIOS() ? 44 : 48; // iOS: 44px, Material: 48px
}

/**
 * Handle pull-to-refresh prevention
 */
export function preventPullToRefresh(element: HTMLElement) {
  let startY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].pageY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const y = e.touches[0].pageY;
    const scrollTop = element.scrollTop;

    // Prevent pull-to-refresh when at top of scroll
    if (scrollTop === 0 && y > startY) {
      e.preventDefault();
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
  };
}

/**
 * Share content using native share API
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled
      return false;
    }
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Copy to clipboard (mobile-friendly)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Request notification permission (mobile-friendly)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Show notification (mobile-friendly)
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, {
    icon: '/vite.svg',
    badge: '/vite.svg',
    ...options,
  });
}
