import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  session,
  shell,
  Tray,
} from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type AppSettings = {
  startMinimized: boolean;
  launchOnStartup: boolean;
  showNotifications: boolean;
  keepRunningInTray: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  startMinimized: false,
  launchOnStartup: false,
  showNotifications: true,
  keepRunningInTray: true,
};

const APP_TITLE = "WhatsApp Linux";
const WHATSAPP_URL = "https://web.whatsapp.com/";
const WHATSAPP_HOST = "web.whatsapp.com";
const APP_ID = "com.sreekarnv.whatsapp-linux";
const isDev = !app.isPackaged;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.commandLine.appendSwitch("log-level", "3");
app.setName(APP_TITLE);
app.setPath("userData", join(app.getPath("appData"), APP_ID));

let settings = loadSettings();
let tray: Tray | null = null;
let settingsWindow: BrowserWindow | null = null;
let whatsappWindow: BrowserWindow | null = null;
let isQuitting = false;

function settingsPath() {
  return join(app.getPath("userData"), "settings.json");
}

function loadSettings(): AppSettings {
  try {
    const path = settingsPath();
    if (!existsSync(path)) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(path, "utf8")) };
  } catch (error) {
    console.error("Ignoring invalid settings JSON:", error);
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(nextSettings: AppSettings): AppSettings {
  const path = settingsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(nextSettings, null, 2));
  settings = nextSettings;
  app.setLoginItemSettings({ openAtLogin: nextSettings.launchOnStartup });
  return settings;
}

function createSettingsWindow(visible: boolean) {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (visible) showWindow(settingsWindow);
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    title: `${APP_TITLE} Settings`,
    autoHideMenuBar: true,
    width: 920,
    height: 680,
    minWidth: 640,
    minHeight: 520,
    show: visible,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  if (isDev) {
    settingsWindow.loadURL("http://localhost:1420");
  } else {
    settingsWindow.loadFile(join(__dirname, "../dist/index.html"));
  }

  return settingsWindow;
}

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
    if (isQuitting || !settings.keepRunningInTray) return;
    event.preventDefault();
    whatsappWindow?.hide();
  });

  whatsappWindow.on("closed", () => {
    whatsappWindow = null;
  });

  whatsappWindow.loadURL(WHATSAPP_URL, { userAgent: chromiumUserAgent() });
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
      { label: "Settings", click: () => showWindow(createSettingsWindow(true)) },
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

ipcMain.handle("settings:get", () => settings);
ipcMain.handle("settings:save", (_event, nextSettings: AppSettings) => saveSettings(nextSettings));
ipcMain.handle("whatsapp:reset-session", () => resetWhatsAppSession());
ipcMain.handle("whatsapp:reload", () => reloadWhatsApp());
ipcMain.handle("whatsapp:open-browser", () => shell.openExternal(WHATSAPP_URL));
ipcMain.handle("notifications:test", () => {
  if (Notification.isSupported()) {
    new Notification({ title: APP_TITLE, body: "Notifications are working." }).show();
    return true;
  }
  return false;
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createTray();
  registerShortcuts();
  createWhatsAppWindow(!settings.startMinimized);
});

app.on("activate", () => {
  createWhatsAppWindow(true);
});

app.on("window-all-closed", () => {});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
