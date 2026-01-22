import { SensorType } from "../sensor/type";
import { TelemetryEvent } from "./types";

/**
 * Parses a telemetry event from raw AppData bytes according to protocol.
 */
export function parseTelemetryEvent(buffer: ArrayBuffer): TelemetryEvent {
  const view = new DataView(buffer);

  const telemetryType = view.getUint8(0);

  switch (telemetryType) {
    case 0x11: // HUB_STATE
      // <BB: TelemetryType, BatteryPercentage
      return {
        type: "HubState",
        batteryPercentage: view.getUint8(1),
      };
    case 0x12: // HUB_IMU
      // <Bhhh: TelemetryType, Pitch, Roll, Yaw
      return {
        type: "HubIMU",
        pitch: view.getInt16(1, true),
        roll: view.getInt16(3, true),
        heading: view.getInt16(5, true),
      };
    case 0x20: // MOTOR_LIMITS
      // <BBhhh: TelemetryType, Port, Speed, Acceleration, Torque
      return {
        type: "MotorLimits",
        port: view.getUint8(1),
        speed: view.getInt16(2, true),
        acceleration: view.getInt16(4, true),
        torque: view.getInt16(6, true),
      };
    case 0x21: // MOTOR_STATE
      // <BBhhh?: TelemetryType, Port, Angle, Speed, Load, IsStalled
      return {
        type: "MotorState",
        port: view.getUint8(1),
        angle: view.getInt16(2, true),
        speed: view.getInt16(4, true),
        load: view.getInt16(6, true),
        isStalled: !!view.getUint8(8),
      };
    case 0x30: // SENSOR_STATE
      // <BBBhhhh: TelemetryType, Port, SensorType, Value0, Value1, Value2, Value3
      return {
        type: "SensorState",
        port: view.getUint8(1),
        sensorType: parseSensorType(view.getUint8(2)),
        value0: view.getInt16(3, true),
        value1: view.getInt16(5, true),
        value2: view.getInt16(7, true),
        value3: view.getInt16(9, true),
      };
    default:
      throw new Error("Unknown telemetry type: " + telemetryType);
  }
}

function parseSensorType(value: number): SensorType {
  switch (value) {
    case 2:
      return { id: "color-distance-sensor", name: "Color Distance Sensor" };
    default:
      throw new Error("Unknown sensor type: " + value);
  }
}
