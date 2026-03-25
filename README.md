# OpenShift ImageRegistry Error Injector Extension

A minimal Chrome extension that intercepts Kubernetes API responses in the OpenShift console and returns an error response for the ImageRegistry configuration instead of the real data.

## What It Does

This extension intercepts the API response for the ImageRegistry config (`/apis/imageregistry.operator.openshift.io/v1/configs/cluster`) and returns a **500 Internal Server Error** instead of the actual configuration data. This triggers the OpenShift UI to show an error state for the ImageRegistry.

## Installation

1. **Clone or download this repository**
   ```bash
   cd /path/to/qe-extension
   ```

2. **Open Chrome and navigate to extensions**
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `/Users/bipuladh/Work/qe-extension` directory
   - The extension should now appear in your extensions list

## Usage

1. **Navigate to the OpenShift Console**
   - Open your OpenShift cluster console in Chrome

2. **Go to the ImageRegistry configuration page**
   - Administration → Cluster Settings → Configuration → Image Registry
   - Or navigate directly to the ImageRegistry operator page

3. **The extension automatically intercepts and returns an error**
   - The UI will show an error state for the ImageRegistry configuration
   - Check the browser console for logs (F12 → Console tab)

## Verifying It Works

### Check Console Logs

1. Open the browser console (F12)
2. Clear the console
3. Reload the ImageRegistry page
4. Look for these messages:

```
[ImageRegistry Override] Extension loaded and fetch interceptor active
[ImageRegistry Override] Detected imageregistry API call: <url>
[ImageRegistry Override] ✓ Intercepted ImageRegistry config request
[ImageRegistry Override] Returning error response instead of real data
```

### Check Network Tab

1. Open DevTools (F12) → Network tab
2. Filter by "imageregistry"
3. Look for requests to `/apis/imageregistry.operator.openshift.io/v1/configs/cluster`
4. Click on the request → Response tab
5. You should see a 500 error with a Kubernetes Status object indicating "InternalError"

## Troubleshooting

### Extension Not Working?

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find "OpenShift ImageRegistry Error Injector"
   - Click the refresh icon

2. **Check console for errors:**
   - Open F12 → Console
   - Look for any error messages

3. **Verify the extension is injecting:**
   - You should see the initialization message when the page loads:
     ```
     [ImageRegistry Override] Extension loaded and fetch interceptor active
     ```

4. **Hard reload the OpenShift console:**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

5. **Check if the correct URL is being called:**
   - Look in the console for `[ImageRegistry Override] Detected imageregistry API call:`
   - The URL should contain `/apis/imageregistry.operator.openshift.io/` and `/configs/cluster`

### Still Not Working?

- Make sure you're on the correct page in OpenShift (ImageRegistry configuration)
- Check that the extension has permissions to run on the OpenShift console URL
- Try disabling other extensions that might interfere with fetch requests

## How It Works

1. **Content Script Injection**
   - Runs at `document_start` in the `MAIN` world to access the page's JavaScript context

2. **Fetch Override**
   - Stores the original `window.fetch` function
   - Replaces it with a custom wrapper

3. **Request Interception**
   - Detects requests to `/apis/imageregistry.operator.openshift.io/.../configs/cluster`
   - Intercepts the response before it reaches the OpenShift console

4. **Error Injection**
   - Creates a Kubernetes Status object with:
     - `status: "Failure"`
     - `reason: "InternalError"`
     - `code: 500`
   - Logs the interception to the console

5. **Response Replacement**
   - Returns a new Response object with the error data
   - Sets HTTP status to 500 Internal Server Error
   - Preserves original headers

## Files

- `manifest.json` - Extension manifest (Manifest V3)
- `content.js` - Main script that overrides fetch and modifies responses
- `README.md` - This file

## Important Notes

- **Local debugging only** - This is intended for development/testing purposes
- **No data leaves your browser** - All interception happens client-side
- **Non-destructive** - Only intercepts the API response in the UI, doesn't change actual cluster state
- **Minimal permissions** - No special Chrome permissions required
- **Error injection** - Returns a 500 error instead of real data to trigger error handling in the UI

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "OpenShift ImageRegistry Error Injector"
3. Click "Remove"

## License

This is a minimal debugging tool for local development.
