import { ConnectionStatus } from "@/lib/connection-status";
import { assert } from "@/lib/utils";
import { createWriteStdinCommands, stopUserProgram, writeCommandsWithResponse } from "./pybricks";

export interface HubCapabilities {
  maxWriteSize: number;
}

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  status: ConnectionStatus;
  capabilities?: HubCapabilities;
}

export type ReadyHub = Hub & {
  status: ConnectionStatus.Ready;
  capabilities: HubCapabilities;
};

export function assertHubReady(hub: Hub): asserts hub is ReadyHub {
  assert(hub.status === ConnectionStatus.Ready, "Hub is not ready");
  assert(hub.capabilities !== undefined, "Hub capabilities not available");
}

export async function disconnect({ device }: Hub) {
  await stopUserProgram(device);
  device.gatt?.disconnect();
}

export async function writeStdinWithResponse(hub: Hub, message: string) {
  assertHubReady(hub);
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
