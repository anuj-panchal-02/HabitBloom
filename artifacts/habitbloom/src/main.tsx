import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register the service worker so the app installs as a PWA and works offline.
// Skipped in dev so Vite's HMR isn't shadowed by cached assets.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL }).catch(() => {
      // Offline support is a progressive enhancement; ignore registration failures.
    });
  });
}
