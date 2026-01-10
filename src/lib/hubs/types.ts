import { StatusFlags } from "@/lib/events/types";

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  status: HubStatus;
  statusFlags?: StatusFlags;
  capabilities?: HubCapabilities;
}

export type ReadyHub = Hub & {
  status: HubStatus.Ready;
  capabilities: HubCapabilities;
};

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
