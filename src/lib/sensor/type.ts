export interface Sensor {
  type: SensorType;
  values: [number, number, number, number];
}

export interface SensorType {
  id: string;
  name: string;
}
