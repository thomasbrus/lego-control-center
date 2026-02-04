export interface Motor {
  state?: MotorState;
  limits?: MotorLimits;
}

export interface MotorState {
  angle: number;
  speed: number;
  load: number;
  isStalled: boolean;
}

export interface MotorLimits {
  speed: number;
  acceleration: number;
  torque: number;
}
