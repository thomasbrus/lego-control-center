import { portName } from "@/lib/hub/utils";
import { Sensor } from "@/lib/sensor/type";
import { PipetteIcon, RulerDimensionLineIcon, ViewIcon } from "lucide-react";
import { Flex, Grid, styled } from "styled-system/jsx";
import { Card, Icon, Progress, PropertyList, Text } from "./ui";

export function SensorCard({ port, sensor }: { port: number; sensor: Sensor }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" alignItems="center" gap="2">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <ViewIcon />
          </Icon>
          Sensor Port {portName(port)}
        </Card.Title>

        <styled.div ml="auto" p="4" my="-7" mr="-4">
          <styled.img src={`/images/sensors/${sensor.type.id}.png`} alt={sensor.type.name} w="12" mixBlendMode="luminosity" />
        </styled.div>
      </Card.Header>
      <Card.Body gap="6">
        <SensorDetailsSection sensor={sensor} />
        {sensor.type.id === "color-distance-sensor" && <ColorDistanceSensorStateSection sensor={sensor} />}
      </Card.Body>
    </Card.Root>
  );
}

function SensorDetailsSection({ sensor }: { sensor: Sensor }) {
  return (
    <PropertyList.Root>
      <PropertyList.Item>
        <PropertyList.Label>Type</PropertyList.Label>
        <PropertyList.Value>{sensor.type.name}</PropertyList.Value>
      </PropertyList.Item>
    </PropertyList.Root>
  );
}

function ColorDistanceSensorStateSection({ sensor }: { sensor: Sensor }) {
  const [distance, ...color] = sensor.values;

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
          <PropertyList.Value>{distance}%</PropertyList.Value>
        </PropertyList.Item>
        <Progress.Default value={distance} size="xs" />

        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <PipetteIcon />
            </Icon>
            Color
          </PropertyList.Label>
        </PropertyList.Item>

        <Flex p="4" borderRadius="l2" flexWrap="wrap" justifyContent="space-around" alignItems="center" bg="white" boxShadow="xs">
          <styled.div w="8" h="8" borderRadius="l2" style={{ background: `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)` }}></styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Hue
            </Text>
            <Text textStyle="label">{color[0]}°</Text>
          </styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Saturation
            </Text>
            <Text textStyle="label">{color[1]}%</Text>
          </styled.div>

          <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>

          <styled.div textAlign="center">
            <Text textStyle="xs" color="fg.muted">
              Value
            </Text>
            <Text textStyle="label">{color[2]}%</Text>
          </styled.div>
        </Flex>
      </PropertyList.Root>
    </Grid>
  );
}
