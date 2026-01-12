export interface TelemetryEvent {
  time: number;
  hubBattery: number;
  motorAngles: number[];
  motorSpeeds: number[];
  lightStatus: number;
}
