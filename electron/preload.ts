import { contextBridge, ipcRenderer } from "electron";

type AppSettings = {
  startMinimized: boolean;
  launchOnStartup: boolean;
  showNotifications: boolean;
  keepRunningInTray: boolean;
};

contextBridge.exposeInMainWorld("whatsappLinux", {
  getSettings: () => ipcRenderer.invoke("settings:get") as Promise<AppSettings>,
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke("settings:save", settings) as Promise<AppSettings>,
  resetWhatsAppSession: () => ipcRenderer.invoke("whatsapp:reset-session") as Promise<void>,
  reloadWhatsApp: () => ipcRenderer.invoke("whatsapp:reload") as Promise<void>,
  openWhatsAppInBrowser: () => ipcRenderer.invoke("whatsapp:open-browser") as Promise<void>,
  testNotification: () => ipcRenderer.invoke("notifications:test") as Promise<boolean>,
});
