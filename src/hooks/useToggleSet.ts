import { useCallback, useState } from "react";

/**
 * Manages a Set<number> with toggle, add, and bulk-init operations.
 * Useful for tracking which collapsible items are open.
 */
export function useToggleSet(initial: number[] = []) {
  const [set, setSet] = useState<Set<number>>(() => new Set(initial));

  const toggle = useCallback((id: number) => {
    setSet((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const add = useCallback((id: number) => {
    setSet((s) => new Set(s).add(id));
  }, []);

  const init = useCallback((ids: number[]) => {
    setSet(new Set(ids));
  }, []);

  return { set, toggle, add, init } as const;
}
