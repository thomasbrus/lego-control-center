import { createContext, useCallback } from "react";

interface ModeContextValue {
  simulated: boolean;
  setSimulated: (value: boolean) => void;
}

export const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ mode, children }: { mode: string; children: React.ReactNode }) {
  const setSimulated = useCallback((value: boolean) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set("mode", "simulated");
    } else {
      searchParams.delete("mode");
    }
    window.location.search = searchParams.toString();
  }, []);

  return <ModeContext.Provider value={{ simulated: mode === "simulated", setSimulated }}>{children}</ModeContext.Provider>;
}
