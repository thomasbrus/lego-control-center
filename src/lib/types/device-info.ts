export interface DeviceInfoPnpId {
  vendorIdSource: number;
  vendorId: number;
  productId: number;
  productVersion: number;
}

export enum DeviceInfoProductId {
  /** 4-port Technic hub. */
  TechnicHub = 0x80,
  /** 6-port SPIKE/MINDSTORMS hub. */
  TechnicLargeHub = 0x81,
}

export enum DeviceInfoTechnicLargeHubProductVersion {
  /** Yellow SPIKE Prime variant. */
  SpikePrimeHub = 0,
  /** Teal MINDSTORMS Robot Inventor variant. */
  MindstormsInventorHub = 1,
}
