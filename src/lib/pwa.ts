// Register the service worker so the app keeps working offline at the table.
// Only in production builds: in dev, a service worker fights Vite's HMR and
// caches stale modules, so we deliberately skip (and unregister) it there.
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is a progressive enhancement — never block the app on it.
      });
    });
  } else {
    // Clean up any SW left behind by a previous production build served locally.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
}
