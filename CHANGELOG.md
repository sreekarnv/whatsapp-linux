# Changelog

## 0.1.2 - 2026-08-27

- Registered the `whatsapp-linux://` URL scheme via Linux MIME association so installed builds can receive share intents.
- Added deep-link handling on cold start (`process.argv`) and warm start (`second-instance`).
- Translated incoming `whatsapp-linux://send?text=...` links to `https://web.whatsapp.com/send?text=...`.

## 0.1.1 - 2026-08-12

- Removed the settings UI and kept controls in the Electron tray.
- Simplified the app to a WhatsApp-only Electron wrapper.

## 0.1.0 - 2026-08-12

- Added Electron/Chromium WhatsApp Web wrapper.
- Added persistent WhatsApp Web session support.
- Added tray controls, close-to-tray behavior, and global shortcuts.
- Added tray controls for showing, hiding, reloading, and resetting WhatsApp.
- Added microphone, camera, display capture, media, and notification permissions for WhatsApp calls.
- Added Linux AppImage and Debian package builds.
