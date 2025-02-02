import { useState } from "react";
import useLocalStorage from "./useLocalStorage";

function useConditionalLocalStorage<T>(
  storageKey: string | undefined,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Call both hooks unconditionally
  const [localStorageState, setLocalStorageState] = useLocalStorage(storageKey, initialValue);
  const [state, setState] = useState(initialValue);

  // Return the appropriate pair.
  // Note: This assumes that if storageKey is falsy, the useLocalStorage result is ignored.
  return storageKey ? [localStorageState, setLocalStorageState] : [state, setState];
}

export default useConditionalLocalStorage;
