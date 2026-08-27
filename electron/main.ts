import { app, BrowserWindow, globalShortcut, Menu, nativeImage, session, shell, Tray } from "electron";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_TITLE = "WhatsApp Linux";
const WHATSAPP_URL = "https://web.whatsapp.com/";
const WHATSAPP_HOST = "web.whatsapp.com";
const APP_ID = "com.sreekarnv.whatsapp-linux";
const PROTOCOL_SCHEME = "whatsapp-linux";
const isDev = !app.isPackaged;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.commandLine.appendSwitch("log-level", "3");
app.setName(APP_TITLE);
app.setPath("userData", join(app.getPath("appData"), APP_ID));

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_SCHEME, process.execPath, [resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_SCHEME);
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

let tray: Tray | null = null;
let whatsappWindow: BrowserWindow | null = null;
let isQuitting = false;
let pendingDeepLink: string | null = null;

function createWhatsAppWindow(visible: boolean) {
  if (whatsappWindow && !whatsappWindow.isDestroyed()) {
    if (visible) showWindow(whatsappWindow);
    return whatsappWindow;
  }

  const whatsappSession = session.fromPartition("persist:whatsapp");
  configureWhatsAppSession(whatsappSession);

  whatsappWindow = new BrowserWindow({
    title: APP_TITLE,
    autoHideMenuBar: true,
    width: 1100,
    height: 760,
    minWidth: 720,
    minHeight: 520,
    show: visible,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: "persist:whatsapp",
    },
  });

  whatsappWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isWhatsAppWebUrl(url)) return { action: "allow" };
    openExternalUrl(url);
    return { action: "deny" };
  });

  whatsappWindow.webContents.on("will-navigate", (event, url) => {
    if (isAllowedWhatsAppNavigation(url)) return;
    event.preventDefault();
    openExternalUrl(url);
  });

  whatsappWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    whatsappWindow?.setTitle(APP_TITLE);
  });

  whatsappWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    whatsappWindow?.hide();
  });

  whatsappWindow.on("closed", () => {
    whatsappWindow = null;
  });

  const initialUrl = pendingDeepLink ?? WHATSAPP_URL;
  pendingDeepLink = null;
  whatsappWindow.loadURL(initialUrl, { userAgent: chromiumUserAgent() });
  return whatsappWindow;
}

function configureWhatsAppSession(whatsappSession: Electron.Session) {
  whatsappSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const origin = new URL(webContents.getURL()).origin;
    const allowedPermissions = new Set(["media", "microphone", "camera", "display-capture", "notifications"]);
    callback(origin === "https://web.whatsapp.com" && allowedPermissions.has(permission));
  });
}

function chromiumUserAgent() {
  return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`;
}

function isWhatsAppWebUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === WHATSAPP_HOST;
  } catch {
    return false;
  }
}

function isAllowedWhatsAppNavigation(url: string) {
  try {
    const parsed = new URL(url);
    return isWhatsAppWebUrl(url) || parsed.protocol === "about:" || parsed.protocol === "blob:";
  } catch {
    return false;
  }
}

function openExternalUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      shell.openExternal(url);
    }
  } catch (error) {
    console.error("Blocked invalid external URL:", error);
  }
}

function findIncomingUrl(argv: string[]) {
  for (const arg of argv) {
    if (typeof arg === "string" && arg.startsWith(`${PROTOCOL_SCHEME}://`)) {
      return arg;
    }
  }
  return null;
}

function translateDeepLink(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== `${PROTOCOL_SCHEME}:`) return null;

  const host = parsed.hostname || parsed.pathname.replace(/^\/+/, "").split("/")[0];
  const action = host === "send" || host === "" ? "send" : null;
  if (!action) return null;

  const target = new URL("/send", `https://${WHATSAPP_HOST}`);
  const text = parsed.searchParams.get("text");
  if (text !== null) target.searchParams.set("text", text);
  const phone = parsed.searchParams.get("phone");
  if (phone !== null) target.searchParams.set("phone", phone);
  return target.toString();
}

function handleIncomingUrl(rawUrl: string) {
  const target = translateDeepLink(rawUrl);
  if (!target) return;

  if (whatsappWindow && !whatsappWindow.isDestroyed()) {
    whatsappWindow.loadURL(target, { userAgent: chromiumUserAgent() });
    showWindow(whatsappWindow);
    return;
  }

  pendingDeepLink = target;
  createWhatsAppWindow(true);
}

const initialDeepLink = findIncomingUrl(process.argv);

function showWindow(window: BrowserWindow) {
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
}

function toggleWhatsAppWindow() {
  const window = createWhatsAppWindow(true);
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow(window);
  }
}

function createTray() {
  const iconPath = isDev ? join(__dirname, "../build/icons/32x32.png") : join(process.resourcesPath, "icon.png");
  const icon = existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip(APP_TITLE);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show WhatsApp", click: () => showWindow(createWhatsAppWindow(true)) },
      { label: "Hide WhatsApp", click: () => whatsappWindow?.hide() },
      { label: "Reload WhatsApp", click: reloadWhatsApp },
      { label: "Reset WhatsApp Session", click: () => resetWhatsAppSession() },
      { type: "separator" },
      { label: "Quit", click: quitApp },
    ]),
  );
  tray.on("click", toggleWhatsAppWindow);
}

function registerShortcuts() {
  globalShortcut.register("CommandOrControl+Shift+W", toggleWhatsAppWindow);
  globalShortcut.register("CommandOrControl+R", () => reloadWhatsApp());
  if (isDev) {
    globalShortcut.register("CommandOrControl+Shift+I", () => {
      whatsappWindow?.webContents.toggleDevTools();
    });
  }
}

function reloadWhatsApp() {
  if (whatsappWindow && !whatsappWindow.isDestroyed()) {
    whatsappWindow.loadURL(WHATSAPP_URL, { userAgent: chromiumUserAgent() });
  } else {
    createWhatsAppWindow(true);
  }
}

async function resetWhatsAppSession() {
  if (whatsappWindow && !whatsappWindow.isDestroyed()) {
    whatsappWindow.destroy();
  }

  const whatsappSession = session.fromPartition("persist:whatsapp");
  await whatsappSession.clearStorageData();
  await whatsappSession.clearCache();
  createWhatsAppWindow(true);
}

function quitApp() {
  isQuitting = true;
  app.quit();
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createTray();
  registerShortcuts();
  if (initialDeepLink) {
    handleIncomingUrl(initialDeepLink);
    return;
  }
  createWhatsAppWindow(true);
});

app.on("activate", () => {
  createWhatsAppWindow(true);
});

app.on("second-instance", (_event, argv) => {
  const url = findIncomingUrl(argv);
  if (url) {
    handleIncomingUrl(url);
    return;
  }
  showWindow(createWhatsAppWindow(true));
});

app.on("window-all-closed", () => {});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
