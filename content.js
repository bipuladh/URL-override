/**
 * OpenShift QE Extension
 * Intercepts POST requests to /registry-checks and renames
 * ImageRegistryURL → registryURL in the request body.
 */

(function() {
  'use strict';

  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const options = typeof args[0] === 'string' ? (args[1] || {}) : args[0] || {};

    // Intercept POST requests to /registry-checks
    // Rename ImageRegistryURL → registryURL in the request body
    if (url.includes('/registry-checks')) {
      try {
        const body = JSON.parse(options.body);
        if ('imageRegistryUrl' in body) {
          console.log('[Registry Checks Override] ✓ Intercepted POST to /registry-checks');
          console.log('[Registry Checks Override] Renaming ImageRegistryURL → registryURL');
          body.registryURL = body.imageRegistryUrl;
          delete body.imageRegistryUrl;
          const newOptions = { ...options, body: JSON.stringify(body) };
          if (typeof args[0] === 'string') {
            return originalFetch.apply(this, [args[0], newOptions]);
          } else {
            return originalFetch.apply(this, [new Request(url, newOptions)]);
          }
        }
      } catch (e) {
        console.warn('[Registry Checks Override] Failed to parse request body:', e);
      }
    }

    return originalFetch.apply(this, args);
  };

  console.log('[Registry Checks Override] Extension loaded and watching for POST requests to /registry-checks');
})();
