import { TelemetryEvent } from "./types";

/**
 * Parses a telemetry event from raw AppData bytes according to protocol.
 */
export function parseTelemetryEvent(buffer: ArrayBuffer): TelemetryEvent {
  const view = new DataView(buffer);

  const telemetryType = view.getUint8(0);

  switch (telemetryType) {
    case 0x10: // HUB_INFO
      // <BB: TelemetryType, HubType
      return {
        type: "HubInfo",
        hubType: view.getUint8(1),
      };
    case 0x11: // HUB_STATUS
      // <BB: TelemetryType, BatteryPercentage
      return {
        type: "HubPhase",
        batteryPercentage: view.getUint8(1),
      };
    case 0x12: // HUB_IMU
      // <Bhhh: TelemetryType, Pitch, Roll, Yaw
      return {
        type: "HubIMU",
        pitch: view.getInt16(1, true),
        roll: view.getInt16(3, true),
        yaw: view.getInt16(5, true),
      };
    case 0x20: // MOTOR_LIMITS
      // <BBhhh: TelemetryType, PortIndex, Speed, Acceleration, Torque
      return {
        type: "MotorLimits",
        portIndex: view.getUint8(1),
        speed: view.getInt16(2, true),
        acceleration: view.getInt16(4, true),
        torque: view.getInt16(6, true),
      };
    case 0x21: // MOTOR_STATUS
      // <BBhhh?: TelemetryType, PortIndex, Angle, Speed, Load, IsStalled
      return {
        type: "MotorStatus",
        portIndex: view.getUint8(1),
        angle: view.getInt16(2, true),
        speed: view.getInt16(4, true),
        load: view.getInt16(6, true),
        isStalled: !!view.getUint8(8),
      };
    case 0x30: // SENSOR_STATUS
      // <BBBhhhh: TelemetryType, SensorType, PortIndex, Distance, Hue, Saturation, Value
      return {
        type: "SensorStatus",
        portIndex: view.getUint8(1),
        sensorType: view.getUint8(2),
        distance: view.getInt16(3, true),
        hue: view.getInt16(5, true),
        saturation: view.getInt16(7, true),
        value: view.getInt16(9, true),
      };
    default:
      throw new Error("Unknown telemetry type: " + telemetryType);
  }
}
