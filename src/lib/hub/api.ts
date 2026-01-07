import { BuiltinProgramId } from "../ble-pybricks-service/protocol";

export interface Hub {
  id: BluetoothDevice["id"];
  name: BluetoothDevice["name"];
  device: BluetoothDevice;
  capabilities: { maxWriteSize: number };
}

function disconnect({ device }: Hub) {
  device.gatt?.disconnect();
}

async function startUserProgram({ device }: Hub, programId: BuiltinProgramId) {
  console.log(`Starting program ${programId} on device ${device.name}`);
}

async function shutdown(hub: Hub) {
  await startUserProgram(hub, BuiltinProgramId.REPL);
}

export default { disconnect, startUserProgram, shutdown };
