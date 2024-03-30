import { useState } from "react";

export default function useStorageState<T>(
  defaultValue: T,
  name: string,
  permanent: boolean,
  serializeCallback: Function | undefined = undefined
) {
  const storage = permanent ? window.localStorage : window.sessionStorage;

  const loadValue = (name: string) => {
    const strValue = storage.getItem(name);
    return strValue ? JSON.parse(strValue) : null;
  };

  const [value, setValue] = useState(() => {
    const saved = loadValue(name);

    // Nothing stored, return the default value
    if (!saved) {
      return defaultValue;
    }

    // Both values are arrays, check their lenght
    if (
      Array.isArray(saved) &&
      Array.isArray(defaultValue) &&
      defaultValue.length > 0
    ) {
      if (saved.length === defaultValue.length) {
        return saved;
      } else {
        return defaultValue;
      }
    }

    // Both values are dicts, check their keys
    if (
      typeof saved === "object" &&
      defaultValue &&
      typeof defaultValue === "object" &&
      Object.keys(defaultValue as object).length > 0
    ) {
      return { ...defaultValue, ...saved };
    }

    return saved;
  });

  const storeValue = (name: string, value: T) => {
    if (serializeCallback) {
      storage.setItem(name, serializeCallback(value));
    } else {
      storage.setItem(name, JSON.stringify(value));
    }
  };

  const setValueAndSave = (newValue: T) => {
    if (newValue instanceof Function) {
      setValue((preValue: T) => {
        const val = newValue(preValue);
        storeValue(name, val);
        return val;
      });
    } else {
      storeValue(name, newValue);
      setValue(newValue);
    }
  };

  const deleteValue = () => {
    storage.removeItem(name);
  };

  const reloadValue = () => {
    const saved = loadValue(name);
    setValue(saved);
  };

  return [value, setValueAndSave, deleteValue, reloadValue];
}
