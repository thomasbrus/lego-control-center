import { ConnectionStatus } from "@/lib/connection-status";
import { createWriteStdinCommands, stopUserProgram, writeCommandsWithResponse } from "./pybricks";

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  status: ConnectionStatus;
  // See HubCapabilityFlag for capability definitions
  capabilities: { maxWriteSize: number };
}

export async function disconnect({ device }: Hub) {
  await stopUserProgram(device);
  device.gatt?.disconnect();
}

export async function writeStdinWithResponse(hub: Hub, message: string) {
  const commands = createWriteStdinCommands(message, hub.capabilities.maxWriteSize);
  return await writeCommandsWithResponse(hub.device, commands);
}

export async function turnLightOn(hub: Hub) {
  await writeStdinWithResponse(hub, "hub.light.on(Color.GREEN)\r\n");
}

export async function shutdown(hub: Hub) {
  try {
    await writeStdinWithResponse(hub, "hub.system.shutdown()\r\n");
  } catch (e) {
    if (e instanceof DOMException && e.name === "NotSupportedError") {
    } else {
      throw e;
    }
  }
}
