/** Pybricks service UUID. */
export const pybricksServiceUUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
/** Pybricks control/event characteristic UUID. */
export const pybricksControlCharacteristicUUID = "c5f50002-8280-46da-89f4-6d8051e4aeef";
/** Pybricks hub capabilities characteristic UUID. */
export const pybricksHubCapabilitiesCharacteristicUUID = "c5f50003-8280-46da-89f4-6d8051e4aeef";

export const requestDeviceOptions = { filters: [{ services: [pybricksServiceUUID] }], optionalServices: [pybricksServiceUUID] };
