import { Button, Card, Heading } from "@/components/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Box, styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <styled.div h="dvh" display="grid" gridTemplateRows="auto 1fr">
      <styled.header bg="[red]]" p="8" borderBottomWidth="1" borderColor="border">
        <Heading>LEGO Control Center</Heading>
      </styled.header>
      <styled.main p="8" display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="8">
        <div>
          <Card.Root>
            <Card.Header>
              <Card.Title>Title</Card.Title>
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
    </styled.div>
  );
}
