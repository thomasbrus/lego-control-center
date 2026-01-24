export interface HubDevicesTelemetry {
  type: "HubDevices";
  devices: (null | "motor" | "color-distance-sensor")[];
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

export interface ColorDistanceSensorStateTelemetry {
  type: "ColorDistanceSensorState";
  port: number;
  color: { hue: number; saturation: number; value: number };
  distance: number;
}

export type TelemetryEvent =
  | HubDevicesTelemetry
  | HubStateTelemetry
  | HubIMUTelemetry
  | MotorLimitsTelemetry
  | MotorStateTelemetry
  | ColorDistanceSensorStateTelemetry;

export type TelemetryType = TelemetryEvent["type"];
