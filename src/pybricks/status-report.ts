export interface PybricksStatusReport {
  flags: PybricksStatusFlags;
  runningProgId: number;
  selectedSlot: number;
}

export enum PybricksStatusFlag {
  BatteryLowVoltageWarning = 0,
  BatteryLowVoltageShutdown = 1,
  BatteryHighCurrent = 2,
  BLEAdvertising = 3,
  BLELowSignal = 4,
  PowerButtonPressed = 5,
  UserProgramRunning = 6,
  Shutdown = 7,
}

export type PybricksStatusFlagsKey = keyof typeof PybricksStatusFlag;
export type PybricksStatusFlags = Partial<Record<PybricksStatusFlagsKey, boolean>>;

export function parsePybricksStatusReport(view: DataView): PybricksStatusReport {
  return {
    flags: parseStatusFlags(view.getUint32(1, true)),
    runningProgId: view.byteLength > 5 ? view.getUint8(5) : 0,
    selectedSlot: view.byteLength > 6 ? view.getUint8(6) : 0,
  };
}

function parseStatusFlags(rawFlags: number): PybricksStatusFlags {
  const flags: PybricksStatusFlags = {};

  for (const [key, value] of Object.entries(PybricksStatusFlag)) {
    if (typeof value === "number") {
      flags[key as PybricksStatusFlagsKey] = (rawFlags & (1 << value)) !== 0;
    }
  }

  return flags;
}
