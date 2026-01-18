import { Sensor } from "@/lib/sensor/type";

export function SensorCard({ port, sensor }: { port: number; sensor: Sensor }) {
  return (
    <div>
      Sensor {port} {JSON.stringify(sensor)}
    </div>
  );
}
