export interface HubTelemetryData {
  type: HubTelemetryDataType;
}

export enum HubTelemetryDataType {
  Devices = 0,
}

export interface HubDevicesTelemetryData {
  type: HubTelemetryDataType.Devices;
  devices: (null | "motor" | "color-distance-sensor")[];
}

export type AnyHubTelemetryData = HubDevicesTelemetryData;
