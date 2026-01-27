import { HubType } from "../types/hub";
import { HubClient, HubClientCreateOptions, HubClientCreateReturn } from "../types/hub-client";
import { HubEventListener, HubEventType } from "../types/hub-event";

export class SimulatedHubClient implements HubClient {
  static async create(_options: HubClientCreateOptions): HubClientCreateReturn {
    return new SimulatedHubClient();
  }

  async getHubType() {
    return HubType.TechnicHub;
  }

  async getHubCapabilities() {
    return { maxWriteSize: 148, flags: 11, maxUserProgramSize: 16164 };
  }

  async startRepl() {}

  addEventListener(_type: HubEventType, _callback: HubEventListener) {}
  removeEventListener(_type: HubEventType, _callback: HubEventListener) {}

  async startEventStream() {}

  get isConnected() {
    return true;
  }
  disconnect() {}
}
