import { Button, Card } from "@/components/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Box, styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <styled.main p="8" display="grid" gridTemplateColumns={{ lg: "1fr 1fr 1fr" }} gap="8">
      <div>
        <Card.Root>
          <Card.Header>
            <Card.Title>Hubs</Card.Title>
            <Card.Description>Description</Card.Description>
          </Card.Header>
          <Card.Body>
            <Box bg="gray.subtle.bg" minH="48" borderRadius="l2" />
          </Card.Body>
          <Card.Footer>
            <Button variant="outline" colorPalette="gray">
              Secondary
            </Button>
            <Button>Primary</Button>
          </Card.Footer>
        </Card.Root>
      </div>
    </styled.main>
  );
}
