import { useEffect, useState } from "react";

const LOCAL_STORAGE_SYNC_EVENT = "local-storage-sync";

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
    const syncFromStorage = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          // Intentionally updating state here to sync with localStorage after initial render.
          // This is a valid use case - we need to read external storage after mount
          // to avoid hydration mismatches between server (no localStorage) and client.
          setStoredValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.warn("useLocalStorage: error reading key", key, error);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== key) return;
      syncFromStorage();
    };

    const onLocalSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>;
      if (customEvent.detail?.key !== key) return;
      syncFromStorage();
    };

    syncFromStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalSync);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalSync);
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(
          new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, { detail: { key } }),
        );
      }
    } catch (error) {
      console.warn("useLocalStorage: error setting key", key, error);
    }
  };

  return [storedValue, setValue] as const;
}
