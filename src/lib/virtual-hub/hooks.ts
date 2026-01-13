import * as HubUtils from "@/lib/hub/utils";
import { useCallback } from "react";
import * as HubHooks from "../hub/hooks";
import { useHubsContext } from "../hub/hooks";
import { Hub, HubStatus } from "../hub/types";
import { delay } from "../utils";

export function useHub(): ReturnType<typeof HubHooks.useHub> {
  const { updateHub, disconnectHub } = useHubsContext();

  const connect = useCallback(
    async (hub: Hub) => {
      const connectingDevice = { gatt: { connected: false } } as BluetoothDevice;
      const connectingHub = updateHub(hub.id, { ...hub, status: HubStatus.Connecting, name: "Virtual Hub", device: connectingDevice });

      await delay(500);

      const connectedDevice = { gatt: { connected: true, disconnect: () => {} } } as BluetoothDevice;
      const connectedHub = updateHub(hub.id, { ...connectingHub, status: HubStatus.Connected, device: connectedDevice });

      return connectedHub;
    },
    [updateHub]
  );

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      HubUtils.assertConnected(hub);

      const retrievingCapabilitiesHub = updateHub(hub.id, { ...hub, status: HubStatus.RetrievingCapabilities });

      await delay(500);
      const capabilities = { maxWriteSize: 148 };

      return updateHub(hub.id, { ...retrievingCapabilitiesHub, status: HubStatus.Ready, capabilities });
    },
    [updateHub]
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      return disconnectHub(hub.id);
    },
    [updateHub]
  );

  return { connect, retrieveCapabilities, disconnect };
}
