import { parseNotification } from "@/lib/events/parsing";
import { StatusReportEvent } from "@/lib/events/types";
import { disconnect, enterPasteMode, exitPasteMode, hubShutdown, writeStdinWithResponse } from "@/lib/hubs/actions";
import { HubsContext } from "@/lib/hubs/context";
import { programMain, programRun } from "@/lib/hubs/program";
import { Hub, HubStatus } from "@/lib/hubs/types";
import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks/commands";
import { requestDeviceOptions } from "@/lib/pybricks/constants";
import { EventType } from "@/lib/pybricks/protocol";
import { parseTelemetryEvent } from "@/lib/telemetry/parsing";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getCapabilities } from "../device/utils";
import { delay } from "../utils";

export function useHubs() {
  const { hubIds, addHub, removeHub, updateHubStatus } = useHubsContext();

  const connect = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
      const hub: Hub = { id: device.id, name: device.name, device, status: HubStatus.Connecting };

      addHub(hub);

      device.addEventListener("gattserverdisconnected", () => {
        removeHub(device.id);
      });

      await device.gatt?.connect();
      updateHubStatus(device.id, HubStatus.RetrievingCapabilities);

      const capabilities = await getCapabilities(device);
      updateHubStatus(device.id, HubStatus.StartingRepl);

      await startReplUserProgram(device);

      // Create a temporary hub object with capabilities for writeStdinWithResponse
      const hubWithCapabilities: Hub = { ...hub, status: HubStatus.UploadingProgram, capabilities };
      updateHubStatus(device.id, HubStatus.UploadingProgram);

      // Enter paste mode, upload program, exit paste mode
      await enterPasteMode(hubWithCapabilities);
      await writeStdinWithResponse(hubWithCapabilities, programMain);
      await exitPasteMode(hubWithCapabilities);

      // Run the program
      updateHubStatus(device.id, HubStatus.StartingProgram);
      await writeStdinWithResponse(hubWithCapabilities, programRun);

      const connectedHub: Hub = { ...hub, status: HubStatus.Ready, capabilities };

      addHub(connectedHub);

      return connectedHub;
    } catch (e) {
      // User cancelled the device picker - not an error
      if (e instanceof DOMException && e.name === "NotFoundError") return;
      throw e;
    }
  }, [addHub, removeHub, updateHubStatus]);

  return { hubIds, connect };
}

export function useVirtualHubs(): ReturnType<typeof useHubs> {
  const { hubIds, addHub, updateHubStatus } = useHubsContext();

  const connect = useCallback(async () => {
    const id = `virtual-hub-${crypto.randomUUID()}`;
    const hub: Hub = {
      id,
      name: "Virtual Hub",
      device: {} as BluetoothDevice,
      status: HubStatus.Connecting,
      capabilities: {
        maxWriteSize: 24,
      },
    };
    addHub(hub);

    await delay(100);
    updateHubStatus(id, HubStatus.RetrievingCapabilities);

    await delay(50);
    updateHubStatus(id, HubStatus.StartingRepl);

    await delay(100);
    updateHubStatus(id, HubStatus.UploadingProgram);

    await delay(200);
    updateHubStatus(id, HubStatus.StartingProgram);

    await delay(100);
    updateHubStatus(id, HubStatus.Ready);

    return { ...hub, status: HubStatus.Ready };
  }, [addHub, updateHubStatus]);

  return { hubIds, connect };
}

export function useHub(id: Hub["id"]) {
  const { getHub, updateHubStatusFlags } = useHubsContext();
  const [stdout, setStdout] = useState("");
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);

  const hub = getHub(id);
  const unsubscribeRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    let active = true;

    async function setupNotifications() {
      if (!hub || hub.status !== HubStatus.Ready) return;

      try {
        const controlCharacteristic = await getPybricksControlCharacteristic(hub.device);

        const listener = (domEvent: Event) => {
          const target = domEvent.target as BluetoothRemoteGATTCharacteristic;
          if (!target.value) return;

          const event = parseNotification(target.value, new Date());

          if (event) {
            if (event.type === EventType.StatusReport) {
              updateHubStatusFlags(id, event.flags);
            }

            if (event.type === EventType.WriteStdout) {
              setStdout((prev) => (prev + event.message).slice(-1000));
            }

            if (event.type === EventType.WriteAppData) {
              try {
                const telemetryEvent = parseTelemetryEvent(event.data);
                setTelemetryEvents((prev) => [...prev, telemetryEvent].slice(-100));
              } catch (error) {
                console.error("Failed to parse telemetry event:", error);
              }
            }
          }
        };

        controlCharacteristic.addEventListener("characteristicvaluechanged", listener);
        await controlCharacteristic.startNotifications();

        const unsubscribe = async () => {
          controlCharacteristic.removeEventListener("characteristicvaluechanged", listener);
          try {
            await controlCharacteristic.stopNotifications();
          } catch {
            // Ignore errors - device is likely already disconnected
          }
        };

        if (active) {
          unsubscribeRef.current = unsubscribe;
        } else {
          await unsubscribe();
        }
      } catch {
        // Swallow errors for notification setup; hub may disconnect quickly
      }
    }

    setupNotifications();

    return () => {
      active = false;
      const unsubscribe = unsubscribeRef.current;
      unsubscribeRef.current = null;
      if (unsubscribe) void unsubscribe();
    };
  }, [hub?.id, hub?.status]);

  const terminalLines = stdout.split(/\r?\n/);

  return { hub, terminalLines, telemetryEvents } as const;
}

export function useVirtualHub(id: Hub["id"]): ReturnType<typeof useHub> {
  const { getHub, updateHubStatusFlags } = useHubsContext();
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const hub = getHub(id);

  useEffect(() => {
    if (!hub || hub.status !== HubStatus.Ready) return;

    async function emitVirtualEvents() {
      await delay(100);

      const statusEvent1: StatusReportEvent = {
        type: EventType.StatusReport,
        flags: { BatteryLowVoltageWarning: true },
        runningProgId: 0,
        selectedSlot: 0,
        receivedAt: new Date(),
      };

      updateHubStatusFlags(id, statusEvent1.flags);

      await delay(50);

      setTerminalLines((prev) => [...prev, "Virtual Hub initialized"]);

      await delay(100);

      const statusEvent2: StatusReportEvent = {
        type: EventType.StatusReport,
        flags: { BatteryLowVoltageWarning: false },
        runningProgId: 1,
        selectedSlot: 0,
        receivedAt: new Date(),
      };

      updateHubStatusFlags(id, statusEvent2.flags);

      await delay(50);

      setTerminalLines((prev) => [...prev, ">>> "]);

      await delay(500);

      setTerminalLines((prev) => [...prev, "print('Hello from Virtual Hub!')", "Hello from Virtual Hub!", ">>> "]);

      // Emit mock telemetry events
      for (let i = 0; i < 20; i++) {
        await delay(500);
        const telemetryEvent: TelemetryEvent = {
          time: i * 500,
          hubBattery: Math.max(20, 100 - i * 2),
          motorAngles: [i * 10, i * 15, i * 12, i * 8],
          motorSpeeds: [100 + i * 5, 120 + i * 3, 110 + i * 4, 90 + i * 6],
          lightStatus: i % 10,
        };
        setTelemetryEvents((prev) => [...prev, telemetryEvent].slice(-100));
      }
    }

    emitVirtualEvents();
  }, [hub?.id, hub?.status]);

  return { hub, terminalLines, telemetryEvents } as const;
}

export function useHubActions(id: Hub["id"]) {
  const { getHub, removeHub } = useHubsContext();

  const disconnectHub = useCallback(async () => {
    const hub = getHub(id);
    await disconnect(hub);
    removeHub(id);
  }, [id, getHub, removeHub]);

  const shutdownHub = useCallback(async () => {
    const hub = getHub(id);
    await hubShutdown(hub);
    removeHub(id);
  }, [id, getHub, removeHub]);

  return { disconnectHub, shutdownHub };
}

export function useVirtualHubActions(id: Hub["id"]): ReturnType<typeof useHubActions> {
  const { removeHub, updateHubStatus } = useHubsContext();

  const disconnectHub = useCallback(async () => {
    updateHubStatus(id, HubStatus.Disconnected);
    await delay(200);
    removeHub(id);
  }, [id, removeHub, updateHubStatus]);

  const shutdownHub = useCallback(async () => {
    updateHubStatus(id, HubStatus.Disconnected);
    await delay(300);
    removeHub(id);
  }, [id, removeHub, updateHubStatus]);

  return { disconnectHub, shutdownHub } as const;
}

function useHubsContext() {
  const value = useContext(HubsContext);
  if (!value) throw new Error("HubsContext missing");
  return value;
}
