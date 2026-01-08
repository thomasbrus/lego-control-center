type ConnectedBluetoothDevice = BluetoothDevice & { gatt: BluetoothRemoteGATTServer & { connected: true } };

export function assertConnected(device: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }
}
