import { assert } from "@/lib/utils";
import { Hub, HubStatus, ReadyHub } from "./types";

export function assertHubReady(hub: Hub): asserts hub is ReadyHub {
  assert(hub.status === HubStatus.Ready, "Hub is not ready");
  assert(hub.capabilities !== undefined, "Hub capabilities not available");
}
