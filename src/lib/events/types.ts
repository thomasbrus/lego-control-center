import { EventType } from "../pybricks/protocol";

export interface StatusReportEvent {
  type: EventType.StatusReport;
  flags: number;
  runningProgId: number;
  selectedSlot: number;
}

export interface WriteStdoutEvent {
  type: EventType.WriteStdout;
  message: string;
}

export type AnyEvent = StatusReportEvent | WriteStdoutEvent;
