import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ApplicationStoreState {
  mode: ApplicationMode;
  level: ApplicationLevel;
  setSimulated: (value: boolean) => void;
  setDebug: (value: boolean) => void;
}

export const applicationStore = create<ApplicationStoreState>()(
  immer((set) => ({
    mode: ApplicationMode.Live,
    level: ApplicationLevel.Info,

    setSimulated: (value: boolean) =>
      set((state) => {
        state.mode = value ? ApplicationMode.Simulated : ApplicationMode.Live;
      }),

    setDebug: (value: boolean) =>
      set((state) => {
        state.level = value ? ApplicationLevel.Debug : ApplicationLevel.Info;
      }),
  })),
);

export enum ApplicationMode {
  Live = "live",
  Simulated = "simulated",
}

export enum ApplicationLevel {
  Debug = "debug",
  Info = "info",
}
