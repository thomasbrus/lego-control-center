export type TelemetryType = "HubStatus" | "HubIMU" | "MotorStatus" | "SensorStatus";

export interface HubStatusTelemetry {
  type: "HubStatus";
  batteryPercentage: number;
}

export interface HubIMUTelemetry {
  type: "HubIMU";
  pitch: number;
  roll: number;
  yaw: number;
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

export type TelemetryEvent = HubStatusTelemetry | HubIMUTelemetry | MotorStatusTelemetry | SensorStatusTelemetry;
