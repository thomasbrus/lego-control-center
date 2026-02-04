import { styled } from "styled-system/jsx";

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <styled.div bg="gray.2" position="fixed" inset="0" display="grid" gridTemplateRows="auto 1fr">
      {children}
    </styled.div>
  );
}
export function Header({ children }: { children: React.ReactNode }) {
  return (
    <styled.header bg="white" px="8" py="6" top="0" colorPalette="[primary]">
      {children}
    </styled.header>
  );
}
export function Content({ children }: { children: React.ReactNode }) {
  return <styled.main overflow="auto">{children}</styled.main>;
}
