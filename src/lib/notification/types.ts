import { EventType, Status } from "../pybricks/protocol";

interface BaseNotification {
  eventType: EventType;
  receivedAt: Date;
}

export type StatusFlags = Partial<Record<keyof typeof Status, boolean>>;

export interface StatusReportNotification extends BaseNotification {
  eventType: EventType.StatusReport;
  flags: StatusFlags;
  runningProgId: number;
  selectedSlot: number;
}

export interface WriteStdoutNotification extends BaseNotification {
  eventType: EventType.WriteStdout;
  message: string;
}

export interface WriteAppDataNotification extends BaseNotification {
  eventType: EventType.WriteAppData;
  data: ArrayBuffer;
}

export type AnyNotification = StatusReportNotification | WriteStdoutNotification | WriteAppDataNotification;

export type NotificationHandler = (event: AnyNotification) => void;
