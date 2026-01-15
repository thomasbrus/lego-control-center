import { useScrollArea } from "@ark-ui/react";
import { TerminalIcon } from "lucide-react";
import React, { useEffect } from "react";
import { styled } from "styled-system/jsx";
import { Card, Icon, ScrollArea } from "../ui";
import { EmptyState } from "../ui/empty-state";

export function TerminalCard({ terminalOutput }: { terminalOutput: string }) {
  const scrollArea = useScrollArea();
  const terminalLines = terminalOutput.split("\n");

  useEffect(() => {
    scrollArea.scrollToEdge({ edge: "bottom" });
  }, [terminalLines.length]);

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <TerminalIcon />
          </Icon>
          Terminal
        </Card.Title>
      </Card.Header>
      <Card.Body display="block">
        {terminalLines.join().length === 0 ? (
          <EmptyState description="No output yet." />
        ) : (
          <ScrollArea.Default value={scrollArea} size="xs" maxH="64">
            <styled.pre fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
              {terminalLines.map((terminalLine, i) => (
                <React.Fragment key={i}>
                  {terminalLine}
                  {i < terminalLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </styled.pre>
          </ScrollArea.Default>
        )}
      </Card.Body>
    </Card.Root>
  );
}
