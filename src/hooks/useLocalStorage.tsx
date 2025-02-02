import { useCallback, useState } from 'react';

type InitialValue<T> = T | undefined
type ValueSetter<T> = (value: InitialValue<T> | ((prev: InitialValue<T>) => InitialValue<T>)) => void

function useLocalStorage<T>(key: string | undefined, initialValue: InitialValue<T>): [InitialValue<T>, ValueSetter<T>] {
  // Retrieve the value from local storage or use the initial value
  const [storedValue, setStoredValue] = useState<InitialValue<T>>(() => {
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
    (value: InitialValue<T> | ((prev: InitialValue<T>) => InitialValue<T>)) => {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        if (!key) console.log('(useLocalStorage) No key provided for localStorage hook, returning initialValue.');
        if (!key) return valueToStore;
        console.log(`(useLocalStorage) Setting localStorage key "${key}" to:`, valueToStore);
        try {
          if (valueToStore === undefined) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, JSON.stringify(valueToStore));
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