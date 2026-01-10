import { decodeMessage } from "@/lib/messages/encoding";
import { EventType, getEventType, parseStatusReport, parseWriteStdout, Status, statusToFlag } from "@/lib/pybricks/protocol";
import { AnyEvent, StatusFlags } from "./types";

/**
 * Parses the raw status flags number into a structured object.
 * @param rawFlags The raw status flags as a bit field.
 * @returns An object with boolean properties for each status flag, keyed by Status enum names.
 */
export function parseStatusFlags(rawFlags: number): StatusFlags {
  const entries = Object.keys(Status)
    .filter((key) => isNaN(Number(key)))
    .map((key) => [key, (rawFlags & statusToFlag(Status[key as keyof typeof Status])) !== 0]);
  return Object.fromEntries(entries) as StatusFlags;
}

/**
 * Parses a raw notification DataView into a typed event.
 * Returns null for unknown event types.
 */
export function parseNotification(data: DataView, receivedAt: Date): AnyEvent | null {
  const eventType = getEventType(data);

  switch (eventType) {
    case EventType.StatusReport: {
      const { flags: rawFlags, runningProgId, selectedSlot } = parseStatusReport(data);
      const flags = parseStatusFlags(rawFlags);
      return { type: EventType.StatusReport, flags, runningProgId, selectedSlot, receivedAt };
    }
    case EventType.WriteStdout: {
      const buffer = parseWriteStdout(data);
      const message = decodeMessage(new Uint8Array(buffer));
      return { type: EventType.WriteStdout, message, receivedAt };
    }
    default:
      return null;
  }
}
