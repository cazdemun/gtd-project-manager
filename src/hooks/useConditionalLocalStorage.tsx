import { useCallback, useMemo, useState } from "react";
import useLocalStorage from "./useLocalStorage";

type ValueSetterParam<T> = T | ((prev: T) => T)
type ValueSetter<T> = (value: ValueSetterParam<T>) => void

function useConditionalLocalStorage<T>(key: string | undefined, initialValue: T): [T, ValueSetter<T>] {
  // Call both hooks unconditionally
  const [localStorageState, setLocalStorageState] = useLocalStorage(key, initialValue);
  const [state, setState] = useState(initialValue);

  const value = useMemo(() => key ? localStorageState : state, [key, localStorageState, state]);
  const setValue = useCallback((value: ValueSetterParam<T>) => {
    if (key) setLocalStorageState(value);
    else setState(value);
  }, [key, setState, setLocalStorageState]);

  return [value, setValue];
}

export default useConditionalLocalStorage;
