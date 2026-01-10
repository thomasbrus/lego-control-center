import { Event } from "@/lib/event/types";

export enum HubStatus {
  Idle = "idle",
  Connecting = "connecting",
  RetrievingCapabilities = "retrieving-capabilities",
  StartingRepl = "starting-repl",
  Ready = "ready",
  Disconnected = "disconnected",
  Error = "error",
}

export interface HubCapabilities {
  maxWriteSize: number;
}

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  status: HubStatus;
  capabilities?: HubCapabilities;
}

export type ReadyHub = Hub & {
  status: HubStatus.Ready;
  capabilities: HubCapabilities;
};

export type EventHandler = (event: Event) => void;
