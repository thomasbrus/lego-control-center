export interface PybricksHubCapabilities {
  maxWriteSize: number;
  flags: number;
  maxUserProgramSize: number;
}

export enum PybricksCapabilitiesFlag {
  HasRepl = 1 << 0,
  UserProgramMultiMpy6 = 1 << 1,
  UserProgramMultiMpy6Native6p1 = 1 << 2,
  HasPortView = 1 << 3,
  HasIMUCalibration = 1 << 4,
}

export enum PybricksStatus {
  BatteryLowVoltageWarning = 0,
  BatteryLowVoltageShutdown = 1,
  BatteryHighCurrent = 2,
  BLEAdvertising = 3,
  BLELowSignal = 4,
  PowerButtonPressed = 5,
  UserProgramRunning = 6,
  Shutdown = 7,
}

export interface PybricksStatusReport {
  flags: PybricksStatusFlags;
  runningProgId: number;
  selectedSlot: number;
}

export type PybricksStatusFlagsKey = keyof typeof PybricksStatus;
export type PybricksStatusFlags = Partial<Record<PybricksStatusFlagsKey, boolean>>;

export enum PybricksEventType {
  StatusReport = 0,
  WriteStdout = 1,
  WriteAppData = 2,
}

export interface PybricksEvent {
  type: PybricksEventType;
}

export interface PybricksStatusReportEvent extends PybricksEvent {
  type: PybricksEventType.StatusReport;
  statusReport: PybricksStatusReport;
}

export interface PybricksWriteStdoutEvent extends PybricksEvent {
  type: PybricksEventType.WriteStdout;
  text: string;
}

export interface PybricksWriteAppDataEvent extends PybricksEvent {
  type: PybricksEventType.WriteAppData;
  data: Uint8Array<ArrayBuffer>;
}

export type AnyPybricksEvent = PybricksStatusReportEvent | PybricksWriteStdoutEvent | PybricksWriteAppDataEvent;

export enum PybricksCommandType {
  StopUserProgram = 0,
  StartUserProgram = 1,
  StartRepl = 2,
  WriteUserProgramMeta = 3,
  WriteUserRam = 4,
  ResetInUpdateMode = 5,
  WriteStdin = 6,
  WriteAppData = 7,
}

export interface PybricksCommand {
  type: PybricksCommandType;
}

export interface PybricksWriteStdinCommand extends PybricksCommand {
  type: PybricksCommandType.WriteStdin;
  text: string;
}

export interface PybricksWriteAppDataCommand extends PybricksCommand {
  type: PybricksCommandType.WriteAppData;
  data: Uint8Array;
}

export type AnyPybricksCommand = PybricksWriteStdinCommand | PybricksWriteAppDataCommand;

export enum PybricksBuiltinProgramId {
  REPL = 0x80,
  PortView = 0x81,
  IMUCalibration = 0x82,
}
