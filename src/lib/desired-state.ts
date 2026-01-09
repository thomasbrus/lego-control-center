export enum LightState {
  OFF = "OFF",
  GREEN = "Color.GREEN",
  RED = "Color.RED",
  BLUE = "Color.BLUE",
  YELLOW = "Color.YELLOW",
}

export interface DesiredState {
  light: LightState;
}
