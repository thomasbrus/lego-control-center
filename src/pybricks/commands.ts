export enum PybricksCommandType {
  StopUserProgram = 0,
  StartUserProgram = 1,
  StartRepl = 2,
  WriteUserProgramMeta = 3,
  WriteUserRam = 4,
  ResetInUpdateMode = 5,
  WriteStdin = 6,
  WriteAppData = 7,
}

export interface PybricksCommand {
  type: PybricksCommandType;
}

export interface PybricksWriteStdinCommand extends PybricksCommand {
  type: PybricksCommandType.WriteStdin;
  text: string;
}

export interface PybricksWriteAppDataCommand extends PybricksCommand {
  type: PybricksCommandType.WriteAppData;
  data: Uint8Array;
}

export type AnyPybricksCommand = PybricksWriteStdinCommand | PybricksWriteAppDataCommand;

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
