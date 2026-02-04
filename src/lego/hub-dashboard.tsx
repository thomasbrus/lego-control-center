import { HubId } from "@/hubs/id";
import { HubDashboard } from "@/hubs/dashboard";

export function LegoHubDashboard({ hubId }: { hubId: HubId }) {
  return <HubDashboard>{hubId}</HubDashboard>;
}
