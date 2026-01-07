import { nordicUartRxCharUUID, nordicUartServiceUUID, nordicUartTxCharUUID } from "../ble-nordic-uart-service/protocol";
import {
  BuiltinProgramId,
  createStartUserProgramCommand,
  createWriteStdinCommand,
  pybricksControlEventCharacteristicUUID,
  pybricksServiceUUID,
} from "../ble-pybricks-service/protocol";

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  // See pybricks-code/src/ble-pybricks-service/protocol.ts for capability definitions
  capabilities: { maxWriteSize: number };
}

async function startUserProgram({ device }: Hub, programId: BuiltinProgramId) {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

  const pybricksService = await device.gatt.getPrimaryService(pybricksServiceUUID);
  const controlCharacteristic = await pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID);

  const command = createStartUserProgramCommand(programId);
  await controlCharacteristic.writeValueWithResponse(command.buffer as ArrayBuffer);
}

async function startRepl(hub: Hub) {
  return startUserProgram(hub, BuiltinProgramId.REPL);
}

async function writeStdin({ device, capabilities }: Hub, data: Uint8Array) {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

  const pybricksService = await device.gatt.getPrimaryService(pybricksServiceUUID);
  const controlCharacteristic = await pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID);

  // The WriteStdin command has 1 byte overhead for the command type
  const maxPayloadSize = capabilities.maxWriteSize - 1;

  for (let offset = 0; offset < data.length; offset += maxPayloadSize) {
    const chunk = data.slice(offset, offset + maxPayloadSize);
    const command = createWriteStdinCommand(chunk.buffer as ArrayBuffer);
    await controlCharacteristic.writeValueWithResponse(command.buffer as ArrayBuffer);
  }
}

async function subscribeToControlEvents({ device }: Hub, callback: (data: DataView) => void): Promise<() => Promise<void>> {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

  const pybricksService = await device.gatt.getPrimaryService(pybricksServiceUUID);
  const controlCharacteristic = await pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID);

  const listener = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (target.value) {
      callback(target.value);
    }
  };

  controlCharacteristic.addEventListener("characteristicvaluechanged", listener);
  await controlCharacteristic.startNotifications();

  // Return an unsubscribe function
  return async () => {
    controlCharacteristic.removeEventListener("characteristicvaluechanged", listener);
    await controlCharacteristic.stopNotifications();
  };
}

async function writeToUart({ device, capabilities }: Hub, data: Uint8Array) {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

  const uartService = await device.gatt.getPrimaryService(nordicUartServiceUUID);
  const rxCharacteristic = await uartService.getCharacteristic(nordicUartRxCharUUID);

  // Chunk the data according to max write size
  const maxWriteSize = capabilities.maxWriteSize;

  for (let offset = 0; offset < data.length; offset += maxWriteSize) {
    const chunk = data.slice(offset, offset + maxWriteSize);
    await rxCharacteristic.writeValueWithoutResponse(chunk.buffer as ArrayBuffer);
  }
}

function disconnect({ device }: Hub) {
  device.gatt?.disconnect();
}

type UartCallback = (data: string) => void;

async function subscribeToUart({ device }: Hub, callback: UartCallback): Promise<() => Promise<void>> {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

  const uartService = await device.gatt.getPrimaryService(nordicUartServiceUUID);
  const txCharacteristic = await uartService.getCharacteristic(nordicUartTxCharUUID);

  const decoder = new TextDecoder();

  const listener = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (target.value) {
      const text = decoder.decode(target.value);
      callback(text);
    }
  };

  txCharacteristic.addEventListener("characteristicvaluechanged", listener);
  await txCharacteristic.startNotifications();

  // Return an unsubscribe function
  return async () => {
    txCharacteristic.removeEventListener("characteristicvaluechanged", listener);
    await txCharacteristic.stopNotifications();
  };
}

async function shutdown(hub: Hub) {
  // Start the built-in REPL program
  await startUserProgram(hub, BuiltinProgramId.REPL);

  // Give the REPL a moment to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Send the shutdown command via UART
  const encoder = new TextEncoder();
  // const command = encoder.encode("hub.system.shutdown()\r\n");
  const command = encoder.encode("hub.light.on(Color.RED)\r\n");
  await writeToUart(hub, command);
}

export default { disconnect, startUserProgram, shutdown, subscribeToUart, writeToUart, subscribeToControlEvents, writeStdin, startRepl };
