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
