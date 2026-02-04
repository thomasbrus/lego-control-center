import { AnyDevice } from "@/devices/device";
import { LegoHubClient } from "./hub-client";
import { LegoHubStatus } from "./hub-status";
import { HubType } from "@/hubs/type";
import { HubId } from "@/hubs/id";
import { BaseHub } from "@/hubs/hub";
import { HubFirmware } from "@/hubs/firmware";

export interface LegoHub extends BaseHub {
  id: HubId;
  firmware: HubFirmware.Lego;
  type?: HubType;
  name: string;
  status: LegoHubStatus;
  error?: Error;
  client?: LegoHubClient;
  devices?: Map<number, AnyDevice>;
  state?: LegoHubState;
}

interface LegoHubState {
  batteryPercentage?: number;
}
