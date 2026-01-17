import { assertConnected } from "@/lib/device/utils";
import { encodeMessage } from "@/lib/messages/encoding";
import { pybricksControlCharacteristicUUID, pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID } from "./constants";
import {
  BuiltinProgramId,
  createStartUserProgramCommand,
  createStopUserProgramCommand,
  createWriteAppDataCommand,
  createWriteStdinCommand,
} from "./protocol";

async function getPybricksService(device: BluetoothDevice) {
  assertConnected(device);
  return device.gatt.getPrimaryService(pybricksServiceUUID);
}

export async function getPybricksHubCapabilitiesCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksHubCapabilitiesCharacteristicUUID);
}

export async function getPybricksControlCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksControlCharacteristicUUID);
}

export function createWriteStdinCommands(message: string, maxWriteSize: number) {
  // See additional info about max payload size here:
  // https://github.com/pybricks/pybricks-code/blob/a4aade5a29945f55a12608b43e3e62e9e333fc03/src/lwp3-bootloader/protocol.ts#L66-L80
  const maxPayloadSize = Math.min(maxWriteSize, 64);
  const data = encodeMessage(message);
  const commands: Uint8Array<ArrayBuffer>[] = [];

  for (let offset = 0; offset < data.length; offset += maxPayloadSize) {
    const chunk = data.slice(offset, offset + maxPayloadSize);
    const command = createWriteStdinCommand(chunk.buffer);
    commands.push(command);
  }

  return commands;
}

/**
 * Creates commands to write binary data to the hub's AppData buffer.
 * Unlike stdin, AppData is binary and uses an offset-based protocol.
 * @param data The binary data to write
 * @param maxWriteSize Maximum bytes per BLE write (from hub capabilities)
 * @param offset Starting offset in the AppData buffer (default 0)
 */
export function createWriteAppDataCommands(data: ArrayBuffer, maxWriteSize: number, offset: number = 0): Uint8Array<ArrayBuffer>[] {
  // AppData command: 1 byte command + 2 bytes offset + payload
  const headerSize = 3;
  const maxPayloadSize = maxWriteSize - headerSize;
  const commands: Uint8Array<ArrayBuffer>[] = [];

  for (let i = 0; i < data.byteLength; i += maxPayloadSize) {
    const chunk = data.slice(i, i + maxPayloadSize);
    const currentOffset = offset + i;
    const command = createWriteAppDataCommand(currentOffset, chunk);
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

export async function writeCommandWithResponse(device: BluetoothDevice, value: Uint8Array<ArrayBuffer>) {
  const controlCharacteristic = await getPybricksControlCharacteristic(device);
  await controlCharacteristic.writeValueWithResponse(value);
}

export async function writeCommandWithoutResponse(device: BluetoothDevice, value: Uint8Array<ArrayBuffer>) {
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
