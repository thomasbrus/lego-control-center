import { EventType } from "../pybricks/protocol";

export function getEventTypeName(type: EventType): string {
  switch (type) {
    case EventType.StatusReport:
      return "StatusReport";
    case EventType.WriteStdout:
      return "WriteStdout";
    default:
      return "Unknown";
  }
}
