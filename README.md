# WhatsApp Linux

Personal, unofficial Linux desktop wrapper for WhatsApp Web.

This app opens the official WhatsApp Web site in Electron/Chromium. It is not affiliated with WhatsApp, Meta, or any related entity.

## Download

Download the latest AppImage or `.deb` package from GitHub Releases.

Use the AppImage for portable use, or the `.deb` package for Debian/Ubuntu installs.

## Install

Run the AppImage:

```bash
chmod +x "WhatsApp Linux-*.AppImage"
./"WhatsApp Linux-*.AppImage"
```

Install the Debian package:

```bash
sudo apt install ./"WhatsApp Linux-*.deb"
```

Verify release checksums if you downloaded `sha256sums.txt`:

```bash
sha256sum -c sha256sums.txt
```

## What It Does

- Opens `https://web.whatsapp.com` in Electron/Chromium.
- Keeps a persistent WhatsApp Web session.
- Provides tray controls for show, hide, reload, reset session, and quit.
- Closing the window hides it to the tray.
- Allows microphone, camera, display capture, media, and notification permissions for WhatsApp calls.
- Opens unrelated external links in the system browser.
- Registers the `whatsapp-linux://` URL scheme and translates incoming
  `whatsapp-linux://send?text=...` links to the matching
  `https://web.whatsapp.com/send?text=...` WhatsApp Web page.

## What It Does Not Do

- Does not scrape, read, export, duplicate, or log messages.
- Does not bypass WhatsApp authentication.
- Does not automate WhatsApp.
- Does not intercept the plain `https://api.whatsapp.com/send?...` link
  shared from sites like YouTube. Linux routes that HTTPS URL to your
  default browser. To hand a YouTube share to this app, redirect the
  page from a helper of your choice (for example a browser extension
  or bookmarklet) to `whatsapp-linux://send?text=<encoded url>`,
  then run `xdg-open` on that custom-scheme link.

## Development

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Verify changes:

```bash
pnpm format:check
pnpm build
```

Build Linux artifacts:

```bash
pnpm dist
```

Artifacts are written under `release/`.

## Releases

GitHub Releases are the only distribution channel.

Pushing a version tag runs the release workflow and uploads the AppImage, `.deb`, and `sha256sums.txt`:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Known Limitations

- WhatsApp Web can change and break wrapper behavior.
- Voice and video calls depend on Electron/Chromium and the Linux desktop environment.
- Builds are unsigned.
- Deep-link support relies on the Linux desktop association installed
  by the `.deb` package (or by an integrated AppImage). A portable
  AppImage that is not integrated with the desktop environment will
  not receive `whatsapp-linux://` URLs from the OS.
- This is a personal project provided as-is, with no support or compatibility guarantees.

## Shortcuts

- `Ctrl+Shift+W`: show or hide WhatsApp.
- `Ctrl+R`: reload WhatsApp Web.
- `Ctrl+Shift+I`: toggle developer tools in development builds only.

## License

MIT
