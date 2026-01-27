import { AnyPybricksEvent, PybricksEventType } from "@/lib/types/pybricks";
import { assert } from "@/lib/utils/common";
import { DeviceInfoPnpId, DeviceInfoProductId } from "../types/device-info";
import { ConnectedHub, Hub, HubType } from "../types/hub";
import { HubClient } from "../types/hub-client";
import { AnyHubEvent, HubEventType } from "../types/hub-event";
import { PybricksCapabilitiesFlag } from "../types/pybricks";
import { decodeHubTelemetryData } from "./hub-telemetry-data";

export function assertHubConnected(hub: Hub): asserts hub is ConnectedHub {
  assert(!!hub.client, "Hub client is not initialized");
  assertHubClientConnected(hub.client);
}

export function assertHubClientConnected(hubClient: HubClient) {
  assert(hubClient.isConnected, "Hub client is not connected");
}

export function assertHubSupportsRepl(hub: Hub) {
  assert(!!hub.capabilities, "Hub capabilities have not been retrieved");
  assert(Boolean(hub.capabilities.flags & PybricksCapabilitiesFlag.HasRepl), "Hub does not support REPL");
}

export function getHubTypeFromPnpId(pnpId: DeviceInfoPnpId): HubType {
  switch (pnpId.productId) {
    case DeviceInfoProductId.TechnicHub:
      return HubType.TechnicHub;
    case DeviceInfoProductId.TechnicLargeHub:
      switch (pnpId.productVersion) {
        case 0:
          return HubType.PrimeHub;
        case 1:
          return HubType.InventorHub;
        default:
          throw new Error(`Unknown product version for Technic Large Hub: ${pnpId.productVersion}`);
      }
    default:
      throw new Error(`Unknown hub product ID: ${pnpId.productId}`);
  }
}

export function createHubEvent(pybricksEvent: AnyPybricksEvent): AnyHubEvent {
  switch (pybricksEvent.type) {
    case PybricksEventType.WriteStdout:
      return { type: HubEventType.TerminalOutput, output: pybricksEvent.text };
    case PybricksEventType.WriteAppData:
      return { type: HubEventType.TelemetryData, telemetryData: decodeHubTelemetryData(pybricksEvent.data.buffer) };

    default:
      throw new Error(`Unhandled Pybricks event type: ${pybricksEvent.type}`);
  }
}
