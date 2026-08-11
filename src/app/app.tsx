import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router";
import { About } from "../components/about/about";
import { ErrorScreen } from "../components/error-screen/error-screen";
import { Settings } from "../components/settings/settings";
import { type AppSettings, DEFAULT_SETTINGS, settingsApi } from "../settings";
import styles from "./app.module.scss";

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    settingsApi
      .load()
      .then((loaded) => {
        if (mounted) setSettings(loaded);
      })
      .catch((cause: unknown) => {
        if (mounted) setError(cause instanceof Error ? cause.message : "Unable to load settings.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function updateSettings(next: AppSettings) {
    setSettings(next);
    setError(null);
    try {
      setSettings(await settingsApi.save(next));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save settings.");
    }
  }

  function navLinkClass({ isActive }: { isActive: boolean }) {
    return `${styles["app-shell__nav-link"]} ${isActive ? styles["app-shell__nav-link--active"] : ""}`;
  }

  return (
    <main className={styles["app-shell"]}>
      <nav className={styles["app-shell__sidebar"]} aria-label="Application pages">
        <div>
          <p className={styles["app-shell__eyebrow"]}>WhatsApp Linux</p>
          <h1 className={styles["app-shell__title"]}>Desktop wrapper</h1>
        </div>
        <NavLink className={navLinkClass} to="/settings">
          Settings
        </NavLink>
        <NavLink className={navLinkClass} to="/about">
          About
        </NavLink>
        <NavLink className={navLinkClass} to="/error">
          Load error
        </NavLink>
      </nav>

      <section className={styles["app-shell__content"]}>
        {error ? (
          <div className={styles["app-shell__banner"]} role="alert">
            {error}
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<Navigate replace to="/settings" />} />
          <Route
            path="/settings"
            element={<Settings settings={settings} loading={loading} onChange={updateSettings} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/error" element={<ErrorScreen />} />
        </Routes>
      </section>
    </main>
  );
}
