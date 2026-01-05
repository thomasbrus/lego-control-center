// import { useCallback, useEffect, useState } from "react";

// function writeValue(characteristic: BluetoothRemoteGATTCharacteristic | undefined, value: BufferSource) {
//   async function writeValueAsync() {
//     await characteristic?.writeValue(value);
//   }

//   writeValueAsync();
// }

// function useReadValue(characteristic: BluetoothRemoteGATTCharacteristic | undefined) {
//   const [value, setValue] = useState<DataView>();
//   useEffect(() => {
//     async function readValue() {
//       if (characteristic) {
//         setValue(await characteristic.readValue());
//       }
//     }

//     readValue();
//   }, [characteristic]);

//   return value;
// }

// export { useReadValue, writeValue };

// function useGetCharacteristic(service: BluetoothRemoteGATTService | undefined, bluetoothCharacteristicUUID: BluetoothCharacteristicUUID) {
//   const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

//   async function getCharacteristic() {
//     if (service) {
//       setCharacteristic(await service.getCharacteristic(bluetoothCharacteristicUUID));
//     }
//   }

//   getCharacteristic();

//   return characteristic;
// }

// export { useGetCharacteristic };

// function useGetDevices() {
//   const [devices, setDevices] = useState<BluetoothDevice[] | null>();

//   useEffect(() => {
//     async function getDevices() {
//       setDevices(await navigator.bluetooth.getDevices());
//     }

//     getDevices();
//   }, []);
//   return devices;
// }

// export { useGetDevices };

// function useGetPrimaryService(server: BluetoothRemoteGATTServer | undefined, bluetoothServiceUUID: BluetoothServiceUUID) {
//   const [service, setService] = useState<BluetoothRemoteGATTService>();

//   useEffect(() => {
//     async function getPrimaryService() {
//       if (server) {
//         setService(await server.getPrimaryService(bluetoothServiceUUID));
//       }
//     }

//     getPrimaryService();
//   }, [server, bluetoothServiceUUID]);

//   return service;
// }

// export { useGetPrimaryService };

// function useGetServer(device: BluetoothDevice | undefined) {
//   const [server, setServer] = useState<BluetoothRemoteGATTServer | undefined>();

//   useEffect(() => {
//     async function getServer() {
//       if (device && !server) {
//         setServer(await device.gatt?.connect());
//       }
//     }

//     getServer();
//   }, [device, server]);

//   return server;
// }

// export { useGetServer };

// function useRequestDevice(options?: RequestDeviceOptions) {
//   const [device, setDevice] = useState<BluetoothDevice | undefined>(undefined);
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [isPending, setIsPending] = useState<boolean>(false);

//   const requestDevice = useCallback(() => {
//     async function getDevice() {
//       setIsPending(true);
//       try {
//         setDevice(
//           await navigator.bluetooth.requestDevice(options).catch((err) => {
//             if (err instanceof DOMException && err.name === "NotFoundError") {
//               // this means the user clicked the cancel button in the scan dialog
//               return undefined;
//             }

//             throw err;
//           })
//         );
//       } finally {
//         setIsPending(false);
//       }
//     }

//     getDevice();
//   }, [options]);

//   useEffect(() => {
//     if (device) {
//       const handleDisconnect = () => {
//         setIsConnected(false);
//       };

//       device.addEventListener("gattserverdisconnected", handleDisconnect);

//       return () => {
//         device.removeEventListener("gattserverdisconnected", handleDisconnect);
//       };
//     }
//   }, [device]);

//   useEffect(() => {
//     if (device?.gatt?.connected) {
//       setIsConnected(true);
//     }
//   }, [device]);

//   return { device, requestDevice, isConnected, isPending };
// }

// export { useRequestDevice };
