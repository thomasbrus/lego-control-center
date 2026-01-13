// import { parseNotification } from "@/lib/events/parsing";
// import { StatusReportEvent } from "@/lib/events/types";
// import { Hub, HubStatus } from "@/lib/hub/types";
// import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks/commands";
// import { requestDeviceOptions } from "@/lib/pybricks/constants";
// import { EventType } from "@/lib/pybricks/protocol";
// import { parseTelemetryEvent } from "@/lib/telemetry/parsing";
// import { TelemetryEvent } from "@/lib/telemetry/types";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { getCapabilities } from "../device/utils";
// import { delay } from "../utils";
// import { enterPasteMode, exitPasteMode, writeStdinWithResponse } from "./actions";
// import { HubConnectionError } from "./errors";
// import { programMain } from "./program";

// interface ConnectHubOptions {
//   addHub: (hub: Hub) => void;
//   removeHub: (id: Hub["id"]) => void;
//   updateHubStatus: (id: Hub["id"], status: HubStatus) => void;
// }

// async function connectToHub({ addHub, removeHub, updateHubStatus }: ConnectHubOptions): Promise<Hub> {
//   let deviceId: string | undefined;

//   try {
//     const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
//     deviceId = device.id;

//     const hub: Hub = { id: device.id, name: device.name, device, status: HubStatus.Connecting };

//     addHub(hub);

//     device.addEventListener("gattserverdisconnected", () => {
//       removeHub(hub.id);
//     });

//     await device.gatt?.connect();

//     updateHubStatus(hub.id, HubStatus.RetrievingCapabilities);
//     const capabilities = await getCapabilities(device);

//     addHub({ ...hub, capabilities });

//     updateHubStatus(hub.id, HubStatus.Connected);
//     const connectedHub: Hub = { ...hub, status: HubStatus.Connected, capabilities };

//     updateHubStatus(hub.id, HubStatus.StartingRepl);
//     await startReplUserProgram(hub.device);

//     updateHubStatus(hub.id, HubStatus.Connected);

//     return connectedHub;
//   } catch (e) {
//     if (HubConnectionError.isUserCancellation(e)) {
//       throw e; // Re-throw as-is for cancellation
//     }
//     throw new HubConnectionError("Failed to connect to hub", deviceId, e);
//   }
// }

// interface LaunchProgramOptions {
//   hub: Hub;
//   updateHubStatus: (id: Hub["id"], status: HubStatus) => void;
// }

// export async function launchProgram({ hub, updateHubStatus }: LaunchProgramOptions): Promise<Hub> {
//   updateHubStatus(hub.id, HubStatus.UploadingProgram);
//   await enterPasteMode(hub);
//   await writeStdinWithResponse(hub, programMain);
//   await exitPasteMode(hub);

//   // updateHubStatus(hub.id, HubStatus.StartingProgram);

//   updateHubStatus(hub.id, HubStatus.Ready);

//   return { ...hub, status: HubStatus.Ready };
// }

// export function useHubs() {
//   const { hubIds, addHub, removeHub, updateHubStatus } = useHubsContext();

//   const connect = useCallback(async () => {
//     try {
//       return await connectToHub({ addHub, removeHub, updateHubStatus });
//     } catch (e) {
//       if (HubConnectionError.isUserCancellation(e)) return;
//       if (e instanceof HubConnectionError && e.deviceId) {
//         updateHubStatus(e.deviceId, HubStatus.Error);
//       }
//       throw e;
//     }
//   }, [addHub, removeHub, updateHubStatus]);

//   return { hubIds, connect };
// }

// export function useVirtualHubs(): ReturnType<typeof useHubs> {
//   const { hubIds, addHub, updateHubStatus } = useHubsContext();

//   const connect = useCallback(async () => {
//     const id = `virtual-hub-${crypto.randomUUID()}`;
//     const hub: Hub = {
//       id,
//       name: "Virtual Hub",
//       device: {} as BluetoothDevice,
//       status: HubStatus.Connecting,
//       capabilities: {
//         maxWriteSize: 148,
//       },
//     };
//     addHub(hub);

//     await delay(100);
//     updateHubStatus(id, HubStatus.RetrievingCapabilities);

//     await delay(100);
//     updateHubStatus(id, HubStatus.Connected);

//     await delay(50);
//     updateHubStatus(id, HubStatus.StartingRepl);

//     await delay(100);
//     updateHubStatus(id, HubStatus.UploadingProgram);

//     await delay(200);
//     updateHubStatus(id, HubStatus.StartingProgram);

//     await delay(100);
//     updateHubStatus(id, HubStatus.Ready);

//     return { ...hub, status: HubStatus.Ready };
//   }, [addHub, updateHubStatus]);

//   return { hubIds, connect };
// }

// export function useHub(id: Hub["id"]) {
//   const { getHub, updateHubStatusFlags } = useHubsContext();
//   const [stdout, setStdout] = useState("");
//   const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);

//   const hub = getHub(id);
//   const unsubscribeRef = useRef<null | (() => Promise<void>)>(null);

//   useEffect(() => {
//     let active = true;

//     async function setupNotifications() {
//       if (!hub || hub.status !== HubStatus.Connected) return;

//       try {
//         const controlCharacteristic = await getPybricksControlCharacteristic(hub.device);

//         const listener = (domEvent: Event) => {
//           const target = domEvent.target as BluetoothRemoteGATTCharacteristic;
//           if (!target.value) return;

//           const event = parseNotification(target.value, new Date());

//           if (event) {
//             if (event.type === EventType.StatusReport) {
//               console.log("Status report event:", event);
//               updateHubStatusFlags(id, event.flags);
//             }

//             if (event.type === EventType.WriteStdout) {
//               setStdout((prev) => (prev + event.message).slice(-10000));
//             }

//             if (event.type === EventType.WriteAppData) {
//               try {
//                 const telemetryEvent = parseTelemetryEvent(event.data);
//                 setTelemetryEvents((prev) => [...prev, telemetryEvent].slice(-100));
//               } catch (error) {
//                 console.error("Failed to parse telemetry event:", error);
//               }
//             }
//           }
//         };

//         controlCharacteristic.addEventListener("characteristicvaluechanged", listener);
//         await controlCharacteristic.startNotifications();

//         const unsubscribe = async () => {
//           controlCharacteristic.removeEventListener("characteristicvaluechanged", listener);
//           try {
//             await controlCharacteristic.stopNotifications();
//           } catch {
//             // Ignore errors - device is likely already disconnected
//           }
//         };

//         if (active) {
//           unsubscribeRef.current = unsubscribe;
//         } else {
//           await unsubscribe();
//         }
//       } catch {
//         // Swallow errors for notification setup; hub may disconnect quickly
//       }
//     }

//     setupNotifications();

//     return () => {
//       active = false;
//       const unsubscribe = unsubscribeRef.current;
//       unsubscribeRef.current = null;
//       if (unsubscribe) void unsubscribe();
//     };
//   }, [hub?.id, hub?.status]);

//   const terminalLines = stdout.split(/\r?\n/);

//   return { hub, terminalLines, telemetryEvents } as const;
// }

// export function useVirtualHub(id: Hub["id"]): ReturnType<typeof useHub> {
//   const { getHub, updateHubStatusFlags } = useHubsContext();
//   const [terminalLines, setTerminalLines] = useState<string[]>([]);
//   const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
//   const hub = getHub(id);

//   useEffect(() => {
//     if (!hub || hub.status !== HubStatus.Connected) return;

//     async function emitVirtualEvents() {
//       await delay(100);

//       const statusEvent1: StatusReportEvent = {
//         type: EventType.StatusReport,
//         flags: { BatteryLowVoltageWarning: true },
//         runningProgId: 0,
//         selectedSlot: 0,
//         receivedAt: new Date(),
//       };

//       updateHubStatusFlags(id, statusEvent1.flags);

//       await delay(50);

//       setTerminalLines((prev) => [...prev, "Virtual Hub initialized"]);

//       await delay(100);

//       const statusEvent2: StatusReportEvent = {
//         type: EventType.StatusReport,
//         flags: { BatteryLowVoltageWarning: false },
//         runningProgId: 1,
//         selectedSlot: 0,
//         receivedAt: new Date(),
//       };

//       updateHubStatusFlags(id, statusEvent2.flags);

//       await delay(50);

//       setTerminalLines((prev) => [...prev, ">>> "]);

//       await delay(200);

//       setTerminalLines((prev) => [...prev, "print('Hello from Virtual Hub!')", "Hello from Virtual Hub!", ">>> "]);

//       for (let i = 0; i < 12; i++) {
//         await delay(200);
//         const telemetryEvent: TelemetryEvent = {
//           time: i * 500,
//           hubBattery: Math.max(20, 100 - i * 2),
//           motorAngles: [i * 10, i * 15, i * 12, i * 8],
//           motorSpeeds: [100 + i * 5, 120 + i * 3, 110 + i * 4, 90 + i * 6],
//           lightStatus: i % 10,
//         };
//         setTelemetryEvents((prev) => [...prev, telemetryEvent].slice(-100));
//       }
//     }

//     emitVirtualEvents();
//   }, [hub?.id, hub?.status]);

//   return { hub, terminalLines, telemetryEvents } as const;
// }
