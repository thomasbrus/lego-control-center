import { useHubIds } from "@/hubs/hooks";
import { useState } from "react";
import { hubStore } from "@/hubs/store";
import { initialHub, isHubConnected } from "@/hubs/hub";
import { HubId } from "@/hubs/id";

export function useDashboardTabs() {
  const hubIds = useHubIds();
  const { putHub, removeHub, requireHub } = hubStore();
  const [tabId, setTabId] = useState<string>(hubIds[0] ?? "");

  const addTab = () => {
    const id = crypto.randomUUID();
    putHub({ ...initialHub, id });
    setTabId(id);
  };

  const closeTab = (hubId: HubId) => {
    const hub = requireHub(hubId);

    if (isHubConnected(hub)) hub.client.disconnect();

    setTabId(getNextActiveTab(hubIds, hubId, tabId));
    removeHub(hubId);
  };

  return {
    tabId,
    setTabId,
    addTab,
    closeTab,
  };
}

function getNextActiveTab(hubIds: string[], closingTabId: string, currentActiveTabId: string): string {
  const isCurrentTab = currentActiveTabId === closingTabId;

  if (!isCurrentTab) {
    return currentActiveTabId;
  }

  if (hubIds.length === 1) {
    return "";
  }

  const originalIndex = hubIds.indexOf(closingTabId);
  const isLastTab = originalIndex === hubIds.length - 1;

  return isLastTab ? hubIds[originalIndex - 1] : hubIds[originalIndex + 1];
}
