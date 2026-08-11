import { settingsApi } from "../../settings";
import styles from "./error-screen.module.scss";

export function ErrorScreen() {
  return (
    <section className={`${styles["error-screen"]} ${styles["error-screen__message"]}`} role="alert">
      <p className={styles["error-screen__eyebrow"]}>Connection problem</p>
      <h2>WhatsApp Web could not be loaded</h2>
      <p>
        Check your network connection and whether <code>https://web.whatsapp.com</code> is reachable. The app logs only
        wrapper errors and does not log private WhatsApp content.
      </p>
      <div className={styles["error-screen__actions"]}>
        <button type="button" onClick={() => settingsApi.reloadWhatsApp()}>
          Reload
        </button>
        <button type="button" onClick={() => settingsApi.openInBrowser()}>
          Open in Browser
        </button>
      </div>
    </section>
  );
}
