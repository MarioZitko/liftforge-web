import { useCallback, useState } from "react";

const SESSION_KEY = "liftforge-program-view";

export function useProgramView() {
  const [view, setViewState] = useState<"list" | "grid">(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored === "list" || stored === "grid" ? stored : "grid";
  });

  const setView = useCallback((next: "list" | "grid") => {
    sessionStorage.setItem(SESSION_KEY, next);
    setViewState(next);
  }, []);

  return [view, setView] as const;
}
