import * as DeviceUtils from "@/lib/device/utils";
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

      return updateHub(hub.id, {
        ...connectingHub,
        status: HubStatus.Connected,
        device: connectedDevice,
      });
    },
    [updateHub, disconnectHub]
  );

  const startNotifications = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

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
      DeviceUtils.assertConnected(hub.device);

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
      DeviceUtils.assertConnected(hub.device);

      const startingReplHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.StartingRepl,
      });

      await delay(400);

      //       const output = `
      // Pybricks MicroPython ci-release-86-v3.6.1 on 2025-03-11; LEGO Technic Hub with STM32L431RC
      // Type "help()" for more information.
      // >>>
      // paste mode; Ctrl-C to cancel, Ctrl-D to finish
      // ===
      // ===
      // print("Hello world!");
      //       `;

      //       // Simulate REPL output by outputting in chunks
      //       const chunkSize = 40;
      //       for (let i = 0; i < output.length; i += chunkSize) {
      //         const chunk = output.slice(i, i + chunkSize);
      //         // In a real implementation, this would trigger an event or callback
      //         console.log(chunk);
      //         await delay(100);
      //       }

      return updateHub(hub.id, {
        ...startingReplHub,
        status: HubStatus.Ready,
      });
    },
    [updateHub]
  );

  const launchProgram = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

      const launchingProgramHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.LaunchingProgram,
      });

      await delay(800);

      return updateHub(hub.id, {
        ...launchingProgramHub,
        status: HubStatus.Running,
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
    launchProgram,
    disconnect,
  };
}
