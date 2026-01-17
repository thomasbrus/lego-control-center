export interface MotorModel {
  angle?: number;
  speed?: number;
  load?: number;
  isStalled?: boolean;
  limits?: MotorLimits;
}

export interface MotorLimits {
  speed: number;
  acceleration: number;
  torque: number;
}
