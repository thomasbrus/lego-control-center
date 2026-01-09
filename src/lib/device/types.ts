export type ConnectedBluetoothDevice = BluetoothDevice & {
  gatt: BluetoothRemoteGATTServer & { connected: true };
};
