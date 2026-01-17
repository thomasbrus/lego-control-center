"use client";
import { createStyleContext } from "styled-system/jsx";

import { ark } from "@ark-ui/react";
import { AngleSlider, useAngleSliderContext } from "@ark-ui/react/angle-slider";
import { ComponentProps } from "react";
import { vstack } from "styled-system/patterns";
import { angleSlider } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(angleSlider);

export const StyledRoot = withProvider(AngleSlider.Root, "root");

export function Root(props: ComponentProps<typeof StyledRoot>) {
  return (
    <StyledRoot
      style={{ "--angle-slider-size": `100%`, "--angle-slider-thickness": `7.5%`, ...props.style } as React.CSSProperties}
      {...props}
    />
  );
}

export const Control = withContext(AngleSlider.Control, "control");
export const Thumb = withContext(AngleSlider.Thumb, "thumb");
export const ThumbIndicator = withContext(ark.span, "thumbIndicator");
export const HiddenInput = AngleSlider.HiddenInput;

const StyledValueText = withContext(AngleSlider.ValueText, "valueText");
const StyledLabel = withContext(AngleSlider.Label, "label");

export function ValueText({ label }: { label: string }) {
  const api = useAngleSliderContext();
  return (
    <div className={vstack({ gap: "0" })}>
      <StyledValueText>{api.value}°</StyledValueText>
      <StyledLabel>{label}</StyledLabel>
    </div>
  );
}

const StyledRingTrack = withContext(ark.circle, "ringTrack");
const StyledRingRange = withContext(ark.circle, "ringRange");

export function ProgressRing({ label }: { label: string }) {
  const api = useAngleSliderContext();
  const percent = (api.value / 360) * 100;
  return (
    <svg width="100%" style={{ aspectRatio: "1 / 1", "--angle-slider-percent": percent } as React.CSSProperties}>
      <title>{label}</title>
      <StyledRingTrack />
      <StyledRingRange />
    </svg>
  );
}

export function Default({ children, label, ...props }: ComponentProps<typeof Root> & { label: string }) {
  return (
    <Root {...props}>
      <Control>
        <ProgressRing label={label} />
        <Thumb>
          <ThumbIndicator />
        </Thumb>
      </Control>
      <ValueText label={label} />
      <HiddenInput />
    </Root>
  );
}
