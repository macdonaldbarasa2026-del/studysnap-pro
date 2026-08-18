import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Capture the browser's install prompt as early as possible. Chromium can fire
// beforeinstallprompt before React effects are attached, so the app must not
// rely on a component mounting quickly enough to catch it.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  (window as any).__studysnapDeferredInstallPrompt = event;
  window.dispatchEvent(new Event('studysnap-install-available'));
}, { once: true });

window.addEventListener('appinstalled', () => {
  (window as any).__studysnapDeferredInstallPrompt = null;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered successfully:', reg.scope);
        // Check for updates periodically
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available ready for activation.');
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration skipped or failed:', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // In development, also register service worker for offline testing
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[PWA Dev] SW registered:', reg.scope))
      .catch((err) => console.warn('[PWA Dev] SW registration warning:', err));
  });
}
