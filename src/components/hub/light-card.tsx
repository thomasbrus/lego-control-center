import { Button, Card, Icon, Select } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import { Hub } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { createListCollection } from "@ark-ui/react";
import { LightbulbIcon } from "lucide-react";
import { useState } from "react";
import { ValueChangeDetails } from "../ui/select";

const lightCollection = createListCollection({
  items: [
    { value: "1", label: "Black" },
    { value: "2", label: "Red" },
    { value: "3", label: "Orange" },
    { value: "4", label: "Yellow" },
    { value: "5", label: "Green" },
    { value: "6", label: "Cyan" },
    { value: "7", label: "Blue" },
    { value: "8", label: "Violet" },
    { value: "9", label: "Magenta" },
  ],
});

export function LightCard({ hub }: { hub: Hub }) {
  const [light, setLight] = useState<number>(5);

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
