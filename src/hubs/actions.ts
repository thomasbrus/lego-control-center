import { hubStore } from "@/hubs/store";
import { initialHub } from "@/hubs/hub";
import { HubId } from "@/hubs/id";
import { requestDeviceOptions } from "./bluetooth";

export interface HubActions {
  shutdown(): Promise<void>;
  turnLightOn(color: { hue: number; saturation: number; value: number }): Promise<void>;
  turnLightOff(): Promise<void>;
  setMotorSpeed(port: number, speed: number): Promise<void>;
  stopMotor(port: number): Promise<void>;
  get isConnected(): boolean;
  disconnect(): void;
}

export async function connectAndSetupHub(_hubId: HubId) {
  await navigator.bluetooth.requestDevice(requestDeviceOptions);
}

export function resetHub(hubId: HubId) {
  const hub = hubStore.getState().requireHub(hubId);
  hubStore.getState().putHub({ ...initialHub, id: hub.id, name: hub.name });
}

export function disconnectHub(hubId: HubId) {
  hubStore.getState().requireConnectedHubClient(hubId).disconnect();
  resetHub(hubId);
}

export async function shutdownHub(_hubId: HubId) {
  // ...
}
