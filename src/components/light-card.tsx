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
        <Box px="6" py="8" pb="12" borderRadius="l2" bg="gray.2">
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
                ...getColorPaletteProps(String(light)),
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
        <Button disabled={!HubUtils.isRunning(hub)} variant="outline" onClick={handleTurnOff}>
          Turn off
        </Button>
        <Button disabled={!HubUtils.isRunning(hub)} onClick={handleApply}>
          Apply
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}

function SelectLabel({ value, label }: { value: string; label: string }) {
  return (
    <HStack>
      <styled.span {...css.raw({ ...getColorPaletteProps(value), w: "2", h: "2", bg: "colorPalette.8", borderRadius: "full" })} /> {label}
    </HStack>
  );
}

function getColorPaletteProps(value: string): SystemStyleObject {
  switch (value) {
    case "1":
      return css.raw({ colorPalette: "gray" });
    case "2":
      return css.raw({ colorPalette: "red" });
    case "3":
      return css.raw({ colorPalette: "orange" });
    case "4":
      return css.raw({ colorPalette: "yellow" });
    case "5":
      return css.raw({ colorPalette: "green" });
    case "6":
      return css.raw({ colorPalette: "cyan" });
    case "7":
      return css.raw({ colorPalette: "blue" });
    case "8":
      return css.raw({ colorPalette: "violet" });
    case "9":
      return css.raw({ colorPalette: "purple" });
    default:
      throw new Error("Unknown light color value: " + value);
  }
}
