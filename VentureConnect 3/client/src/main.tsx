import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// AGGRESSIVE cache cleanup for all users
const forceCleanAllCache = async () => {
  try {
    console.log('🧹 Starting aggressive cache cleanup...');
    
    // 1. Unregister ALL service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service workers`);
      await Promise.all(registrations.map(async (reg) => {
        console.log('Unregistering SW:', reg.scope);
        await reg.unregister();
      }));
    }

    // 2. Clear ALL caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      await Promise.all(cacheNames.map(async (name) => {
        console.log('Deleting cache:', name);
        await caches.delete(name);
      }));
    }

    // 3. Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. Clear any potential IndexedDB
    if ('indexedDB' in window) {
      try {
        indexedDB.deleteDatabase('workbox-expiration');
        indexedDB.deleteDatabase('workbox-precaching');
      } catch (e) {
        console.log('IndexedDB clear attempt:', e);
      }
    }

    console.log('✅ Aggressive cache cleanup complete');
  } catch (error) {
    console.log('Cache cleanup error:', error);
  }
};

// Run aggressive cleanup on EVERY app start for now
forceCleanAllCache();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 