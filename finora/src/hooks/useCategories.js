/* =====================================================
   Finora — useCategories
   Returns the merged list of built-in + custom categories
   for the current user.

   Refreshes automatically when:
     • Another part of the app dispatches
       'finora:categories-changed'
     • The window regains focus (in case another tab added
       or removed a category)

   The returned array is stable between refreshes — it only
   changes when the category content actually changes.
   ===================================================== */

import { useEffect, useState } from 'react';
import { getAllCategories } from '../utils/categories';

export function useCategories() {
  const [categories, setCategories] = useState(() =>
    getAllCategories()
  );

  useEffect(() => {
    const refresh = () => {
      const next = getAllCategories();

      // Only update state if the content actually changed.
      // Avoids re-rendering every consumer on every window focus.
      setCategories((prev) =>
        JSON.stringify(prev) === JSON.stringify(next)
          ? prev
          : next
      );
    };

    const onVisibility = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener('finora:categories-changed', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener(
        'finora:categories-changed',
        refresh
      );
      window.removeEventListener('focus', refresh);
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      );
    };
  }, []);

  return categories;
}