import { LegoHub } from "@/lego/hub";
import { PybricksHub } from "@/pybricks/hub";
import { AnyConnectedHubClient, AnyHubClient } from "./client";
import { InitialHubStatus } from "./status";
import { assert } from "@/common/utils";
import { HubType } from "./type";
import { HubFirmware } from "./firmware";

export interface BaseHub {
  id: string;
  firmware: HubFirmware;
  name: string;
  type?: HubType;
  error?: Error;
  client?: AnyHubClient;
}

export type AnyHub = typeof initialHub | LegoHub | PybricksHub;
export type AnyConnectedHub = AnyHub & { client: AnyConnectedHubClient };

interface InitialHub extends BaseHub {
  status: InitialHubStatus;
  firmware: HubFirmware.Unknown;
}

export const initialHub: InitialHub = {
  id: "untitled-hub",
  name: "Untitled Hub",
  firmware: HubFirmware.Unknown,
  status: InitialHubStatus.Idle,
  client: undefined,
};

export function assertHubConnected(hub: AnyHub): asserts hub is AnyConnectedHub {
  assert(!!hub.client, "Hub client is not initialized");
  assertHubClientConnected(hub.client);
}

export function assertHubClientConnected(hubClient: AnyHubClient) {
  assert(hubClient.isConnected, "Hub client is not connected");
}

export function isHubConnected(hub: AnyHub): hub is AnyConnectedHub {
  return !!hub.client && hub.client.isConnected;
}

export function getHubName(hub: AnyHub): string {
  switch ("type" in hub && hub.type) {
    case HubType.TechnicHub:
      return "Technic Hub";
    case HubType.PrimeHub:
      return "Prime Hub";
    case HubType.InventorHub:
      return "Inventor Hub";
    default:
      throw new Error("Unknown hub type");
  }
}
