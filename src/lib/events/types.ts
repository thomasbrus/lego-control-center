import { EventType, Status } from "../pybricks/protocol";

interface BaseEvent {
  type: EventType;
  receivedAt: Date;
}

/** Parsed status flags from a StatusReportEvent, keyed by Status enum names */
export type StatusFlags = Partial<Record<keyof typeof Status, boolean>>;

export interface StatusReportEvent extends BaseEvent {
  type: EventType.StatusReport;
  flags: StatusFlags;
  runningProgId: number;
  selectedSlot: number;
}

export interface WriteStdoutEvent extends BaseEvent {
  type: EventType.WriteStdout;
  message: string;
}

export type AnyEvent = StatusReportEvent | WriteStdoutEvent;

export type EventHandler = (event: AnyEvent) => void;
