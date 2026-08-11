export type AppSettings = {
  startMinimized: boolean;
  launchOnStartup: boolean;
  showNotifications: boolean;
  keepRunningInTray: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  startMinimized: false,
  launchOnStartup: false,
  showNotifications: true,
  keepRunningInTray: true,
};

export const settingsApi = {
  load: () => window.whatsappLinux.getSettings(),
  save: (settings: AppSettings) => window.whatsappLinux.saveSettings(settings),
  resetSession: () => window.whatsappLinux.resetWhatsAppSession(),
  reloadWhatsApp: () => window.whatsappLinux.reloadWhatsApp(),
  openInBrowser: () => window.whatsappLinux.openWhatsAppInBrowser(),
  testNotification: () => window.whatsappLinux.testNotification(),
};
