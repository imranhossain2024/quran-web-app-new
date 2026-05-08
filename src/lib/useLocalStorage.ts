import { useEffect, useState } from "react";

/**
 * Hook to persist a value in localStorage.
 * Returns [value, setValue] where setValue updates both state and storage.
 * 
 * Note: To prevent hydration mismatches between SSR and client, this hook
 * returns the initialValue until the component is mounted on the client side.
 * After mounting, it reads from localStorage and updates the value.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Always use initialValue during SSR and initial client render
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, read from localStorage (client-side only)
  // This effect runs once on mount to hydrate the state from localStorage,
  // ensuring SSR and initial client render are consistent (both use initialValue)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Intentionally updating state here to sync with localStorage after initial render.
        // This is a valid use case - we need to read external storage after mount
        // to avoid hydration mismatches between server (no localStorage) and client.
        // eslint-disable-next-line
        setStoredValue(JSON.parse(item) as T);
      }
    } catch (error) {
      console.warn("useLocalStorage: error reading key", key, error);
    }
  }, []); // Only run on mount, not on every key change

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn("useLocalStorage: error setting key", key, error);
    }
  };

  return [storedValue, setValue] as const;
}
