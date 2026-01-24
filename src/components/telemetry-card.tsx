import { TelemetryEvent } from "@/lib/telemetry/types";
import { RadioIcon } from "lucide-react";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "styled-system/css";
import { Badge, Card, Icon, Table } from "./ui";
import { EmptyState } from "./ui/empty-state";

const scrollAreaClasses = css({
  maxHeight: "[320px]",
  height: "full",
  width: "full",
});

export function TelemetryCard({ telemetryEvents }: { telemetryEvents: TelemetryEvent[] }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <RadioIcon />
          </Icon>
          Telemetry
        </Card.Title>
      </Card.Header>
      <Card.Body display="block">
        {telemetryEvents.length === 0 ? (
          <EmptyState description="No telemetry data yet." />
        ) : (
          <ScrollToBottom className={scrollAreaClasses} initialScrollBehavior="auto">
            <Table.Root variant="surface">
              <Table.Head>
                <Table.Row>
                  <Table.Header position="sticky" top="0" zIndex="docked">
                    Type
                  </Table.Header>
                  <Table.Header position="sticky" top="0" zIndex="docked">
                    Data
                  </Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {telemetryEvents.map((telemetryEvent, index) => (
                  <TelemetryRow key={index} telemetryEvent={telemetryEvent} />
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollToBottom>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function TelemetryRow({ telemetryEvent }: { telemetryEvent: TelemetryEvent }) {
  const { type, ...data } = telemetryEvent;
  const typeName = type.replace(/([a-z])([A-Z])/g, "$1 $2");

  return (
    <Table.Row>
      <Table.Cell verticalAlign="top">
        <Badge w="full" justifyContent="center">
          {typeName}
        </Badge>
      </Table.Cell>
      <Table.Cell verticalAlign="top" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all">
        {JSON.stringify(data)}
      </Table.Cell>
    </Table.Row>
  );
}
