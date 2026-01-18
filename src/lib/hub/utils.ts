import { assert } from "../utils";
import { Hub, HubCapabilities, HubStatus } from "./types";

export function assertCapabilities(hub: Hub): asserts hub is Hub & { capabilities: HubCapabilities } {
  assert(!!hub.capabilities, "Hub capabilities have not been retrieved");
}

export function isAtLeastStatus(hub: Hub, minStatus: HubStatus): boolean {
  return hub.status >= minStatus;
}

export function isConnected(hub: Hub): boolean {
  return isAtLeastStatus(hub, HubStatus.Connected);
}

export function isRunning(hub: Hub): boolean {
  return isAtLeastStatus(hub, HubStatus.Running);
}
