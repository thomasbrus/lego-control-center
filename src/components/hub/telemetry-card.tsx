import { TelemetryEvent } from "@/lib/telemetry/types";
import { useScrollArea } from "@ark-ui/react";
import { RadioTowerIcon } from "lucide-react";
import { useEffect } from "react";
import { Card, Icon, ScrollArea, Table } from "../ui";
import { EmptyState } from "../ui/empty-state";

export function TelemetryCard({ telemetryEvents }: { telemetryEvents: TelemetryEvent[] }) {
  const scrollArea = useScrollArea();

  useEffect(() => {
    scrollArea.scrollToEdge({ edge: "bottom" });
  }, [telemetryEvents.length]);

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <RadioTowerIcon />
          </Icon>
          Telemetry
        </Card.Title>
      </Card.Header>
      <Card.Body display="block">
        {telemetryEvents.length === 0 ? (
          <EmptyState description="No telemetry data yet." />
        ) : (
          <ScrollArea.Default value={scrollArea} size="xs" maxH="64">
            <Table.Root variant="surface">
              <Table.Head>
                <Table.Row>
                  <Table.Header>Index</Table.Header>
                  <Table.Header>Summary</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {telemetryEvents.map((telemetryEvent, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index}</Table.Cell>
                    <Table.Cell fontSize="xs">{JSON.stringify(telemetryEvent)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea.Default>
        )}
      </Card.Body>
    </Card.Root>
  );
}
