/**
 * Haptic feedback utility for professional "Native" feel.
 * Respects user preferences and device capabilities.
 */

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success') => {
  if (!window.navigator || !window.navigator.vibrate) return;

  switch (type) {
    case 'light':
      window.navigator.vibrate(10);
      break;
    case 'medium':
      window.navigator.vibrate(20);
      break;
    case 'heavy':
      window.navigator.vibrate(50);
      break;
    case 'success':
      window.navigator.vibrate([20, 50, 20]);
      break;
    case 'error':
      window.navigator.vibrate([10, 50, 10, 50]);
      break;
  }
};

/**
 * Professional interactions often use subtle vibration on click
 */
export const hapticClick = () => triggerHaptic('light');
export const hapticSuccess = () => triggerHaptic('success');
export const hapticError = () => triggerHaptic('error');
