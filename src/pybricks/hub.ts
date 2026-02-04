import { PybricksHubCapabilities } from "./capabilities";
import { PybricksProgramModule } from "./program-modules";
import { PybricksProgramRegionId } from "./program-regions";
import { AnyDevice } from "@/devices/device";
import { PybricksHubClient } from "./hub-client";
import { PybricksHubStatus } from "./hub-status";
import { HubType } from "@/hubs/type";
import { HubId } from "@/hubs/id";
import { BaseHub } from "@/hubs/hub";
import { HubFirmware } from "@/hubs/firmware";

export interface PybricksHub extends BaseHub {
  id: HubId;
  type?: HubType;
  firmware: HubFirmware.Pybricks;
  name: string;
  status: PybricksHubStatus;
  error?: Error;
  client?: PybricksHubClient;
  loadingState?: { progress: number; module: PybricksProgramModule };
  capabilities?: PybricksHubCapabilities;
  devices?: Map<number, AnyDevice>;
  loadedProgramRegions?: Set<PybricksProgramRegionId>;
  state?: PybricksHubState;
}

interface PybricksHubState {
  batteryPercentage?: number;
}
