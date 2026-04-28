import { useEffect, useState } from "react";

/**
 * Subscribe to localStorage changes from any tab + same-tab updates
 * dispatched by the storage helper. Returns a counter that increments
 * on every change so consumers can re-derive state.
 */
export function useStorageVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener("store-change", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("store-change", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  return version;
}
