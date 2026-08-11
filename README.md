# WhatsApp Linux

WhatsApp Linux is an unofficial Linux desktop wrapper for the official WhatsApp Web site at `https://web.whatsapp.com`.

It uses Electron, Chromium, React, TypeScript, and Vite. Users authenticate normally by scanning the WhatsApp Web QR code.

## Scope

This app only wraps WhatsApp Web. It does not reverse-engineer WhatsApp protocols, scrape chats, contacts, messages, or media, automate messages, inject JavaScript into WhatsApp Web, bypass authentication, or reproduce WhatsApp backend behavior.

## Privacy And Security

The app stores only wrapper settings and Chromium session data for WhatsApp Web. It does not read, parse, export, duplicate, or log WhatsApp chat content.

Navigation is restricted so `https://web.whatsapp.com` stays inside the app and unrelated external URLs open in the system browser.

## Linux Dependencies

Install Node.js and pnpm with Corepack:

```bash
corepack enable
corepack prepare pnpm@11.21.0 --activate
```

## Development

Install JavaScript dependencies:

```bash
pnpm install
```

Run the app in development:

```bash
pnpm dev
```

Build the frontend only:

```bash
pnpm build
```

## Production Build

Build `.deb` and AppImage packages:

```bash
pnpm dist
```

Artifacts are written under `release/`.

## Features

The app provides a persistent Chromium WhatsApp Web session, system tray controls, close-to-tray behavior, local settings, startup launch preference, browser-safe external-link handling, test notifications, microphone/camera permission handling for calls, and development-only devtools shortcut support.

Shortcuts:

- `Ctrl+Shift+W`: show or hide WhatsApp.
- `Ctrl+R`: reload WhatsApp Web.
- `Ctrl+Shift+I`: toggle developer tools in development builds only.

## Reset Session

Open Settings and click `Reset WhatsApp Web session`. This destroys the WhatsApp window, clears only the app's Chromium WhatsApp session data, recreates the WhatsApp window, and requires a fresh QR login.

## Startup Launch

Enable `Launch on system startup` in Settings. The app writes an XDG autostart desktop entry at `~/.config/autostart/whatsapp-linux.desktop`.

Disable the setting to remove that entry.

## Calls

WhatsApp Web runs in Electron's Chromium runtime. Voice and video calls use Chromium WebRTC APIs, and the app grants WhatsApp Web microphone, camera, display capture, media, and notification permissions when Chromium requests them.

If you used an older non-Chromium build, scan the QR code again because Chromium cannot reuse that browser session.

## Uninstall

Remove a Debian package install:

```bash
sudo apt remove whatsapp-linux
```

Remove the startup entry if it remains:

```bash
rm -f "$HOME/.config/autostart/whatsapp-linux.desktop"
```

Remove local wrapper settings and session data:

```bash
rm -rf "$HOME/.config/com.sreekarnv.whatsapp-linux"
```

## Legal Disclaimer

WhatsApp is a trademark of its respective owner. This project is unofficial and is not affiliated with, endorsed by, or sponsored by WhatsApp, Meta, or any related entity. Use it in compliance with WhatsApp's terms and applicable law.
