export interface Sensor {
  type: SensorType;
  values: [number, number, number, number];
}

export type SensorType = { id: "color-distance-sensor"; name: "Color Distance Sensor" };
