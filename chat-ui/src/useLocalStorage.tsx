import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      return typeof initialValue === "function"
        ? (initialValue as Function)()
        : initialValue;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error("Could not parse localStorage value", error);
      return typeof initialValue === "function"
        ? (initialValue as Function)()
        : initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Could not save to localStorage", error);
    }
  }, [value, key]);

  const setStoredValue = (newValue: T | ((prevValue: T) => T)) => {
    setValue((prevValue: T) => {
      if (typeof newValue === "function") {
        newValue = (newValue as Function)(prevValue);
      }

      try {
        localStorage.setItem(key, JSON.stringify(newValue as T));
      } catch (error) {
        console.error("Could not save to localStorage", error);
      }

      return newValue as T;
    });
  };

  return [value, setStoredValue] as const;
}

export { useLocalStorage };
