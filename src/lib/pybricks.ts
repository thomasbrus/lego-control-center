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

async function getPybricksControlCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksControlCharacteristicUUID);
}

async function writeCommand(device: BluetoothDevice, value: Uint8Array<ArrayBuffer>) {
  const controlCharacteristic = await getPybricksControlCharacteristic(device);
  await controlCharacteristic.writeValueWithResponse(value);
}

export async function writeStdin(device: BluetoothDevice, message: string, maxWriteSize: number) {
  const controlCharacteristic = await getPybricksControlCharacteristic(device);
  const maxPayloadSize = maxWriteSize - 1;
  const data = encodeMessage(message);

  for (let offset = 0; offset < data.length; offset += maxPayloadSize) {
    const chunk = data.slice(offset, offset + maxPayloadSize);
    const command = createWriteStdinCommand(chunk.buffer);
    await controlCharacteristic.writeValueWithResponse(command.buffer as ArrayBuffer);
  }
}

async function startUserProgram(device: BluetoothDevice, programId: BuiltinProgramId) {
  await writeCommand(device, createStartUserProgramCommand(programId));
}

export async function startReplUserProgram(device: BluetoothDevice) {
  return startUserProgram(device, BuiltinProgramId.REPL);
}

export async function stopUserProgram(device: BluetoothDevice) {
  await writeCommand(device, createStopUserProgramCommand());
}
