import { parsePybricksStatusReport, PybricksStatusReport } from "./status-report";

export enum PybricksEventType {
  StatusReport = 0,
  WriteStdout = 1,
  WriteAppData = 2,
}

export interface PybricksEvent {
  type: PybricksEventType;
}

export interface PybricksStatusReportEvent extends PybricksEvent {
  type: PybricksEventType.StatusReport;
  statusReport: PybricksStatusReport;
}

export interface PybricksWriteStdoutEvent extends PybricksEvent {
  type: PybricksEventType.WriteStdout;
  text: string;
}

export interface PybricksWriteAppDataEvent extends PybricksEvent {
  type: PybricksEventType.WriteAppData;
  data: Uint8Array<ArrayBuffer>;
}

export type AnyPybricksEvent = PybricksStatusReportEvent | PybricksWriteStdoutEvent | PybricksWriteAppDataEvent;

const textDecoder = new TextDecoder();

export function decodePybricksEvent(view: DataView): AnyPybricksEvent {
  const type = view.getUint8(0) as PybricksEventType;
  const payloadOffset = view.byteOffset + 1;
  const payloadLength = view.byteLength - 1;

  switch (type) {
    case PybricksEventType.StatusReport: {
      return { type, statusReport: parsePybricksStatusReport(view) };
    }

    case PybricksEventType.WriteStdout: {
      const payload = new Uint8Array(view.buffer, payloadOffset, payloadLength);
      return { type, text: textDecoder.decode(payload) };
    }

    case PybricksEventType.WriteAppData: {
      const data = new Uint8Array(view.buffer, payloadOffset, payloadLength).slice();
      return { type, data };
    }

    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unhandled event type: ${_exhaustiveCheck}`);
    }
  }
}
