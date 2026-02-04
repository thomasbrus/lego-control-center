export const primaryServiceUuid = "c5f50001-8280-46da-89f4-6d8051e4aeef";
export const controlCharacteristicUuid = "c5f50002-8280-46da-89f4-6d8051e4aeef";
export const hubCapabilitiesCharacteristicUuid = "c5f50003-8280-46da-89f4-6d8051e4aeef";
export const deviceInformationServiceUuid = 0x180a;
export const pnpIdUuid = 0x2a50;

export const pybricksRequestDeviceOptions = {
  filters: [{ services: [primaryServiceUuid] }],
  optionalServices: [primaryServiceUuid, deviceInformationServiceUuid],
};
