import { HubType } from "../hub/types";

export type TelemetryType = "HubInfo" | "HubPhase" | "HubIMU" | "MotorLimits" | "MotorStatus" | "SensorStatus";

export interface HubInfoTelemetry {
  type: "HubInfo";
  hubType: HubType;
}

export interface HubPhaseTelemetry {
  type: "HubPhase";
  batteryPercentage: number;
}

export interface HubIMUTelemetry {
  type: "HubIMU";
  pitch: number;
  roll: number;
  heading: number;
}

export interface MotorLimitsTelemetry {
  type: "MotorLimits";
  portIndex: number;
  speed: number;
  acceleration: number;
  torque: number;
}

export interface MotorStatusTelemetry {
  type: "MotorStatus";
  portIndex: number;
  angle: number;
  speed: number;
  load: number;
  isStalled: boolean;
}

export interface SensorStatusTelemetry {
  type: "SensorStatus";
  portIndex: number;
  sensorType: number;
  distance: number;
  hue: number;
  saturation: number;
  value: number;
}

export type TelemetryEvent =
  | HubInfoTelemetry
  | HubPhaseTelemetry
  | HubIMUTelemetry
  | MotorLimitsTelemetry
  | MotorStatusTelemetry
  | SensorStatusTelemetry;
