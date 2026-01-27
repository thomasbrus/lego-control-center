import { portName } from "@/lib/hub/utils";
import { ColorDistanceSensor } from "@/lib/sensors/type";
import { PipetteIcon, RulerDimensionLineIcon, ViewIcon } from "lucide-react";
import { Flex, Grid, styled } from "styled-system/jsx";
import { DeviceCard, DeviceDetailsSection } from "./device-card";
import { Icon, Progress, PropertyList, Text } from "./ui";

export function ColorDistanceSensorCard({ port, sensor }: { port: number; sensor: ColorDistanceSensor }) {
  return (
    <DeviceCard
      title={`Sensor Port ${portName(port)}`}
      icon={<ViewIcon />}
      imgSrc={`/images/sensors/color-distance-sensor.png`}
      name="Color Distance Sensor"
    >
      <DeviceDetailsSection type="Color & distance sensor" />
      <ColorDistanceSensorStateSection sensor={sensor} />
    </DeviceCard>
  );
}

function ColorDistanceSensorStateSection({ sensor }: { sensor: ColorDistanceSensor }) {
  if (!sensor.color || !sensor.distance) {
    return null;
  }

  return (
    <Grid borderRadius="l2" bg="gray.2" gap="4" p="4">
      <Text textStyle="label">State</Text>
      <PropertyList.Root>
        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <RulerDimensionLineIcon />
            </Icon>
            Distance
          </PropertyList.Label>
          <PropertyList.Value>{sensor.distance}%</PropertyList.Value>
        </PropertyList.Item>
        <Progress.Default value={sensor.distance} size="xs" />

        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <PipetteIcon />
            </Icon>
            Color
          </PropertyList.Label>
        </PropertyList.Item>

        <Flex p="4" borderRadius="l2" flexWrap="wrap" justifyContent="space-around" alignItems="center" bg="white" boxShadow="xs">
          <styled.div
            w="8"
            h="8"
            borderRadius="l2"
            style={{ background: `hsl(${sensor.color.hue}, ${sensor.color?.saturation}%, ${sensor.color.value}%)` }}
          ></styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Hue
            </Text>
            <Text textStyle="label">{sensor.color.hue}°</Text>
          </styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Saturation
            </Text>
            <Text textStyle="label">{sensor.color.saturation}%</Text>
          </styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Value
            </Text>
            <Text textStyle="label">{sensor.color?.value}%</Text>
          </styled.div>
        </Flex>
      </PropertyList.Root>
    </Grid>
  );
}
