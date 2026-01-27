import { getPybricksControlCharacteristic, getPybricksHubCapabilities } from "@/lib/services/ble-pybricks-service";
import { assert } from "@/lib/utils/common";
import { decodePybricksEvent } from "@/lib/utils/pybricks";
import { requestDeviceOptions } from "../services/ble";
import { getPnpId } from "../services/ble-device-info-service";
import { createStartReplUserProgramCommand } from "../services/pybricks";
import { HubClient, HubClientCreateOptions, HubClientCreateReturn } from "../types/hub-client";
import { AnyHubEvent, HubEventListener, HubEventType } from "../types/hub-event";
import { createHubEvent, getHubTypeFromPnpId } from "../utils/hub";

export class BluetoothHubClient implements HubClient {
  private listeners = new Map<HubEventType, Set<HubEventListener>>();
  private controlCharacteristic?: BluetoothRemoteGATTCharacteristic;

  static async create(options: HubClientCreateOptions): HubClientCreateReturn {
    const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
    device.addEventListener("gattserverdisconnected", options.onDisconnect);
    await device.gatt?.connect();
    return new BluetoothHubClient(device);
  }

  constructor(public device: BluetoothDevice) {
    this.device = device;
  }

  async getHubType() {
    const pnpId = await getPnpId(this.device);
    return getHubTypeFromPnpId(pnpId);
  }

  async getHubCapabilities() {
    return await getPybricksHubCapabilities(this.device);
  }

  async startRepl() {
    await this.write(createStartReplUserProgramCommand());
    await this.waitForTerminalOutput(">>> ");
  }

  async startEventStream() {
    this.controlCharacteristic = await getPybricksControlCharacteristic(this.device);
    this.controlCharacteristic.addEventListener("characteristicvaluechanged", this.handleValueChanged);
  }

  async stopEventStream() {
    assert(!!this.controlCharacteristic, "Event stream not started");
    this.controlCharacteristic.removeEventListener("characteristicvaluechanged", this.handleValueChanged);
  }

  private handleValueChanged = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    assert(!!value, "No value in characteristic value changed event");

    const pybricksEvent = decodePybricksEvent(value);
    const hubEvent = createHubEvent(pybricksEvent);

    this.emit(hubEvent.type, hubEvent);
  };

  addEventListener(type: HubEventType, callback: HubEventListener) {
    const listeners = this.listeners.get(type);

    if (listeners) {
      listeners.add(callback);
    } else {
      this.listeners.set(type, new Set([callback]));
    }
  }

  removeEventListener(type: HubEventType, callback: HubEventListener) {
    this.listeners.get(type)?.delete(callback);
  }

  get isConnected() {
    return this.device.gatt?.connected ?? false;
  }

  disconnect() {
    this.device.gatt?.disconnect();
  }

  private emit(type: HubEventType, event: AnyHubEvent) {
    const relevantListeners = this.listeners.get(type);
    relevantListeners?.forEach((callback) => callback(event));
  }

  private write(value: Uint8Array<ArrayBuffer>) {
    assert(!!this.controlCharacteristic, "Control characteristic not available");
    this.controlCharacteristic.writeValueWithResponse(value);
  }

  private waitForTerminalOutput(message: string): Promise<void> {
    return new Promise<void>((resolve) => {
      let terminalOutput = "";

      const listener: HubEventListener = (event) => {
        if (event.type === HubEventType.TerminalOutput) {
          terminalOutput += event.output;

          if (terminalOutput.includes(message)) {
            this.removeEventListener(HubEventType.TerminalOutput, listener);
            resolve();
          }
        }
      };

      this.addEventListener(HubEventType.TerminalOutput, listener);
    });
  }
}
