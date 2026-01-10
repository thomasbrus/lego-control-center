import { EventType } from "../pybricks/protocol";

interface BaseEvent {
  type: EventType;
  receivedAt: Date;
}

export interface StatusReportEvent extends BaseEvent {
  type: EventType.StatusReport;
  flags: number;
  runningProgId: number;
  selectedSlot: number;
}

export interface WriteStdoutEvent extends BaseEvent {
  type: EventType.WriteStdout;
  message: string;
}

export type AnyEvent = StatusReportEvent | WriteStdoutEvent;
