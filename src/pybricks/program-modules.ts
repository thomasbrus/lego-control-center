import { PybricksProgramRegionId } from "./program-regions";

export interface PybricksProgramModule {
  name: string;
  regions: PybricksProgramRegionId[];
  restartRunner: boolean;
}

export const lightCommandsProgramModule: PybricksProgramModule = {
  name: "Light Commands",
  regions: [PybricksProgramRegionId.LightCommands, PybricksProgramRegionId.StdinProcessing],
  restartRunner: true,
};

export const systemCommandsProgramModule: PybricksProgramModule = {
  name: "System Commands",
  regions: [PybricksProgramRegionId.SystemCommands, PybricksProgramRegionId.StdinProcessing],
  restartRunner: false,
};
