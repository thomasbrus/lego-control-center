// import { HubsCard } from "@/components/hub";
import { HubsCard } from "@/components/hubs";
import { HubsProvider } from "@/contexts/hubs";
import { createFileRoute } from "@tanstack/react-router";
import { styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <HubsProvider>
      <styled.main p="8" display="grid" gridTemplateColumns={{ lg: "1fr 1fr 1fr" }} gap="8">
        <div>
          <HubsCard />
        </div>
      </styled.main>
    </HubsProvider>
  );
}
