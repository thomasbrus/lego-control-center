import { useContext } from "react";
import { ModeContext } from "./context";

export function useModeContext() {
  const value = useContext(ModeContext);
  if (!value) throw new Error("ModeContext missing");
  return value;
}
