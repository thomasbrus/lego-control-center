import { angleSliderAnatomy } from "@ark-ui/react";
import { defineSlotRecipe } from "@pandacss/dev";

export const angleSlider = defineSlotRecipe({
  className: "angle-slider",
  jsx: [/AngleSlider\.+/],
  slots: [...angleSliderAnatomy.keys(), "thumbIndicator", "ring", "ringTrack", "ringRange"],
  base: {
    root: {
      pos: "relative",
      w: "full",
      aspectRatio: "square",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      _disabled: {
        opacity: "0.75",
        filter: "grayscale(1)",
      },
    },
    control: {
      pos: "absolute",
      inset: "0",
    },
    thumb: {
      pos: "absolute",
      top: "0",
      right: "0",
      bottom: "0",
      left: "[calc(50% - var(--angle-slider-thickness) / 2)]",
      pointerEvents: "none",
      h: "full",
      w: "var(--angle-slider-thickness)",
      display: "flex",
      alignItems: "flex-start",
      outline: "[0]",
      _focusVisible: {
        "& span": {
          outline: "[2px solid token(colors.colorPalette.8)]",
          outlineOffset: "[1px]",
        },
      },
      _readOnly: {
        display: "none",
      },
    },
    thumbIndicator: {
      bg: "colorPalette.10",
      w: "full",
      aspectRatio: "1 / 1",
      borderRadius: "full",
      scale: "1.5",
      flexShrink: 0,
    },
    valueText: {
      textStyle: "xl",
      color: "colorPalette.10",
    },
    label: {
      textStyle: "sm",
    },
    ring: {
      width: "var(--angle-slider-size)",
      height: "var(--angle-slider-size)",
    },
    ringTrack: {
      stroke: "gray.subtle.bg",
      "--radius": "calc(var(--angle-slider-size) / 2 - var(--angle-slider-thickness) / 2)",
      cx: "calc(var(--angle-slider-size) / 2)",
      cy: "calc(var(--angle-slider-size) / 2)",
      r: "var(--radius)",
      fill: "[transparent]",
      strokeWidth: "var(--angle-slider-thickness)",
    },
    ringRange: {
      stroke: "colorPalette.6",
      "--radius": "calc(var(--angle-slider-size) / 2 - var(--angle-slider-thickness) / 2)",
      cx: "calc(var(--angle-slider-size) / 2)",
      cy: "calc(var(--angle-slider-size) / 2)",
      r: "var(--radius)",
      fill: "[transparent]",
      strokeWidth: "var(--angle-slider-thickness)",
      "--circumference": "calc(2 * 3.14159 * var(--radius))",
      "--offset": "calc(var(--circumference) * (100 - var(--angle-slider-percent)) / 100)",
      transition: "stroke-dashoffset 300ms ease",
      strokeDashoffset: "calc(var(--circumference) * ((100 - var(--angle-slider-percent)) / 100))",
      strokeDasharray: "var(--circumference)",
      strokeLinecap: "round",
      transformOrigin: "center",
      transform: "rotate(-90deg)",
    },
  },
});
