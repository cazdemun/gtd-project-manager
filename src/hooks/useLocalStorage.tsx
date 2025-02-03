import { useCallback, useEffect, useMemo, useState } from 'react';

type ValueSetterParam<T> = T | ((prev: T) => T)
type ValueSetter<T> = (value: ValueSetterParam<T>) => void

function useLocalStorage<T>(key: string | undefined, initialValue: T): [T, ValueSetter<T>] {
  // Retrieve the value from local storage or use the initial value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState<'bhidr' | 'ahidr' | 'sync'>('bhidr');

  useEffect(() => {
    if (key && loaded === 'bhidr') setLoaded('ahidr');
  }, [key, loaded]);

  const value = useMemo(() => {
    if (!key || loaded === 'bhidr') {
      // At this point storedValue === initialValue
      // Since we need to make hydration happey, we need to return the storedValue/initialValue
      // first, until the useEffect sets loaded to 'ahidr' and the component re-renders
      return storedValue;
    }
    if (loaded === 'ahidr') {
      // On its first re-render we fetch the localStorage value, but doing this every render is unnecessary
      // So we set loaded to 'sync' while setting the value, and only fetch the value if loaded is not 'sync'
      try {
        const item = window.localStorage.getItem(key);
        const newValue = item ? JSON.parse(item) : storedValue;
        setStoredValue(newValue);
        setLoaded('sync');
        return newValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return storedValue;
      }
    }
    // If loaded is 'sync', we can just return the storedValue
    return storedValue;
  }, [key, loaded, storedValue]);

  const setValue = useCallback((_value: ValueSetterParam<T>) => {
    setStoredValue((prevValue) => {
      const valueToStore = _value instanceof Function ? _value(prevValue) : _value;
      if (!key) console.log('(useLocalStorage) 2 No key provided for localStorage hook, returning initialValue.', initialValue);
      if (!key) return valueToStore;

      try {
        if (valueToStore === undefined) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Failsafe in case the hook is used before the localStorage value is set
        setLoaded('sync');
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }

      return valueToStore;
    });
  }, [key, initialValue]);

  return [value, setValue];
}

export default useLocalStorage;