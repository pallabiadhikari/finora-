/* =====================================================
   Finora — useSettings
   Returns the current user settings (currency, theme,
   date format, private view).

   Refreshes automatically when:
     • Another part of the app dispatches
       'finora:settings-changed'
     • The window regains focus or becomes visible
       (in case another tab changed the settings)

   The returned object is stable between refreshes — it
   only changes when the settings content actually changes.
   ===================================================== */

import { useEffect, useState } from 'react';
import { getSettings } from '../utils/user';

export function useSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const refresh = () => {
      const next = getSettings();

      // Only update state if the content actually changed.
      // Avoids re-rendering every consumer on every window focus.
      setSettings((prev) =>
        JSON.stringify(prev) === JSON.stringify(next)
          ? prev
          : next
      );
    };

    const onVisibility = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener('focus', refresh);
    window.addEventListener('finora:settings-changed', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener(
        'finora:settings-changed',
        refresh
      );
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      );
    };
  }, []);

  return settings;
}