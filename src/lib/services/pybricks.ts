import { PybricksBuiltinProgramId, PybricksCommandType } from "../types/pybricks";

export function createWriteStdinCommand(payload: ArrayBuffer): Uint8Array {
  const command = new Uint8Array(1 + payload.byteLength);
  const view = new DataView(command.buffer);
  view.setUint8(0, PybricksCommandType.WriteStdin);
  command.set(new Uint8Array(payload), 1);
  return command;
}

export function createStartUserProgramCommand(progId: number | PybricksBuiltinProgramId) {
  const msg = new Uint8Array(2);
  msg[0] = PybricksCommandType.StartUserProgram;
  msg[1] = progId;
  return msg;
}

export function createStartReplUserProgramCommand() {
  return createStartUserProgramCommand(PybricksBuiltinProgramId.REPL);
}
