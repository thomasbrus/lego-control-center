import { Motor } from "../motor/types";
import { Sensor } from "../sensor/type";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
  type?: HubType;
  batteryPercentage?: number;
  motors?: Map<number, Motor>;
  sensors?: Map<number, Sensor>;
  imu?: HubIMU;
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

export interface HubType {
  id: string;
  name: string;
}

export interface HubIMU {
  pitch: number;
  roll: number;
  heading: number;
}
