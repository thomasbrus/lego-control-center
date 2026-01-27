import { AnyHubTelemetryData, HubTelemetryDataType } from "../types/hub-telemetry-data";

export function decodeHubTelemetryData(buffer: ArrayBuffer): AnyHubTelemetryData {
  const view = new DataView(buffer);
  const telemetryDataType = view.getUint8(0);

  switch (telemetryDataType) {
    case 0x10:
      // [TelemetryType(B), DeviceTypeA(B), DeviceTypeB(B), DeviceTypeC(B), DeviceTypeD(B), DeviceTypeE(B), DeviceTypeF(B)]
      const devices = [...Array(6)].map((_, i) => decodeDeviceId(view.getUint8(1 + i)));
      return { type: HubTelemetryDataType.Devices, devices };

    default:
      throw new Error("Unknown telemetry data type: " + telemetryDataType);
  }
}

function decodeDeviceId(deviceId: number) {
  return { 2: "motor" as const, 5: "color-distance-sensor" as const }[deviceId] ?? null;
}
