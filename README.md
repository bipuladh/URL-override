# OpenShift QE Extension

A Chrome extension that intercepts fetch requests in the OpenShift console and transforms request bodies to match backend expectations.

## What It Does

Intercepts POST requests to endpoints ending with `/registry-checks` and renames the `ImageRegistryURL` field to `registryURL` in the JSON request body before forwarding to the backend.

## Installation

1. Navigate to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** and select this directory

## Verifying It Works

Open the browser console (F12) and look for:

```
[Registry Checks Override] Watching for POST requests to /registry-checks
[Registry Checks Override] ✓ Intercepted POST to /registry-checks
[Registry Checks Override] Renaming ImageRegistryURL → registryURL
```

## How It Works

1. Injects a content script at `document_start` in the `MAIN` world
2. Overrides `window.fetch` with a wrapper
3. For POST requests to `/registry-checks`, parses the JSON body, renames `ImageRegistryURL` → `registryURL`, and forwards the modified request

## Files

- `manifest.json` — Extension manifest (Manifest V3)
- `content.js` — Fetch interceptor script

## Notes

- **Local testing only** — intended for development/QE purposes
- **Client-side only** — no data leaves your browser
- **Non-destructive** — only transforms the request field name
