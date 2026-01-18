import { HubType } from "../hub/types";
import { SensorType } from "../sensor/type";

export type TelemetryType = "HubInfo" | "HubState" | "HubIMU" | "MotorLimits" | "MotorState" | "SensorState";

export interface HubInfoTelemetry {
  type: "HubInfo";
  hubType: HubType;
}

export interface HubStateTelemetry {
  type: "HubState";
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
  port: number;
  speed: number;
  acceleration: number;
  torque: number;
}

export interface MotorStateTelemetry {
  type: "MotorState";
  port: number;
  angle: number;
  speed: number;
  load: number;
  isStalled: boolean;
}

export interface SensorStateTelemetry {
  type: "SensorState";
  port: number;
  sensorType: SensorType;
  value0: number;
  value1: number;
  value2: number;
  value3: number;
}

export type TelemetryEvent =
  | HubInfoTelemetry
  | HubStateTelemetry
  | HubIMUTelemetry
  | MotorLimitsTelemetry
  | MotorStateTelemetry
  | SensorStateTelemetry;
