# AGENTS.md

## Commands

- Install with `pnpm install`; the repo uses `pnpm@11.21.0` and build-script approvals live in `pnpm-workspace.yaml`.
- Dev app: `pnpm dev` compiles Electron TS and launches Electron.
- Verify code changes with `pnpm format:check` and `pnpm build`; there is no test script configured.
- Format with `pnpm format` before large edits.
- Package Linux artifacts with `pnpm dist`; output goes to ignored `release/`.
- GitHub-only releases are tag-based: push `v*` tags to run `.github/workflows/release.yml` and upload AppImage, `.deb`, and checksums.

## Architecture

- Runtime is Electron/Chromium, not Tauri. Do not add `src-tauri`, Rust, WebKitGTK, or `@tauri-apps/*` code back.
- Electron main source is in `electron/main.ts`; compiled output goes to ignored `dist-electron/`.
- The WhatsApp window is created in `electron/main.ts` and loads `https://web.whatsapp.com/` with session partition `persist:whatsapp`.
- There is no React/Vite settings UI; keep controls in the Electron tray unless a real UI is needed.
- Needed Electron icons live in `build/icons/`; package config references these paths.

## Electron Gotchas

- WhatsApp navigation is intentionally restricted to `https://web.whatsapp.com`, `about:`, and `blob:`; unrelated URLs open externally.
- Media/call support depends on `setPermissionRequestHandler` allowing WhatsApp `media`, `microphone`, `camera`, `display-capture`, and `notifications`.
- `app.commandLine.appendSwitch("log-level", "3")` suppresses noisy Chromium/WebRTC logs; remove only if debugging native Chromium output.
- Startup creates only the WhatsApp window; tray menu handles show, hide, reload, reset session, and quit.

## Generated And Ignored Outputs

- `dist-electron/`, `release/`, and `node_modules/` are generated/ignored; do not review or hand-edit them.
- `pnpm-lock.yaml` is ignored by Prettier but should still be preserved when dependency changes are intentional.
