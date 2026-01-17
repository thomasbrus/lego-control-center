import { AngleSlider, Card, Icon } from "@/components/ui";
import { Hub } from "@/lib/hub/types";
import { CompassIcon } from "lucide-react";
import { Grid } from "styled-system/jsx";

export function IMUCard({ hub }: { hub: Hub }) {
  const values = hub?.imu ?? { pitch: 0, roll: 0, yaw: 0 };
  const disabled = !hub?.imu;

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <CompassIcon />
          </Icon>
          IMU
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Grid gridTemplateColumns="repeat(auto-fit, minmax(96px, 1fr))" gap="4">
          <AngleSlider.Default disabled={disabled} readOnly label="Pitch" value={values.pitch} colorPalette="red" />
          <AngleSlider.Default disabled={disabled} readOnly label="Roll" value={values.roll} colorPalette="green" />
          <AngleSlider.Default disabled={disabled} readOnly label="Yaw" value={values.yaw} colorPalette="blue" />
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
