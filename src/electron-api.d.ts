import type { AppSettings } from "./settings";

declare global {
  interface Window {
    whatsappLinux: {
      getSettings: () => Promise<AppSettings>;
      saveSettings: (settings: AppSettings) => Promise<AppSettings>;
      resetWhatsAppSession: () => Promise<void>;
      reloadWhatsApp: () => Promise<void>;
      openWhatsAppInBrowser: () => Promise<void>;
      testNotification: () => Promise<boolean>;
    };
  }
}

export {};
