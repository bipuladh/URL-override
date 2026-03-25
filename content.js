/**
 * OpenShift ImageRegistry Storage Override
 * Intercepts fetch responses for imageregistry.operator.openshift.io/configs/cluster
 * and modifies the storage configuration to simulate no persistent storage.
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

    try {
      // Clone the response so we can read it without consuming the original
      const clonedResponse = response.clone();

      // Attempt to parse as JSON
      const data = await clonedResponse.json();

      console.log('[ImageRegistry Override] Original data:', JSON.parse(JSON.stringify(data)));

      // Modify the storage configuration
      const modifiedData = modifyImageRegistryStorage(data);

      console.log('[ImageRegistry Override] Modified data:', JSON.parse(JSON.stringify(modifiedData)));
      console.log('[ImageRegistry Override] ✓ Intercepted and modified storage configuration');

      // Create a new response with modified data
      return new Response(JSON.stringify(modifiedData), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      // If JSON parsing fails or any other error occurs, return the original response
      console.warn('[ImageRegistry Override] Failed to parse or modify response:', error);
      return response;
    }
  };

  /**
   * Modifies the ImageRegistry config to simulate no persistent storage
   */
  function modifyImageRegistryStorage(data) {
    const modified = JSON.parse(JSON.stringify(data)); // Deep clone

    // Remove all persistent storage configurations from spec
    if (modified.spec && modified.spec.storage) {
      const storageTypesToRemove = ['pvc', 's3', 'gcs', 'azure', 'swift', 'ibmcos', 'oss'];

      storageTypesToRemove.forEach(type => {
        delete modified.spec.storage[type];
      });

      // Set emptyDir to simulate ephemeral storage
      modified.spec.storage.emptyDir = {};
    }

    // Remove all persistent storage configurations from status
    if (modified.status && modified.status.storage) {
      const storageTypesToRemove = ['pvc', 's3', 'gcs', 'azure', 'swift', 'ibmcos', 'oss'];

      storageTypesToRemove.forEach(type => {
        delete modified.status.storage[type];
      });

      // Set emptyDir in status to indicate ephemeral storage
      modified.status.storage.emptyDir = {};
    }

    return modified;
  }

  console.log('[ImageRegistry Override] Extension loaded and fetch interceptor active');
})();
