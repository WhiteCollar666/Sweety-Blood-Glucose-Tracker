
import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  ShieldCheck,
  RotateCcw,
  Settings as SettingsIcon,
} from "lucide-react";

const defaultSettings = {
  readingReminder: true,
  weeklySummary: false,
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sweety_settings");
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  const updateSetting = (key) => {
    setSettings((previous) => {
      const updated = {
        ...previous,
        [key]: !previous[key],
      };

      localStorage.setItem("sweety_settings", JSON.stringify(updated));
      setSaved(true);
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("sweety_settings", JSON.stringify(defaultSettings));
    setSaved(true);
  };

  return (
    <div className="settings-page">
      <header className="premium-header">
        <div>
          <span className="readings-eyebrow">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your Sweety application preferences.</p>
        </div>
      </header>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Bell size={20} />
          </div>
          <div>
            <h2>Notification Preferences</h2>
            <p>Choose your preferred reminder settings.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Reading reminders</strong>
            <p>Enable your preference for glucose reading reminders.</p>
          </div>
          <button
            type="button"
            className={`settings-toggle ${settings.readingReminder ? "enabled" : ""}`}
            onClick={() => updateSetting("readingReminder")}
            aria-pressed={settings.readingReminder}
            aria-label="Toggle reading reminders"
          >
            <span />
          </button>
        </div>

        <div className="settings-option">
          <div>
            <strong>Weekly summary preference</strong>
            <p>Save your preference for receiving weekly summaries.</p>
          </div>
          <button
            type="button"
            className={`settings-toggle ${settings.weeklySummary ? "enabled" : ""}`}
            onClick={() => updateSetting("weeklySummary")}
            aria-pressed={settings.weeklySummary}
            aria-label="Toggle weekly summary preference"
          >
            <span />
          </button>
        </div>

        <p className="settings-note">
          These are saved preferences only. This version does not send
          notifications or emails.
        </p>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2>Privacy & Security</h2>
            <p>Information about your account and data.</p>
          </div>
        </div>

        <div className="settings-info-row">
          <ShieldCheck size={19} />
          <div>
            <strong>Protected account</strong>
            <p>Your readings are associated with your authenticated account.</p>
          </div>
        </div>

        <div className="settings-info-row">
          <FileText size={19} />
          <div>
            <strong>Personal health records</strong>
            <p>Your readings are stored in the application's database.</p>
          </div>
        </div>
      </section>

      <section className="settings-section settings-reset-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2>General Preferences</h2>
            <p>Restore the default application preferences.</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-reset-button"
          onClick={resetSettings}
        >
          <RotateCcw size={17} />
          Reset preferences
        </button>

        {saved && (
          <p className="settings-saved-message">
            Preferences saved on this device.
          </p>
        )}
      </section>
    </div>
  );
}

export default Settings;
