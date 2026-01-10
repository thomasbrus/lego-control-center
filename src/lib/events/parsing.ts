import { decodeMessage } from "@/lib/messages/encoding";
import { EventType, getEventType, parseStatusReport, parseWriteStdout } from "@/lib/pybricks/protocol";
import { AnyEvent } from "./types";

/**
 * Parses a raw notification DataView into a typed event.
 * Returns null for unknown event types.
 */
export function parseNotification(data: DataView): AnyEvent | null {
  const eventType = getEventType(data);

  switch (eventType) {
    case EventType.StatusReport: {
      const { flags, runningProgId, selectedSlot } = parseStatusReport(data);
      return { type: EventType.StatusReport, flags, runningProgId, selectedSlot };
    }
    case EventType.WriteStdout: {
      const buffer = parseWriteStdout(data);
      const message = decodeMessage(new Uint8Array(buffer));
      return { type: EventType.WriteStdout, message };
    }
    default:
      return null;
  }
}
