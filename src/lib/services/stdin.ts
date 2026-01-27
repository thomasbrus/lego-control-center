import { StdinControlChar } from "../types/stdin";
import { createWriteStdinCommand } from "./pybricks";

const textEncoder = new TextEncoder();

export function createWriteStdinControlCommand(controlChar: StdinControlChar): Uint8Array {
  return createWriteStdinCommand(textEncoder.encode(controlChar).buffer);
}

export function createWriteStdinCommands(text: string, maxWriteSize: number): Uint8Array[] {
  const data = textEncoder.encode(text);
  const commands: Uint8Array[] = [];

  for (let offset = 0; offset < data.length; offset += maxWriteSize) {
    const chunk = data.slice(offset, offset + maxWriteSize);
    const command = createWriteStdinCommand(chunk.buffer);
    commands.push(command);
  }

  return commands;
}
