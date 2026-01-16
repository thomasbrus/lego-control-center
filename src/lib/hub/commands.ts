import * as DeviceUtls from "@/lib/device/utils";
import * as HubUtils from "@/lib/hub/utils";
import * as PybricksCommands from "@/lib/pybricks/commands";
import * as NotificationParsing from "../notification/parsing";
import { createWriteStdinCommand, EventType } from "../pybricks/protocol";
import { Hub } from "./types";

/**
 * Command IDs for the stdin protocol (must match hub firmware)
 */
export enum CommandType {
  SHUTDOWN_HUB = 0x10,
  SET_MOTOR_SPEEDS = 0x20,
  STOP_ALL_MOTORS = 0x21,
  SET_LIGHT = 0x30,
}

/**
 * Creates a command buffer matching the protocol format: <Bhhhh>
 * (1 byte command + 4 signed shorts for args)
 */
function createCommandBuffer(commandType: CommandType, args: number[] = []): ArrayBuffer {
  const buffer = new ArrayBuffer(9);
  const view = new DataView(buffer);
  view.setUint8(0, commandType);
  for (let i = 0; i < 4; i++) {
    view.setInt16(1 + i * 2, args[i] ?? 0, true);
  }
  return buffer;
}

/**
 * Write a command to stdin as binary (must be implemented to write to the correct BLE characteristic)
 */
export async function writeStdinCommand(hub: Hub, buffer: ArrayBuffer) {
  DeviceUtls.assertConnected(hub.device);
  const stdinCommand = createWriteStdinCommand(buffer);
  await PybricksCommands.writeCommandWithResponse(hub.device, stdinCommand);
}

/**
 * Shutdown the hub (writes 9 bytes to stdin)
 */
export async function shutdownHub(hub: Hub) {
  const buffer = createCommandBuffer(CommandType.SHUTDOWN_HUB);
  await writeStdinCommand(hub, buffer);
}

/**
 * Set speeds for all motors (array of 4 signed shorts)
 */
export async function setMotorSpeeds(hub: Hub, speeds: [number, number, number, number]) {
  const buffer = createCommandBuffer(CommandType.SET_MOTOR_SPEEDS, speeds);
  await writeStdinCommand(hub, buffer);
}

/**
 * Stop all motors
 */
export async function stopAllMotors(hub: Hub) {
  const buffer = createCommandBuffer(CommandType.STOP_ALL_MOTORS);
  await writeStdinCommand(hub, buffer);
}

/**
 * Set the light color (index)
 */
export async function setLight(hub: Hub, colorIndex: number) {
  const buffer = createCommandBuffer(CommandType.SET_LIGHT, [colorIndex]);
  await writeStdinCommand(hub, buffer);
}

export async function disconnect(hub: Hub) {
  if (DeviceUtls.isConnected(hub.device)) {
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
  DeviceUtls.assertConnected(hub.device);
  await PybricksCommands.startReplUserProgram(hub.device);
  await waitForReplReady(hub);
}

function waitForReplReady(hub: Hub) {
  return new Promise<void>((resolve) => {
    DeviceUtls.assertConnected(hub.device);

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
  DeviceUtls.assertConnected(hub.device);
  HubUtils.assertCapabilities(hub);
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
  DeviceUtls.assertConnected(hub.device);
  HubUtils.assertCapabilities(hub);
  const commands = PybricksCommands.createWriteAppDataCommands(data, hub.capabilities.maxWriteSize, offset);
  return await PybricksCommands.writeCommandsWithResponse(hub.device, commands);
}

export async function enterPasteMode(hub: Hub) {
  await writeStdinWithResponse(hub, "\x05\r\n");
}

export async function exitPasteMode(hub: Hub) {
  await writeStdinWithResponse(hub, "\x04\r\n");
}
