import React from 'react';

const DebugInfo = () => {
  const debugInfo = {
    hostname: window.location.hostname,
    origin: window.location.origin,
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo; 