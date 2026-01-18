"use client";
import { Progress } from "@ark-ui/react/progress";
import type { ComponentProps } from "react";
import { Styles } from "styled-system/css";
import { createStyleContext, Flex } from "styled-system/jsx";
import { progress } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(progress);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(Progress.Root, "root");
export const RootProvider = withProvider(Progress.RootProvider, "root");
export const Circle = withContext(Progress.Circle, "circle");
export const CircleRange = withContext(Progress.CircleRange, "circleRange");
export const CircleTrack = withContext(Progress.CircleTrack, "circleTrack");
export const Label = withContext(Progress.Label, "label");
export const Range = withContext(Progress.Range, "range");
export const Track = withContext(Progress.Track, "track");
export const ValueText = withContext(Progress.ValueText, "valueText");
export const View = withContext(Progress.View, "view");

export type DefaultProps = RootProps & Styles & { label?: string };

export function Default({ label, children, ...props }: DefaultProps) {
  return (
    <Root {...props}>
      <Flex gap="4" alignItems="center">
        {label && <Label>{label}</Label>}
        <Track flex="1">
          <Range />
        </Track>
        {children}
      </Flex>
    </Root>
  );
}
