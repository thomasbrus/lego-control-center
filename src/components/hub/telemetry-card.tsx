import { TelemetryEvent } from "@/lib/telemetry/types";
import { RadioTowerIcon } from "lucide-react";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "styled-system/css";
import { Card, Icon, Table } from "../ui";
import { EmptyState } from "../ui/empty-state";

const scrollAreaClasses = css({
  height: "[320px]",
  width: "full",
});

export function TelemetryCard({ telemetryEvents }: { telemetryEvents: TelemetryEvent[] }) {
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
          <ScrollToBottom className={scrollAreaClasses}>
            <Table.Root variant="surface">
              <Table.Head>
                <Table.Row>
                  <Table.Header position="sticky" top="0" zIndex="docked">
                    Summary
                  </Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {telemetryEvents.map((telemetryEvent, index) => (
                  <Table.Row key={index}>
                    <Table.Cell fontSize="xs">{JSON.stringify(telemetryEvent)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollToBottom>
        )}
      </Card.Body>
    </Card.Root>
  );
}
