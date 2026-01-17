import { LegoControlCenter } from "@/components/lego-control-center";
import { HubsProvider } from "@/lib/hub/context";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HubsProvider>
      <LegoControlCenter />
    </HubsProvider>
  );
}
