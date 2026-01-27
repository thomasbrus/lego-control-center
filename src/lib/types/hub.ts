import { AnyDevice } from "./devices";
import { ConnectedHubClient, HubClient } from "./hub-client";
import { PybricksHubCapabilities } from "./pybricks";

export interface Hub {
  id: HubId;
  type?: HubType;
  name: string;
  status: HubStatus;
  error?: Error;
  client?: HubClient;
  loadingState?: { progress: number; modules: string[] };
  capabilities?: PybricksHubCapabilities;
  devices?: Map<number, AnyDevice>;
  loadedModules?: Set<string>;
  state?: HubState;
}

export type ConnectedHub = Hub & { client: ConnectedHubClient };

export type HubId = string;

export enum HubStatus {
  Idle,
  Error,
  Connecting,
  Connected,
  RetrievingHubType,
  StartingEventStream,
  RetrievingCapabilities,
  StartingRepl,
  LoadingModule,
  Ready,
}

export enum HubType {
  TechnicHub = "technic-hub",
  PrimeHub = "prime-hub",
  InventorHub = "inventor-hub",
}

export interface HubState {
  batteryPercentage?: number;
  imu?: HubIMU;
}

export interface HubIMU {
  pitch: number;
  roll: number;
  heading: number;
}
