"use client";
import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { createStyleContext } from "styled-system/jsx";
import { propertyList } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(propertyList);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(ark.div, "root");
export const Item = withContext(ark.dl, "item");
export const Label = withContext(ark.dt, "label");
export const Value = withContext(ark.dd, "value");
