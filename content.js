/**
 * OpenShift ImageRegistry Error Injector
 * Intercepts fetch responses for imageregistry.operator.openshift.io/configs/cluster
 * and returns an error response instead of the real data.
 */

(function() {
  'use strict';

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override window.fetch
  window.fetch = async function(...args) {
    // Call the original fetch
    const response = await originalFetch.apply(this, args);

    // Extract the URL from the arguments
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

    // Log all imageregistry API calls for debugging
    if (url.includes('imageregistry.operator.openshift.io')) {
      console.log('[ImageRegistry Override] Detected imageregistry API call:', url);
    }

    // Check if this is an imageregistry config request
    const isImageRegistryConfig =
      url.includes('/apis/imageregistry.operator.openshift.io/') &&
      url.includes('/configs/cluster');

    if (!isImageRegistryConfig) {
      return response;
    }

    console.log('[ImageRegistry Override] ✓ Intercepted ImageRegistry config request');
    console.log('[ImageRegistry Override] Returning error response instead of real data');

    // Return an error response instead of the actual data
    const errorResponse = {
      kind: "Status",
      apiVersion: "v1",
      metadata: {},
      status: "Failure",
      message: "Internal error occurred: ImageRegistry config intercepted by extension",
      reason: "InternalError",
      code: 500
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      statusText: "Internal Server Error",
      headers: response.headers
    });
  };

  console.log('[ImageRegistry Override] Extension loaded and fetch interceptor active');
})();
