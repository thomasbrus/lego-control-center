import { HubTelemetryData } from "./hub-telemetry-data";

export interface HubEvent {
  type: HubEventType;
}

export enum HubEventType {
  TerminalOutput = 0,
  TelemetryData = 1,
}

export interface HubTerminalOutputEvent extends HubEvent {
  type: HubEventType.TerminalOutput;
  output: string;
}

export interface HubTelemetryDataEvent extends HubEvent {
  type: HubEventType.TelemetryData;
  telemetryData: HubTelemetryData;
}

export type AnyHubEvent = HubTerminalOutputEvent | HubTelemetryDataEvent;
export type HubEventListener = (event: AnyHubEvent) => void;
