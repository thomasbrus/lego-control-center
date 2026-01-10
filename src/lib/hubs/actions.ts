import { createWriteStdinCommands, stopUserProgram, writeCommandsWithResponse } from "@/lib/pybricks/commands";
import { Hub } from "./types";
import { assertHubReady } from "./utils";

export async function disconnect({ device }: Hub) {
  try {
    await stopUserProgram(device);
  } catch {
    // Ignore errors - device may not be fully ready yet
  } finally {
    device.gatt?.disconnect();
  }
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
