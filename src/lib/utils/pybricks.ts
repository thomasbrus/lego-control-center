import {
  AnyPybricksCommand,
  AnyPybricksEvent,
  PybricksCommandType,
  PybricksEventType,
  PybricksStatus,
  PybricksStatusFlags,
  PybricksStatusFlagsKey,
  PybricksStatusReport,
} from "../types/pybricks";

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

export function parsePybricksStatusReport(view: DataView): PybricksStatusReport {
  return {
    flags: parseStatusFlags(view.getUint32(1, true)),
    runningProgId: view.byteLength > 5 ? view.getUint8(5) : 0,
    selectedSlot: view.byteLength > 6 ? view.getUint8(6) : 0,
  };
}

function parseStatusFlags(rawFlags: number): PybricksStatusFlags {
  const flags: PybricksStatusFlags = {};

  for (const [key, value] of Object.entries(PybricksStatus)) {
    if (typeof value === "number") {
      flags[key as PybricksStatusFlagsKey] = (rawFlags & (1 << value)) !== 0;
    }
  }

  return flags;
}

export function encodePybricksCommand(command: AnyPybricksCommand) {
  switch (command.type) {
    case PybricksCommandType.WriteStdin: {
      const textEncoder = new TextEncoder();
      const textData = textEncoder.encode(command.text);
      const payload = new Uint8Array(1 + textData.length);
      const view = new DataView(payload.buffer);
      view.setUint8(0, PybricksCommandType.WriteStdin);
      payload.set(textData, 1);
      return payload;
    }
    case PybricksCommandType.WriteAppData: {
      const payload = new Uint8Array(1 + command.data.length);
      const view = new DataView(payload.buffer);
      view.setUint8(0, PybricksCommandType.WriteAppData);
      payload.set(command.data, 1);
      return payload;
    }
  }
}
