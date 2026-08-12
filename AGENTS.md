# AGENTS.md

## Commands

- Install with `pnpm install`; the repo uses `pnpm@11.21.0` and build-script approvals live in `pnpm-workspace.yaml`.
- Dev app: `pnpm dev` starts Vite on port `1420`, compiles Electron TS, then launches Electron.
- Verify code changes with `pnpm format:check` and `pnpm build`; there is no test script configured.
- Format with `pnpm format` before large TS/SCSS edits.
- Package Linux artifacts with `pnpm dist`; output goes to ignored `release/`.
- GitHub-only releases are tag-based: push `v*` tags to run `.github/workflows/release.yml` and upload AppImage, `.deb`, and checksums.

## Architecture

- Runtime is Electron/Chromium, not Tauri. Do not add `src-tauri`, Rust, WebKitGTK, or `@tauri-apps/*` code back.
- Electron main/preload sources are in `electron/`; compiled output goes to ignored `dist-electron/`.
- The WhatsApp window is created in `electron/main.ts` and loads `https://web.whatsapp.com/` with session partition `persist:whatsapp`.
- The settings UI is the React/Vite app under `src/`; it opens from the tray `Settings` item and uses `HashRouter` for Electron/file URL compatibility.
- Frontend-to-main calls go through `window.whatsappLinux` from `electron/preload.ts`; keep `contextIsolation: true` and `nodeIntegration: false`.
- Needed Electron icons live in `build/icons/`; package config references these paths.

## Electron Gotchas

- WhatsApp navigation is intentionally restricted to `https://web.whatsapp.com`, `about:`, and `blob:`; unrelated URLs open externally.
- Media/call support depends on `setPermissionRequestHandler` allowing WhatsApp `media`, `microphone`, `camera`, `display-capture`, and `notifications`.
- `app.commandLine.appendSwitch("log-level", "3")` suppresses noisy Chromium/WebRTC logs; remove only if debugging native Chromium output.
- Startup creates only the WhatsApp window; the settings window is lazy-created from the tray menu.

## Styling

- Global styles belong in `src/scss/global.scss`; component styles use SCSS modules colocated with components.
- SCSS module class names use BEM keys and TSX bracket access, e.g. `styles["settings-panel__header"]`.
- Responsive rules should use `@include respond(phone)` from `src/scss/abstracts/_respond.scss`, not raw `@media (max-width: 760px)`.
- Component folders and filenames are kebab-case, e.g. `src/components/error-screen/error-screen.tsx`.

## Generated And Ignored Outputs

- `dist/`, `dist-electron/`, `release/`, and `node_modules/` are generated/ignored; do not review or hand-edit them.
- `pnpm-lock.yaml` is ignored by Prettier but should still be preserved when dependency changes are intentional.
