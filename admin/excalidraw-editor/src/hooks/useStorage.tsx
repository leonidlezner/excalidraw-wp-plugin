import { useCallback } from "react";

export default function useStorage(name: string, permanent: boolean) {
  const storage = permanent ? window.localStorage : window.sessionStorage;

  /*   const loadValue = (): string | null => {
    return storage.getItem(name);
  }; */

  const loadValue = useCallback(() => {
    return storage.getItem(name);
  }, [storage, name]);

  const removeValue = (): void => {
    storage.removeItem(name);
  };

  const storeValue = useCallback(
    (newValue: string) => {
      storage.setItem(name, newValue);
    },
    [storage, name]
  );

  return [loadValue, storeValue, removeValue];
}
