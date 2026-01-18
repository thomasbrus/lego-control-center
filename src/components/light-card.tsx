import { Button, Card, Icon, IconButton, Select } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import { Hub } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { createListCollection } from "@ark-ui/react";
import { ArrowLeftIcon, ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, HStack, styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { ValueChangeDetails } from "./ui/select";

const lightCollection = createListCollection({
  items: [
    {
      value: "1",
      label: <SelectLabel value="1" label="Black" />,
    },
    {
      value: "2",
      label: <SelectLabel value="2" label="Red" />,
    },
    {
      value: "3",
      label: <SelectLabel value="3" label="Orange" />,
    },
    {
      value: "4",
      label: <SelectLabel value="4" label="Yellow" />,
    },
    {
      value: "5",
      label: <SelectLabel value="5" label="Green" />,
    },
    {
      value: "6",
      label: <SelectLabel value="6" label="Cyan" />,
    },
    {
      value: "7",
      label: <SelectLabel value="7" label="Blue" />,
    },
    {
      value: "8",
      label: <SelectLabel value="8" label="Violet" />,
    },
    {
      value: "9",
      label: <SelectLabel value="9" label="Magenta" />,
    },
  ],
});

export function LightCard({ hub }: { hub: Hub }) {
  const [light, setLight] = useState<number>(8);

  function handleTurnOff() {
    HubCommands.setHubLight(hub, 0);
  }

  function handleApply() {
    HubCommands.setHubLight(hub, light);
  }

  function handleValueChange(details: ValueChangeDetails) {
    setLight(Number(details.value));
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <LightbulbIcon />
          </Icon>
          Light
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Box px="6" py="8" pb="12" borderRadius="l2" borderWidth="1px" borderColor="border">
          <Flex justifyContent="space-around" columnGap="4" rowGap="8" alignItems="center" flexWrap="wrap" maxW="sm" mx="auto">
            <styled.div w="full">
              <Select.Default
                label="Color"
                collection={lightCollection}
                disabled={!HubUtils.isConnected(hub)}
                value={[String(light)]}
                onValueChange={handleValueChange}
              >
                {lightCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Default>
            </styled.div>
            <IconButton variant="surface" onClick={() => setLight(light - 1)} disabled={light <= 1}>
              <ArrowLeftIcon />
            </IconButton>
            <styled.span
              {...css.raw({
                ...lightColorPaletteProps(light),
                w: "8",
                h: "8",
                bg: "colorPalette.6",
                borderRadius: "full",
                "--primary": "token(colors.colorPalette.8)",
                "--secondary": "token(colors.colorPalette.3)",
                boxShadow:
                  "[inset 0 0 5px token(colors.colorPalette.11), inset 2px 0 8px var(--primary), inset -2px 0 8px var(--secondary), inset 2px 0 12px var(--primary), inset -2px 0 12px var(--secondary), 0 0 5px #fff, -1px 0 8px var(--primary), 1px 0 8px var(--secondary)]",
              })}
            />

            <IconButton variant="surface" onClick={() => setLight(light + 1)} disabled={light >= lightCollection.items.length}>
              <ArrowRightIcon />
            </IconButton>
          </Flex>
        </Box>
      </Card.Body>
      <Card.Footer>
        <Button disabled={!HubUtils.isRunning(hub)} onClick={handleTurnOff} variant="plain">
          Turn Off
        </Button>
        <Button disabled={!HubUtils.isRunning(hub)} onClick={handleApply} colorPalette="primary">
          Apply
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}

function SelectLabel({ value, label }: { value: string; label: string }) {
  return (
    <HStack>
      <styled.span {...css.raw({ ...lightColorPaletteProps(Number(value)), w: "2", h: "2", bg: "colorPalette.8", borderRadius: "full" })} />{" "}
      {label}
    </HStack>
  );
}

function lightColorPaletteProps(value: number): SystemStyleObject {
  const arr = [
    css.raw({ colorPalette: "gray" }),
    css.raw({ colorPalette: "red" }),
    css.raw({ colorPalette: "orange" }),
    css.raw({ colorPalette: "yellow" }),
    css.raw({ colorPalette: "green" }),
    css.raw({ colorPalette: "cyan" }),
    css.raw({ colorPalette: "blue" }),
    css.raw({ colorPalette: "violet" }),
    css.raw({ colorPalette: "purple" }),
  ];

  return arr[value - 1] || arr[0];
}
