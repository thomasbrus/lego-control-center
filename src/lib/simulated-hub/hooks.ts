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
      const connectingHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.Connecting,
        name: "Simulated Hub",
        device: connectingDevice,
      });

      await delay(500);

      const connectedDevice = {
        gatt: { connected: true, disconnect: () => disconnectHub(hub.id) },
      } as BluetoothDevice;

      const connectedHub = updateHub(hub.id, {
        ...connectingHub,
        status: HubStatus.Connected,
        device: connectedDevice,
      });

      return connectedHub;
    },
    [updateHub, disconnectHub]
  );

  const startNotifications = useCallback(
    async (hub: Hub) => {
      HubUtils.assertConnected(hub);

      const startingNotificationsHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.StartingNotifications,
      });

      await delay(300);

      return updateHub(hub.id, {
        ...startingNotificationsHub,
        status: HubStatus.Ready,
      });
    },
    [updateHub]
  );

  const stopNotifications = useCallback(async (hub: Hub) => {
    if (!HubUtils.isConnected(hub)) return;

    await delay(100);
  }, []);

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      HubUtils.assertConnected(hub);

      const retrievingCapabilitiesHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.RetrievingCapabilities,
      });

      await delay(500);
      const capabilities = { maxWriteSize: 148 };

      return updateHub(hub.id, {
        ...retrievingCapabilitiesHub,
        status: HubStatus.Ready,
        capabilities,
      });
    },
    [updateHub]
  );

  const startRepl = useCallback(
    async (hub: Hub) => {
      HubUtils.assertConnected(hub);

      const startingReplHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.StartingRepl,
      });

      await delay(400);

      return updateHub(hub.id, {
        ...startingReplHub,
        status: HubStatus.Ready,
      });
    },
    [updateHub]
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      if (HubUtils.isConnected(hub)) {
        await delay(200);
        return disconnectHub(hub.id);
      }
    },
    [disconnectHub]
  );

  return {
    connect,
    startNotifications,
    retrieveCapabilities,
    stopNotifications,
    startRepl,
    disconnect,
  };
}
