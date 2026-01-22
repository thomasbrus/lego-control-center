export type ConnectedBluetoothDevice = BluetoothDevice & {
  gatt: BluetoothRemoteGATTServer & { connected: true };
};

export enum PnpIdVendorIdSource {
  BluetoothSig = 1,
  UsbImpForum = 2,
}

export type PnpId = {
  vendorIdSource: PnpIdVendorIdSource;
  vendorId: number;
  productId: number;
  productVersion: number;
};
