function disconnect(device: BluetoothDevice) {
  device.gatt?.disconnect();
}

export default { disconnect };
