import { TelemetryEvent } from "./types";

/**
 * Parses a telemetry event from raw AppData bytes.
 *
 * Format: [HubBattery(B), ...4xMotorAngle(h), ...4xMotorSpeed(h)]
 * Struct format: "<BhhhhhhhhB"
 *
 * @param buffer The raw ArrayBuffer from WriteAppData event
 * @returns Parsed TelemetryEvent
 */
export function parseTelemetryEvent(buffer: ArrayBuffer): TelemetryEvent {
  const view = new DataView(buffer);

  // Parse according to protocol format (little-endian)
  const hubBattery = view.getUint8(0); // B - unsigned byte

  // 4x Motor angles (h - signed 16-bit int)
  const motorAngles = [view.getInt16(1, true), view.getInt16(3, true), view.getInt16(5, true), view.getInt16(7, true)];

  // 4x Motor speeds (h - signed 16-bit int)
  const motorSpeeds = [view.getInt16(9, true), view.getInt16(11, true), view.getInt16(13, true), view.getInt16(15, true)];

  return {
    hubBattery,
    motorAngles,
    motorSpeeds,
  };
}
