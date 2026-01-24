import { Badge, Button, Icon, Input, InputGroup, Progress, PropertyList, Slider, Text } from "@/components/ui";
import { portName } from "@/lib/hub/utils";
import { Motor, MotorLimits, MotorState } from "@/lib/motor/types";
import { CableIcon, CircleGaugeIcon, GaugeIcon, ZapIcon } from "lucide-react";
import { useState } from "react";
import { Flex, Grid, styled } from "styled-system/jsx";
import { DeviceCard, DeviceDetailsSection } from "./device-card";

export function MotorCard({ port, motor }: { port: number; motor: Motor }) {
  return (
    <DeviceCard
      title={`Motor Port ${portName(port)}`}
      icon={<CableIcon />}
      imgSrc={`/images/motors/motor-with-rotation-sensor.png`}
      name="Motor with rotation sensor"
    >
      <DeviceDetailsSection type="Motor with rotation sensor" />
      <MotorControlSection motor={motor} />
      <MotorStateSection motor={motor} />
      {motor.limits && <MotorLimitsSection limits={motor.limits} />}
    </DeviceCard>
  );
}

function MotorControlSection({ motor }: { motor: Motor }) {
  if (!motor.limits) {
    return null;
  }

  const [targetAngle, setTargetAngle] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(0);

  return (
    <Grid gap="4" borderRadius="l2" borderWidth="1px" borderColor="border" p="4">
      <Text textStyle="label">Control</Text>

      <Grid gap="3">
        <Flex gap="4" justifyContent="space-between" mt="3">
          <Text textStyle="label">Speed</Text>
          <Text>{targetSpeed}%</Text>
        </Flex>

        <Flex gap="4" justifyContent="space-between">
          <Text textStyle="xs" color="fg.muted">
            -100%
          </Text>

          <Slider.Root
            value={[targetSpeed]}
            onValueChange={(details) => setTargetSpeed(details.value[0])}
            onValueChangeEnd={() => setTargetSpeed(0)}
            min={-100}
            max={100}
          >
            <Slider.Control>
              <Slider.Track></Slider.Track>
              <Slider.Thumbs />
            </Slider.Control>
          </Slider.Root>

          <Text textStyle="xs" color="fg.muted">
            +100%
          </Text>
        </Flex>

        <Text textStyle="label" mt="3">
          Target Angle
        </Text>

        <Flex gap="3" justifyContent="space-between">
          <InputGroup endElement="°">
            <Input type="number" value={targetAngle} onChange={(event) => setTargetAngle(Number(event.target.value))} />
          </InputGroup>
          <Button variant="plain">Stop</Button>
          <Button variant="solid" colorPalette="primary">
            Apply
          </Button>
        </Flex>
      </Grid>
    </Grid>
  );
}

function MotorStateSection({ motor }: { motor: Motor }) {
  if (!motor.limits || !motor.state) {
    return null;
  }

  const absoluteSpeedPercentage = Math.abs(speedPercentage(motor.limits, motor.state));
  const absoluteLoadPercentage = Math.abs(loadPercentage(motor.limits, motor.state));

  return (
    <Grid borderRadius="l2" bg="gray.2" gap="4" p="4">
      <Text textStyle="label">State</Text>
      <PropertyList.Root>
        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <GaugeIcon />
            </Icon>
            Speed
          </PropertyList.Label>
          <PropertyList.Value>{absoluteSpeedPercentage.toFixed(0)}%</PropertyList.Value>
        </PropertyList.Item>
        <Progress.Default value={absoluteSpeedPercentage} size="xs" />

        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <ZapIcon />
            </Icon>
            Load
            {motor.state.isStalled && <Badge colorPalette="[danger]">Stalled</Badge>}
          </PropertyList.Label>
          <PropertyList.Value>{absoluteLoadPercentage.toFixed(0)}%</PropertyList.Value>
        </PropertyList.Item>
        <Progress.Default value={absoluteLoadPercentage} size="xs" />

        <PropertyList.Item mt="2">
          <PropertyList.Label display="flex" alignItems="center" gap="2">
            <Icon size="xs">
              <CircleGaugeIcon />
            </Icon>
            Angle
          </PropertyList.Label>
          <PropertyList.Value>{motor.state.angle}°</PropertyList.Value>
        </PropertyList.Item>
      </PropertyList.Root>
    </Grid>
  );
}

function MotorLimitsSection({ limits }: { limits: MotorLimits }) {
  return (
    <Flex p="4" borderRadius="l2" flexWrap="wrap" justifyContent="space-around" alignItems="center" borderWidth="1" borderColor="border">
      <Text textStyle="label" mr="4">
        Limits
      </Text>

      <styled.div textAlign="center">
        <Text textStyle="xs" color="fg.muted">
          Speed
        </Text>
        <Text textStyle="label">{limits.speed} °/s</Text>
      </styled.div>
      <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>
      <styled.div textAlign="center">
        <Text textStyle="xs" color="fg.muted">
          Acceleration
        </Text>
        <Text textStyle="label">{limits.speed} °/s²</Text>
      </styled.div>
      <styled.div bg="border" width="[1px]" alignSelf="stretch"></styled.div>
      <styled.div textAlign="center">
        <Text textStyle="xs" color="fg.muted">
          Torque
        </Text>
        <Text textStyle="label">{limits.speed} mNm</Text>
      </styled.div>
    </Flex>
  );
}

function speedPercentage(limits: MotorLimits, state: MotorState) {
  return (state.speed / limits.speed) * 100;
}

function loadPercentage(limits: MotorLimits, state: MotorState) {
  return (state.load / limits.torque) * 100;
}
