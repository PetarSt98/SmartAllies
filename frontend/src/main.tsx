import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Error boundary for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Register PWA service worker with error handling
try {
  if ('serviceWorker' in navigator) {
    import('virtual:pwa-register').then(({ registerSW }) => {
      const updateSW = registerSW({
        onNeedRefresh() {
          if (confirm('New content available. Reload?')) {
            updateSW(true);
          }
        },
        onOfflineReady() {
          console.log('App ready to work offline');
        },
      });
    }).catch(err => {
      console.warn('PWA registration failed:', err);
    });
  }
} catch (error) {
  console.warn('Service worker not supported:', error);
}

// Request notification permission for push notifications
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().catch(err => {
    console.warn('Notification permission failed:', err);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
