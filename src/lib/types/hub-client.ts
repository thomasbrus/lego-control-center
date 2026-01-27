import { HubType } from "./hub";
import { HubEventListener, HubEventType } from "./hub-event";
import { PybricksHubCapabilities } from "./pybricks";

export interface HubClient {
  getHubType(): Promise<HubType>;
  getHubCapabilities(): Promise<PybricksHubCapabilities>;
  startRepl(): Promise<void>;
  startEventStream(): Promise<void>;
  addEventListener(type: HubEventType, callback: HubEventListener): void;
  removeEventListener(type: HubEventType, callback: HubEventListener): void;
  isConnected: boolean;
  disconnect(): void;
}

export type HubClientCreateOptions = {
  onDisconnect: () => void;
};

export type HubClientCreateReturn = Promise<HubClient>;

export type ConnectedHubClient = HubClient & {
  isConnected: true;
};
