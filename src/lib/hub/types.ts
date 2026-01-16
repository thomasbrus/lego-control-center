export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
}

export enum HubStatus {
  Idle,
  Connecting,
  Connected,
  StartingNotifications,
  RetrievingCapabilities,
  StartingRepl,
  LaunchingProgram,
  Ready,
  Running,
  Error,
}

export interface HubCapabilities {
  maxWriteSize: number;
}
