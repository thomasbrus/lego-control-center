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
  telemetryEvent: unknown;
}

export type AnyHubEvent = HubTerminalOutputEvent | HubTelemetryDataEvent;
export type HubEventListener = (event: AnyHubEvent) => void;
