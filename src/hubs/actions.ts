import { hubStore } from "@/hubs/store";
import { initialHub } from "@/hubs/hub";
import { HubId } from "@/hubs/id";

export interface HubActions {
  shutdown(): Promise<void>;
  turnLightOn(color: { hue: number; saturation: number; value: number }): Promise<void>;
  turnLightOff(): Promise<void>;
  setMotorSpeed(port: number, speed: number): Promise<void>;
  stopMotor(port: number): Promise<void>;
  get isConnected(): boolean;
  disconnect(): void;
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
