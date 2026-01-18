import { AngleSlider, Card, Icon } from "@/components/ui";
import { Hub } from "@/lib/hub/types";
import { Rotate3DIcon } from "lucide-react";
import { Box, Grid } from "styled-system/jsx";

export function IMUCard({ hub }: { hub: Hub }) {
  const values = hub?.imu ?? { pitch: 0, roll: 0, heading: 0 };
  const disabled = !hub?.imu;

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <Rotate3DIcon />
          </Icon>
          IMU
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Box p="4" py="8" borderRadius="l2" bg="gray.2">
          <Grid gridTemplateColumns="repeat(auto-fit, minmax(96px, 1fr))" gap="4" maxW="sm" mx="auto">
            <AngleSlider.Default disabled={disabled} readOnly label="Pitch" value={values.pitch} colorPalette="[green]" />
            <AngleSlider.Default disabled={disabled} readOnly label="Roll" value={values.roll} colorPalette="[green]" />
            <AngleSlider.Default disabled={disabled} readOnly label="Heading" value={values.heading} colorPalette="[green]" />
          </Grid>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
