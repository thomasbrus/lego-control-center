import { assert } from "@/lib/utils";
import { ConnectedHub, Hub, WithCapabilitiesHub } from "./types";

export function assertConnected(hub: Hub): asserts hub is ConnectedHub {
  assert(isConnected(hub), "Hub is not connected");
}

export function isConnected(hub: Hub): hub is ConnectedHub {
  return hub.device?.gatt?.connected ?? false;
}

export function assertWithCapabilities(hub: Hub): asserts hub is WithCapabilitiesHub {
  assert(isWithCapabilities(hub), "Hub capabilities have not been retrieved");
}

export function isWithCapabilities(hub: Hub): hub is WithCapabilitiesHub {
  return isConnected(hub) && !!hub.capabilities;
}
