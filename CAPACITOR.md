# Building the offline Android APK with Capacitor

This project is configured as a **static SPA** so it can be packaged into a
Capacitor APK and work fully offline — no Wi-Fi, no localhost, no server.

## Why the previous APK needed Wi-Fi

TanStack Start is SSR-first by default. A normal build produced a server
bundle that the installed app couldn't reach once Wi-Fi was off, or a
`capacitor.config.ts` with `server.url` pointed the app at your PC. Either
way, no internet = "can't reach localhost".

The fix in this repo:

1. `vite.config.ts` sets `nitro: false` and `tanstackStart.spa.enabled = true`
   so the build emits only client assets (no server).
2. `scripts/finalize-spa.mjs` copies the prerendered shell
   (`dist/client/_shell.html`) to `dist/client/index.html` — that's the file
   the Android WebView opens.
3. `capacitor.config.ts` uses `webDir: "dist/client"` and **does not** set
   `server.url`.

## Build + package

```bash
npm install
npm run build                       # -> dist/client/ (static site with index.html)

# Verify offline first — disable Wi-Fi, then:
npx serve dist/client               # open the printed URL; app must work

# Copy the static build into the native Android project:
npx cap sync android

# Build / sign in Android Studio, or from the CLI:
cd android
./gradlew assembleRelease           # APK in app/build/outputs/apk/release/
```

If you've never added Android yet:

```bash
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/android
npx cap add android
npm run cap:sync                    # build + cap sync android
```

## Common pitfalls

- **White screen in APK** → `webDir` is wrong, or you forgot to re-run
  `npm run build && npx cap sync android` after changes. Use `npm run cap:sync`.
- **"Cannot reach localhost / no internet"** → leftover `server.url` in
  `capacitor.config.ts`. Delete the whole `server` block.
- **Fonts/images missing** → reference them with a leading slash
  (`/fonts/...`, `/logo.png`). Capacitor serves `webDir` from the asset
  root, so absolute paths resolve.
- **Routing 404 inside the APK** → the prerendered shell is a single-page
  fallback; client-side routing handles the rest. Don't reload a deep link
  in the WebView with a hard navigation that escapes the SPA.
