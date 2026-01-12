import { TelemetryEvent } from "./types";

/**
 * Parses a telemetry event from raw AppData bytes.
 *
 * Format: [Time(I), HubBattery(B), ...4xMotorAngle(h), ...4xMotorSpeed(h), LightStatus(B)]
 * Struct format: "<IBhhhhhhhhB"
 *
 * @param buffer The raw ArrayBuffer from WriteAppData event
 * @returns Parsed TelemetryEvent
 */
export function parseTelemetryEvent(buffer: ArrayBuffer): TelemetryEvent {
  const view = new DataView(buffer);

  // Parse according to protocol format (little-endian)
  const time = view.getUint32(0, true); // I - unsigned 32-bit int
  const hubBattery = view.getUint8(4); // B - unsigned byte

  // 4x Motor angles (h - signed 16-bit int)
  const motorAngles = [view.getInt16(5, true), view.getInt16(7, true), view.getInt16(9, true), view.getInt16(11, true)];

  // 4x Motor speeds (h - signed 16-bit int)
  const motorSpeeds = [view.getInt16(13, true), view.getInt16(15, true), view.getInt16(17, true), view.getInt16(19, true)];

  const lightStatus = view.getUint8(21); // B - unsigned byte

  return {
    time,
    hubBattery,
    motorAngles,
    motorSpeeds,
    lightStatus,
  };
}
