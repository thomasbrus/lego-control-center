import { defineSlotRecipe } from "@pandacss/dev";

export const propertyList = defineSlotRecipe({
  className: "property-list",
  slots: ["root", "item", "label", "value"],
  base: {
    root: {
      display: "grid",
      gap: "3",
    },
    item: {
      display: "grid",
      gridTemplateColumns: "1fr 3fr",
      gap: "4",
      alignItems: "center",
    },
    label: {
      textStyle: "sm",
      color: "fg.muted",
    },
    value: {
      placeSelf: "end",
      textStyle: "label",
    },
  },
});
