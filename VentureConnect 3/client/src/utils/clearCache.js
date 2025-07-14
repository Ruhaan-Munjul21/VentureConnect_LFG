// Utility to clear browser cache and service workers
export const clearBrowserCache = () => {
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear browser cache (this will prompt user)
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  console.log('Browser cache and service workers cleared');
};

// Function to force reload without cache
export const forceReload = () => {
  window.location.reload(true);
};

// Function to check if we're in production
export const isProduction = () => {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
}; 