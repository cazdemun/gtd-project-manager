import { useCallback, useState } from 'react';

function useLocalStorage<T>(key: string | undefined, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Retrieve the value from local storage or use the initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!key) console.log('(useLocalStorage) No key provided for localStorage hook, using initialValue.');
    if (!key) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Memoize setValue so its identity is stable between renders.
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        if (!key) console.log('(useLocalStorage) No key provided for localStorage hook, returning initialValue.');
        if (!key) return valueToStore;

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;