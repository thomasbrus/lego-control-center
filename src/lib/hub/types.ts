import { Motor } from "../motor/types";
import { Sensor } from "../sensor/type";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  error?: Error;
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
  Error,
  Connecting,
  Connected,
  RetrievingDeviceInfo,
  StartingNotifications,
  RetrievingCapabilities,
  StartingRepl,
  LaunchingProgram,
  Ready,
  Running,
}

export interface HubCapabilities {
  maxWriteSize: number;
  flags: number;
  maxUserProgramSize: number;
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
