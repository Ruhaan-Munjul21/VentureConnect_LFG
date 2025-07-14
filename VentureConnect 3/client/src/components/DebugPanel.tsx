import React, { useState } from 'react';

const DebugPanel = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const collectDebugInfo = async () => {
    const info: any = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      info.serviceWorkers = registrations.length;
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      info.caches = cacheNames;
    }

    setDebugInfo(info);
    setShowDebug(true);
  };

  const manualCacheClear = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      localStorage.clear();
      sessionStorage.clear();
      
      alert('✅ Cache cleared! Page will reload.');
      window.location.reload();
    } catch (error) {
      alert('❌ Error clearing cache: ' + error);
    }
  };

  // Only show with ?debug=true
  const shouldShow = window.location.search.includes('debug=true');
  if (!shouldShow) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 9999,
      border: '2px solid #ff6b35'
    }}>
      <button onClick={collectDebugInfo} style={{ marginRight: '5px' }}>
        🔍 Debug
      </button>
      <button onClick={manualCacheClear} style={{ background: '#ff6b35' }}>
        🧹 Clear Cache
      </button>
      
      {showDebug && (
        <div style={{ marginTop: '10px', background: '#2a2a2a', padding: '10px' }}>
          <pre style={{ fontSize: '10px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <button onClick={() => setShowDebug(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;