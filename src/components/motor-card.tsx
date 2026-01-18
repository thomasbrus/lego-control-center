import { Card, Icon } from "@/components/ui";
import { Motor } from "@/lib/motor/types";
import { CableIcon } from "lucide-react";
import { Box } from "styled-system/jsx";

export function MotorCard({ motor }: { motor: Motor }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <CableIcon />
          </Icon>
          Motor Port A
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Box p="4" py="8" borderRadius="l2" bg="gray.2" justifyContent="space-around" gap="4" alignItems="center">
          ...motor...
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
