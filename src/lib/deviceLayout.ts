export type DeviceLayout = 'phone' | 'tablet' | 'desktop';
export type Platform = 'android' | 'ios' | 'ipados' | 'windows' | 'macos' | 'linux' | 'web';

export function getDeviceLayout(width = typeof window !== 'undefined' ? window.innerWidth : 1280): DeviceLayout {
  if (width < 768) return 'phone';
  if (width < 1200) return 'tablet';
  return 'desktop';
}

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  if (/ipad|macintosh/.test(ua) && ('ontouchend' in document || navigator.maxTouchPoints > 1)) return 'ipados';
  if (/iphone|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows/.test(ua) || /win/.test(platform)) return 'windows';
  if (/mac os x|macintosh/.test(ua) || /mac/.test(platform)) return 'macos';
  if (/linux/.test(ua) || /linux/.test(platform)) return 'linux';
  return 'web';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}
