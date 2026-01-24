import { useRouter } from "@tanstack/react-router";
import { createContext } from "react";

interface ModeContextValue {
  simulated: boolean;
  debug: boolean;
  setSimulated: (value: boolean) => void;
  setDebug: (value: boolean) => void;
}

export const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.state.location.search);
  const mode = searchParams.get("mode") || "live";
  const debug = searchParams.get("level") === "debug";
  const setSimulated = (value: boolean) => updateSearchParam("mode", value ? "simulated" : false);
  const setDebug = (value: boolean) => updateSearchParam("level", value ? "debug" : false);

  return <ModeContext.Provider value={{ simulated: mode === "simulated", setSimulated, debug, setDebug }}>{children}</ModeContext.Provider>;
}

function updateSearchParam(key: string, value: string | false) {
  const searchParams = new URLSearchParams(window.location.search);
  if (value) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
  window.location.search = searchParams.toString();
}
