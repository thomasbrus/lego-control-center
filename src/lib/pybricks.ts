import { assertConnected } from "@/lib/device";
import { encodeMessage } from "./message";
import {
  BuiltinProgramId,
  createStartUserProgramCommand,
  createStopUserProgramCommand,
  createWriteStdinCommand,
  pybricksControlCharacteristicUUID,
  pybricksServiceUUID,
} from "./protocol";

async function getPybricksService(device: BluetoothDevice) {
  assertConnected(device);

  return device.gatt.getPrimaryService(pybricksServiceUUID);
}

export async function getPybricksControlCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksControlCharacteristicUUID);
}

export function createWriteStdinCommands(message: string, maxWriteSize: number) {
  const maxPayloadSize = maxWriteSize - 1;
  const data = encodeMessage(message);
  const commands: Uint8Array<ArrayBuffer>[] = [];

  for (let offset = 0; offset < data.length; offset += maxPayloadSize) {
    const chunk = data.slice(offset, offset + maxPayloadSize);
    const command = createWriteStdinCommand(chunk.buffer);
    commands.push(command);
  }

  return commands;
}

export async function writeCommandsWithResponse(device: BluetoothDevice, commands: Uint8Array<ArrayBuffer>[]) {
  for (const command of commands) {
    await writeCommandWithResponse(device, command);
  }
}

export async function writeCommandsWithoutResponse(device: BluetoothDevice, commands: Uint8Array<ArrayBuffer>[]) {
  for (const command of commands) {
    await writeCommandWithoutResponse(device, command);
  }
}

async function writeCommandWithResponse(device: BluetoothDevice, value: Uint8Array<ArrayBuffer>) {
  const controlCharacteristic = await getPybricksControlCharacteristic(device);
  await controlCharacteristic.writeValueWithResponse(value);
}

async function writeCommandWithoutResponse(device: BluetoothDevice, value: Uint8Array<ArrayBuffer>) {
  const controlCharacteristic = await getPybricksControlCharacteristic(device);
  // Seems not to do anything when used with the Pybricks control characteristic
  await controlCharacteristic.writeValueWithoutResponse(value);
}

async function startUserProgram(device: BluetoothDevice, programId: BuiltinProgramId) {
  await writeCommandWithResponse(device, createStartUserProgramCommand(programId));
}

export async function startReplUserProgram(device: BluetoothDevice) {
  return startUserProgram(device, BuiltinProgramId.REPL);
}

export async function stopUserProgram(device: BluetoothDevice) {
  await writeCommandWithResponse(device, createStopUserProgramCommand());
}
