import * as HubUtils from "@/lib/hub/utils";
import * as PybricksCommands from "@/lib/pybricks/commands";
import * as NotificationParsing from "../notification/parsing";
import { EventType } from "../pybricks/protocol";
import { Hub } from "./types";

/**
 * Command IDs for the AppData protocol.
 * Must match the Commands class in program.ts
 */
const Commands = {
  HUB_SHUTDOWN: 0x10,
  MOTOR_SET_SPEEDS: 0x20,
  MOTOR_STOP_ALL: 0x21,
  LIGHT_SET: 0x30,
} as const;

/**
 * Creates a command buffer matching the protocol format: <Bhhhh>
 * (1 byte command + 4 signed shorts for args)
 */
function createCommandBuffer(commandId: number, ...args: number[]): ArrayBuffer {
  const buffer = new ArrayBuffer(9); // 1 + 2*4 bytes
  const view = new DataView(buffer);
  view.setUint8(0, commandId);
  for (let i = 0; i < 4; i++) {
    view.setInt16(1 + i * 2, args[i] ?? 0, true); // little-endian
  }
  return buffer;
}

export async function disconnect(hub: Hub) {
  if (HubUtils.isConnected(hub)) {
    try {
      await PybricksCommands.stopUserProgram(hub.device);
    } catch {
      // Ignore errors - device may not be fully ready yet
    } finally {
      hub.device.gatt?.disconnect();
    }
  }
}

export async function startRepl(hub: Hub) {
  HubUtils.assertConnected(hub);
  await PybricksCommands.startReplUserProgram(hub.device);
  await waitForReplReady(hub);
}

function waitForReplReady(hub: Hub) {
  return new Promise<void>((resolve) => {
    HubUtils.assertConnected(hub);

    const listener = (event: Event) => {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const notification = target.value && NotificationParsing.parseNotification(target.value, new Date());

      if (notification?.eventType === EventType.WriteStdout && notification.message.endsWith(">>> ")) {
        target.removeEventListener("characteristicvaluechanged", listener);
        resolve();
      }
    };

    PybricksCommands.getPybricksControlCharacteristic(hub.device).then((characteristic) => {
      characteristic.addEventListener("characteristicvaluechanged", listener);
    });
  });
}

export async function writeStdinWithResponse(hub: Hub, message: string) {
  HubUtils.assertWithCapabilities(hub);
  const commands = PybricksCommands.createWriteStdinCommands(message, hub.capabilities.maxWriteSize);
  return await PybricksCommands.writeCommandsWithResponse(hub.device, commands);
}

/**
 * Write binary data to the hub's AppData buffer.
 * This is used for real-time control commands (motor speeds, light control, etc.)
 * instead of stdin text commands.
 *
 * @param hub The connected hub
 * @param data Binary data to write (e.g., packed struct with command + args)
 * @param offset Offset in the AppData buffer (default 0)
 */
export async function writeAppData(hub: Hub, data: ArrayBuffer, offset: number = 0) {
  HubUtils.assertWithCapabilities(hub);
  const commands = PybricksCommands.createWriteAppDataCommands(data, hub.capabilities.maxWriteSize, offset);
  return await PybricksCommands.writeCommandsWithResponse(hub.device, commands);
}

export async function turnLightOn(hub: Hub) {
  await writeStdinWithResponse(hub, "hub.light.on(Color.GREEN)\r\n");
}

/**
 * Shutdown the hub using the AppData protocol.
 */
export async function hubShutdown(hub: Hub) {
  const buffer = createCommandBuffer(Commands.HUB_SHUTDOWN);
  await writeAppData(hub, buffer);
}

/**
 * Set the hub light color using the AppData protocol.
 * @param hub The connected hub
 * @param colorIndex Color index (0=NONE/off, 1=BLACK, 2=RED, 3=ORANGE, 4=YELLOW, 5=GREEN, 6=CYAN, 7=BLUE, 8=VIOLET, 9=MAGENTA)
 */
export async function lightSet(hub: Hub, colorIndex: number) {
  const buffer = createCommandBuffer(Commands.LIGHT_SET, colorIndex);
  await writeAppData(hub, buffer);
}

export async function enterPasteMode(hub: Hub) {
  await writeStdinWithResponse(hub, "\x05\r\n");
}

export async function exitPasteMode(hub: Hub) {
  await writeStdinWithResponse(hub, "\x04\r\n");
}

/**
 * Simulated hub disconnect - simulates disconnect with delay
 */
export async function simulatedDisconnect() {
  await new Promise((resolve) => setTimeout(resolve, 150));
}

/**
 * Simulated hub shutdown - simulates shutdown with delay
 */
export async function simulatedHubShutdown() {
  await new Promise((resolve) => setTimeout(resolve, 150));
}
