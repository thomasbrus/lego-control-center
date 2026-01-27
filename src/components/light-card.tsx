import { Card, Icon, IconButton, Select } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import { Hub } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { createListCollection } from "@ark-ui/react";
import { ArrowLeftIcon, ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Flex, HStack, styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { ValueChangeDetails } from "./ui/select";

const colorNames = ["none", "red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta"];

const colorNamesCollection = createListCollection({
  items: colorNames.map((color) => ({
    value: color,
    label: <SelectLabel value={color} label={color.charAt(0).toUpperCase() + color.slice(1)} />,
  })),
});

export function LightCard({ hub }: { hub: Hub }) {
  const [colorName, setColorName] = useState<string>("none");

  function handleValueChange(details: ValueChangeDetails) {
    const colorName = String(details.value);
    setColorName(colorName);
    performLightCommand(hub, colorName);
  }

  const previousColorName = colorNames[colorNames.indexOf(colorName) - 1];
  const nextColorName = colorNames[colorNames.indexOf(colorName) + 1];

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
      <Card.Body gap="6">
        <styled.div w="full">
          <Select.Default
            label="Color"
            collection={colorNamesCollection}
            disabled={!HubUtils.isConnected(hub)}
            value={[String(colorName)]}
            onValueChange={handleValueChange}
          >
            {colorNamesCollection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Default>
        </styled.div>
        <Flex justifyContent="space-between" alignItems="center" columnGap="4" rowGap="8">
          <IconButton variant="surface" onClick={() => setColorName(previousColorName)} disabled={!previousColorName}>
            <ArrowLeftIcon />
          </IconButton>
          <styled.span
            {...css.raw({
              ...previewColorPaletteProps(colorName),
              w: "8",
              h: "8",
              bg: "colorPalette.6",
              borderRadius: "full",
              "--primary": "token(colors.colorPalette.8)",
              "--secondary": "token(colors.colorPalette.4)",
              boxShadow:
                "[inset 0 0 5px token(colors.colorPalette.11), inset 2px 0 8px var(--primary), inset -2px 0 8px var(--secondary), inset 2px 0 12px var(--primary), inset -2px 0 12px var(--secondary), -1px 0 16px var(--primary), 1px 0 4px var(--secondary)]",
            })}
          />

          <IconButton variant="surface" onClick={() => setColorName(nextColorName)} disabled={!nextColorName}>
            <ArrowRightIcon />
          </IconButton>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}

function SelectLabel({ value, label }: { value: string; label: string }) {
  return (
    <HStack>
      <styled.span {...css.raw({ ...previewColorPaletteProps(value), w: "2", h: "2", bg: "colorPalette.8", borderRadius: "full" })} />{" "}
      {label}
    </HStack>
  );
}

function previewColorPaletteProps(value: string): SystemStyleObject {
  const colorPalettes: Record<string, SystemStyleObject> = {
    none: css.raw({ colorPalette: "gray" }),
    red: css.raw({ colorPalette: "red" }),
    orange: css.raw({ colorPalette: "orange" }),
    yellow: css.raw({ colorPalette: "yellow" }),
    green: css.raw({ colorPalette: "green" }),
    cyan: css.raw({ colorPalette: "cyan" }),
    blue: css.raw({ colorPalette: "blue" }),
    violet: css.raw({ colorPalette: "violet" }),
    magenta: css.raw({ colorPalette: "purple" }),
  };

  return colorPalettes[value] || colorPalettes["none"];
}

function performLightCommand(hub: Hub, colorName: string) {
  if (colorName === "none") {
    HubCommands.turnLightOff(hub);
  } else {
    const colors: Record<string, { hue: number; saturation: number; value: number }> = {
      red: { hue: 0, saturation: 100, value: 100 },
      orange: { hue: 30, saturation: 100, value: 100 },
      yellow: { hue: 60, saturation: 100, value: 100 },
      green: { hue: 120, saturation: 100, value: 100 },
      cyan: { hue: 180, saturation: 100, value: 100 },
      blue: { hue: 240, saturation: 100, value: 100 },
      violet: { hue: 270, saturation: 100, value: 100 },
      magenta: { hue: 300, saturation: 100, value: 100 },
    };

    HubCommands.turnLightOn(hub, colors[colorName]);
  }
}
