import * as HubActions from "@/lib/hub/actions";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback, useContext } from "react";
import { pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID, requestDeviceOptions } from "../pybricks/constants";
import { HubsContext } from "./context";
import { Hub, HubCapabilities, HubStatus } from "./types";

export function useHub() {
  const { updateHub, disconnectHub } = useHubsContext();

  const connect = useCallback(
    async (hub: Hub) => {
      let device: BluetoothDevice;

      try {
        device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") return;
        throw error;
      }

      const connectingHub = updateHub(hub.id, { ...hub, status: HubStatus.Connecting, name: device.name ?? hub.name, device });

      device.addEventListener("gattserverdisconnected", () => {
        disconnectHub(hub.id);
      });

      await device.gatt?.connect();

      return updateHub(hub.id, { ...connectingHub, status: HubStatus.Connected });
    },
    [updateHub]
  );

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      HubUtils.assertConnected(hub);

      const retrievingCapabilitiesHub = updateHub(hub.id, { ...hub, status: HubStatus.RetrievingCapabilities });

      const primaryService = await hub.device.gatt.getPrimaryService(pybricksServiceUUID);
      const characteristic = await primaryService?.getCharacteristic(pybricksHubCapabilitiesCharacteristicUUID);

      const value = await characteristic.readValue();
      const maxWriteSize = value.getUint16(0, true);
      const capabilities: HubCapabilities = { maxWriteSize };

      return updateHub(hub.id, { ...retrievingCapabilitiesHub, status: HubStatus.Ready, capabilities });
    },
    [updateHub]
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      if (HubUtils.isConnected(hub)) {
        await HubActions.disconnect(hub);
        return disconnectHub(hub.id);
      }
    },
    [updateHub]
  );

  return { connect, retrieveCapabilities, disconnect };
}

export function useHubsContext() {
  const value = useContext(HubsContext);
  if (!value) throw new Error("HubsContext missing");
  return value;
}
