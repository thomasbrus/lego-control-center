import { css, Styles } from "styled-system/css";
import { Box, styled } from "styled-system/jsx";
import { Heading } from "./heading";
import { Text } from "./text";

export function EmptyState({
  title,
  description,
  children,
  ...props
}: { title?: string; description: string; children?: React.ReactNode } & Styles) {
  const defaultProps = css.raw({
    bg: "gray.2",
    borderRadius: "l2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: "6",
    py: "8",
  });

  return (
    <Box {...defaultProps} {...props}>
      <styled.div textAlign="center">
        {title && <Heading>{title}</Heading>}
        {description && <Text color="fg.muted">{description}</Text>}
        {children}
      </styled.div>
    </Box>
  );
}
