import { assert } from "../utils";
import { Hub, HubCapabilities, HubStatus } from "./types";

// export function assertConnected(hub: Hub): asserts hub is ConnectedHub {
//   assert(isConnected(hub), "Hub is not connected");
// }

// export function isConnected(hub: Hub): hub is ConnectedHub {
//   return hub.device?.gatt?.connected ?? false;
// }

export function assertCapabilities(hub: Hub): asserts hub is Hub & { capabilities: HubCapabilities } {
  assert(!!hub.capabilities, "Hub capabilities have not been retrieved");
}

// export function isWithCapabilities(hub: Hub): hub is WithCapabilitiesHub {
//   return isConnected(hub) && !!hub.capabilities;
// }

export function isAtLeastStatus(hub: Hub, minStatus: HubStatus): boolean {
  return hub.status >= minStatus;
}

export function isConnected(hub: Hub): boolean {
  return isAtLeastStatus(hub, HubStatus.Connected);
}

export function isRunning(hub: Hub): boolean {
  return isAtLeastStatus(hub, HubStatus.Running);
}

// export function isConnected(hub: Hub): boolean {
//   return isAtLeastStatus(hub, HubStatus.Connected);
// }

// export function assertConnected(hub: Hub): asserts hub is ConnectedHub {
//   assert(isConnected(hub), "Hub is not connected");
// }
