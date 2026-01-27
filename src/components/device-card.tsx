import { styled } from "styled-system/jsx";
import { Card, Icon, PropertyList } from "./ui";

export function DeviceCard({
  title,
  icon,
  imgSrc,
  name,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  imgSrc: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" alignItems="center" gap="2">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">{icon}</Icon>
          {title}
        </Card.Title>

        <styled.div ml="auto" p="4" my="-7" mr="-4">
          <styled.img src={imgSrc} alt={name} w="12" mixBlendMode="luminosity" />
        </styled.div>
      </Card.Header>
      <Card.Body gap="6">{children}</Card.Body>
    </Card.Root>
  );
}

export function DeviceDetailsSection({ type }: { type: string }) {
  return (
    <PropertyList.Root>
      <PropertyList.Item>
        <PropertyList.Label>Type</PropertyList.Label>
        <PropertyList.Value>{type}</PropertyList.Value>
      </PropertyList.Item>
    </PropertyList.Root>
  );
}
