import { useNavigate, useSearch } from "@tanstack/react-router";
import { Flex } from "../../styled-system/jsx";
import { Button, Heading, IconButton, Page, Switch, Tabs, Tooltip } from "@/components";
import { useHubIds } from "@/hubs/hooks";
import { useDashboardTabs } from "./hooks";
import { PlusIcon, XIcon } from "lucide-react";
import { hubStore } from "@/hubs/store";
import { isHubConnected } from "@/hubs/hub";
import { HubId } from "@/hubs/id";
import { InitialHubStatus } from "@/hubs/status";
import { IdleHubDashboard } from "@/hubs/dashboard";
import { HubFirmware } from "@/hubs/firmware";
import { PybricksHubDashboard } from "@/pybricks/hub-dashboard";
import { LegoHubDashboard } from "@/lego/hub-dashboard";

export function DashboardPage() {
  return (
    <Page.Root>
      <Page.Header>
        <Heading>
          <DashboardHeader />
        </Heading>
      </Page.Header>
      <Page.Content>
        <DashboardContent />
      </Page.Content>
    </Page.Root>
  );
}

function DashboardHeader() {
  const { debug } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  return (
    <Flex alignItems="center" gap="4">
      <Heading>LEGO Control Center</Heading>

      <Switch.Default
        label="Debug"
        checked={!!debug}
        onCheckedChange={() => navigate({ to: "/", search: (prev) => ({ ...prev, debug: prev.debug ? undefined : true }) })}
        size="sm"
        colorPalette="gray"
        cursor="pointer"
      />
    </Flex>
  );
}

export function DashboardContent() {
  const { tabId, setTabId, addTab, closeTab } = useDashboardTabs();
  const hubIds = useHubIds();

  return (
    <Tabs.Root size="lg" gap="0" defaultValue="react" value={tabId} onValueChange={(e) => setTabId(e.value)}>
      <Tabs.List px="8" position="sticky" top="0" zIndex="docked" bg="white">
        {hubIds.map((hubId) => (
          <Tabs.Trigger key={hubId} value={hubId}>
            <DashboardTab key={hubId} hubId={hubId} canClose={hubIds.length > 1} onClose={closeTab} />
          </Tabs.Trigger>
        ))}
        <Button variant="plain" onClick={() => addTab()} h="11" fontSize="md">
          Add
          <PlusIcon />
        </Button>
        <Tabs.Indicator />
      </Tabs.List>
      {hubIds.map((hubId) => (
        <Tabs.Content key={hubId} value={hubId}>
          {<RenderHubDashboard hubId={hubId} />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

function DashboardTab({ hubId, canClose, onClose }: { hubId: HubId; canClose: boolean; onClose: (hub: HubId) => void }) {
  const hub = hubStore((state) => state.requireHub(hubId));

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (canClose) onClose(hubId);
  }

  return (
    <>
      {hub.name}
      <Tooltip content={isHubConnected(hub) ? "Disconnect" : "Close"}>
        <IconButton as="span" size="xs" variant="plain" onClick={handleClick} disabled={!canClose}>
          <XIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

function RenderHubDashboard({ hubId }: { hubId: HubId }) {
  const hub = hubStore((state) => state.requireHub(hubId));

  if (hub.status === InitialHubStatus.Idle) {
    return <IdleHubDashboard hubId={hubId} />;
  } else if (hub.firmware === HubFirmware.Pybricks) {
    return <PybricksHubDashboard hubId={hubId} />;
  } else if (hub.firmware === HubFirmware.Lego) {
    return <LegoHubDashboard hubId={hubId} />;
  }
}
