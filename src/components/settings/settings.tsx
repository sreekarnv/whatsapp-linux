import { useState } from "react";
import { type AppSettings, settingsApi } from "../../settings";
import styles from "./settings.module.scss";

type ToggleProps = {
  checked: boolean;
  description: string;
  disabled: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

function Toggle({ checked, description, disabled, label, onChange }: ToggleProps) {
  return (
    <label className={styles["settings-toggle"]}>
      <span>
        <strong>{label}</strong>
        <small className={styles["settings-toggle__description"]}>{description}</small>
      </span>
      <input
        className={styles["settings-toggle__input"]}
        checked={checked}
        disabled={disabled}
        type="checkbox"
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  );
}

type SettingsProps = {
  settings: AppSettings;
  loading: boolean;
  onChange: (settings: AppSettings) => Promise<void>;
};

export function Settings({ settings, loading, onChange }: SettingsProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function update<Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) {
    await onChange({ ...settings, [key]: value });
  }

  async function testNotifications() {
    setStatus(null);
    const sent = await settingsApi.testNotification();
    setStatus(sent ? "Sent a test notification." : "Desktop notifications are unavailable.");
  }

  async function resetSession() {
    const confirmed = window.confirm("Reset WhatsApp Web session? You will need to scan the QR code again.");
    if (!confirmed) return;
    setBusy(true);
    setStatus(null);
    try {
      await settingsApi.resetSession();
      setStatus("WhatsApp Web session was reset. Reload WhatsApp to sign in again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles["settings-panel"]}>
      <div className={styles["settings-panel__header"]}>
        <p className={styles["settings-panel__eyebrow"]}>Preferences</p>
        <h2>Desktop integration</h2>
        <p>These settings belong to the wrapper only. WhatsApp messages, contacts, and media are not read or copied.</p>
      </div>

      <div className={styles["settings-panel__list"]} aria-busy={loading}>
        <Toggle
          checked={settings.startMinimized}
          description="Start in the background and keep WhatsApp available from the tray."
          disabled={loading}
          label="Start minimized"
          onChange={(checked) => update("startMinimized", checked)}
        />
        <Toggle
          checked={settings.launchOnStartup}
          description="Register the app with your desktop session autostart entries."
          disabled={loading}
          label="Launch on system startup"
          onChange={(checked) => update("launchOnStartup", checked)}
        />
        <Toggle
          checked={settings.showNotifications}
          description="Allow normal Chromium notification prompts and test notifications."
          disabled={loading}
          label="Show notifications"
          onChange={(checked) => update("showNotifications", checked)}
        />
        <Toggle
          checked={settings.keepRunningInTray}
          description="Closing the window hides it instead of quitting. Disable to exit on close."
          disabled={loading}
          label="Keep running in tray"
          onChange={(checked) => update("keepRunningInTray", checked)}
        />
      </div>

      <div className={styles["settings-panel__actions"]}>
        <button type="button" onClick={testNotifications}>
          Test notifications
        </button>
        <button type="button" onClick={() => settingsApi.reloadWhatsApp()}>
          Reload WhatsApp
        </button>
        <button
          className={styles["settings-panel__button--danger"]}
          disabled={busy}
          type="button"
          onClick={resetSession}
        >
          Reset WhatsApp Web session
        </button>
      </div>

      {status ? (
        <p className={styles["settings-panel__status"]} role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
