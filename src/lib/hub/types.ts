import { ConnectedBluetoothDevice } from "../device/types";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
}

export type ConnectedHub = Hub & { device: ConnectedBluetoothDevice };
export type WithCapabilitiesHub = ConnectedHub & { capabilities: HubCapabilities };

export enum HubStatus {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
  StartingNotifications = "starting-notifications",
  RetrievingCapabilities = "retrieving-capabilities",
  StartingRepl = "starting-repl",
  UploadingProgram = "uploading-program",
  StartingProgram = "starting-program",
  Ready = "ready",
  Error = "error",
}

export interface HubCapabilities {
  maxWriteSize: number;
}
