import { stopUserProgram, writeStdin } from "./pybricks";

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  // See HubCapabilityFlag for capability definitions
  capabilities: { maxWriteSize: number };
}

export async function disconnect({ device }: Hub) {
  await stopUserProgram(device);
  device.gatt?.disconnect();
}

async function sendReplCommand({ device, capabilities }: Hub, command: string) {
  await writeStdin(device, `${command}\r\n`, capabilities.maxWriteSize + 1000);
}

export async function turnLightOn(hub: Hub) {
  await sendReplCommand(hub, "hub.light.on(Color.GREEN)");
}

export async function shutdown(hub: Hub) {
  // await sendReplCommand(hub, "hub.system.shutdown()");
  // hub.device.gatt?.disconnect();
  await sendReplCommand(hub, "hub.light.on(Color.GREEN)");
}

// async function subscribeToControlCharacteristic({ device }: Hub, callback: (data: DataView) => void): Promise<() => Promise<void>> {
//   assertConnected(device);

//   const pybricksService = await device.gatt.getPrimaryService(pybricksServiceUUID);
//   const controlCharacteristic = await pybricksService.getCharacteristic(pybricksControlCharacteristicUUID);

//   const listener = (event: Event) => {
//     const target = event.target as BluetoothRemoteGATTCharacteristic;
//     if (target.value) {
//       callback(target.value);
//     }
//   };

//   controlCharacteristic.addEventListener("characteristicvaluechanged", listener);
//   await controlCharacteristic.startNotifications();

//   // Return an unsubscribe function
//   return async () => {
//     controlCharacteristic.removeEventListener("characteristicvaluechanged", listener);
//     await controlCharacteristic.stopNotifications();
//   };
// }
