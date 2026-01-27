import { css, Styles } from "styled-system/css";
import { styled } from "styled-system/jsx";

export function Spacer(props: { children?: React.ReactNode } & Styles) {
  const defaultProps = css.raw({
    height: "auto",
    flexGrow: "1",
    flexShrink: "1",
    flexBasis: "0",
    placeSelf: "stretch",
  });

  return <styled.div {...defaultProps} {...props} />;
}
