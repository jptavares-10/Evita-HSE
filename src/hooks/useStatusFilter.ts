import { useCallback, useState } from "react";

/**
 * Single source of truth for the "situação" filter of a module.
 * The KPI cards and the status select share this state, so they can never
 * contradict each other (the old pattern kept two states that cancelled out).
 */
export function useStatusFilter(initial: string | null = null) {
  const [status, setStatus] = useState<string | null>(initial);

  /** KPI card click: toggles off when the same card is clicked again. */
  const toggle = useCallback((next: string | null) => {
    setStatus((cur) => (next !== null && cur === next ? null : next));
  }, []);

  /** Select change: "all" clears the filter. */
  const selectValue = status ?? "all";
  const onSelectChange = useCallback((v: string) => {
    setStatus(v === "all" ? null : v);
  }, []);

  const clear = useCallback(() => setStatus(null), []);

  return { status, setStatus, toggle, selectValue, onSelectChange, clear };
}
