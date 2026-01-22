import { Motor } from "../motor/types";
import { Sensor } from "../sensor/type";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  error?: Error;
  device?: BluetoothDevice;
  type?: HubType;
  capabilities?: HubCapabilities;
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

interface TechnicHubType {
  id: "technic-hub";
  name: "Technic Hub";
}

interface PrimeHubType {
  id: "prime-hub";
  name: "Prime Hub";
}

export type HubType = TechnicHubType | PrimeHubType;

export interface HubIMU {
  pitch: number;
  roll: number;
  heading: number;
}
