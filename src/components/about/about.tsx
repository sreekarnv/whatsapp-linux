import styles from "./about.module.scss";

export function About() {
  return (
    <article className={`${styles["about-panel"]} ${styles["about-panel__body"]}`}>
      <p className={styles["about-panel__eyebrow"]}>About</p>
      <h2>WhatsApp Linux</h2>
      <p>
        WhatsApp Linux is an unofficial Linux desktop wrapper that opens the official WhatsApp Web site in a dedicated
        Electron/Chromium window. It does not implement WhatsApp networking, automate user actions, scrape content, or
        inject JavaScript into WhatsApp Web.
      </p>
      <h3>Shortcuts</h3>
      <ul>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd>: show or hide the WhatsApp window.
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>R</kbd>: reload WhatsApp Web.
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>: toggle developer tools in development builds only.
        </li>
      </ul>
      <h3>Privacy</h3>
      <p>
        The app stores only wrapper settings and Chromium session data needed by WhatsApp Web. Your messages stay inside
        WhatsApp Web and WhatsApp&apos;s own services.
      </p>
    </article>
  );
}
