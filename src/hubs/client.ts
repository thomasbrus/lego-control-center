import { LegoHubClient } from "@/lego/hub-client";
import { PybricksHubClient } from "@/pybricks/hub-client";

export type AnyHubClient = LegoHubClient | PybricksHubClient;

export type AnyConnectedHubClient = AnyHubClient & {
  isConnected: true;
};
