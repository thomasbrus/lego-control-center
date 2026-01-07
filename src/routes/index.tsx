// import { HubCard } from "@/components/hub";
import { HubCard } from "@/components/hub";
import { DevicesProvider } from "@/contexts/devices";
import { createFileRoute } from "@tanstack/react-router";
import { styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <DevicesProvider>
      <styled.main p="8" display="grid" gridTemplateColumns={{ lg: "1fr 1fr 1fr" }} gap="8">
        <div>
          <HubCard />
        </div>
      </styled.main>
    </DevicesProvider>
  );
}
