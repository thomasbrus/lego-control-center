import { deviceInformationServiceUuid } from "./ble-device-info-service";
import { pybricksServiceUuid } from "./ble-pybricks-service";

export const requestDeviceOptions = {
  filters: [{ services: [pybricksServiceUuid] }],
  optionalServices: [pybricksServiceUuid, deviceInformationServiceUuid],
};
