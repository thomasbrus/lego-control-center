import { LegoHubStatus } from "@/lego/hub-status";
import { PybricksHubStatus } from "@/pybricks/hub-status";

export type AnyHubStatus = InitialHubStatus | LegoHubStatus | PybricksHubStatus;

export enum InitialHubStatus {
  Idle,
}
