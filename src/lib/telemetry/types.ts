export type TelemetryType = "HubInfo" | "HubPhase" | "HubIMU" | "MotorLimits" | "MotorStatus" | "SensorStatus";

export interface HubInfoTelemetry {
  type: "HubInfo";
  hubType: number;
}

export interface HubPhaseTelemetry {
  type: "HubPhase";
  batteryPercentage: number;
}

export interface HubIMUTelemetry {
  type: "HubIMU";
  pitch: number;
  roll: number;
  yaw: number;
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
