import { TerminalIcon } from "lucide-react";
import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";
import { Card, Icon } from "./ui";
import { EmptyState } from "./ui/empty-state";

const scrollAreaClasses = css({
  maxHeight: "[320px]",
  height: "full",
  width: "full",
});

export function TerminalCard({ terminalOutput }: { terminalOutput: string }) {
  const terminalLines = terminalOutput.split("\n");

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
          <ScrollToBottom className={scrollAreaClasses} initialScrollBehavior="auto">
            <styled.pre fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
              {terminalLines.map((terminalLine, i) => (
                <React.Fragment key={i}>
                  {terminalLine}
                  {i < terminalLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </styled.pre>
          </ScrollToBottom>
        )}
      </Card.Body>
    </Card.Root>
  );
}
