import { HubActions } from "@/hubs/actions";

export class LegoHubClient implements HubActions {
  async shutdown() {}
  async turnLightOn(_color: { hue: number; saturation: number; value: number }) {}
  async turnLightOff() {}
  async setMotorSpeed(_port: number, _speed: number) {}
  async stopMotor(_port: number) {}
  get isConnected(): boolean {
    return true;
  }
  disconnect() {}
}
