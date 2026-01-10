import { StatusFlags } from "@/lib/events/types";
import { Hub, HubStatus } from "@/lib/hubs/types";
import { createContext, useState } from "react";

interface HubsContextValue {
  hubIds: Hub["id"][];
  getHub: (id: Hub["id"]) => Hub;
  addHub: (hub: Hub) => void;
  removeHub: (id: Hub["id"]) => void;
  updateHubStatus: (id: Hub["id"], status: HubStatus) => void;
  updateHubStatusFlags: (id: Hub["id"], statusFlags: StatusFlags) => void;
}

export const HubsContext = createContext<HubsContextValue | undefined>(undefined);

export function HubsProvider({ children }: { children: React.ReactNode }) {
  const [hubs, setHubs] = useState<Map<Hub["id"], Hub>>(new Map());

  function getHub(id: Hub["id"]): Hub {
    const hub = hubs.get(id);
    if (!hub) throw new Error(`Hub not found: ${id}`);
    return hub;
  }

  function addHub(hub: Hub) {
    setHubs((prev) => mapWithKey(prev, hub.id, hub));
  }

  function removeHub(id: Hub["id"]) {
    setHubs((prev) => mapWithoutKey(prev, id));
  }

  function updateHubStatus(id: Hub["id"], status: HubStatus) {
    setHubs((prev) => {
      const hub = prev.get(id);
      if (!hub) return prev;
      return mapWithKey(prev, id, { ...hub, status });
    });
  }

  function updateHubStatusFlags(id: Hub["id"], statusFlags: StatusFlags) {
    setHubs((prev) => {
      const hub = prev.get(id);
      if (!hub) return prev;
      return mapWithKey(prev, id, { ...hub, statusFlags });
    });
  }

  return (
    <HubsContext.Provider value={{ hubIds: Array.from(hubs.keys()), getHub, addHub, removeHub, updateHubStatus, updateHubStatusFlags }}>
      {children}
    </HubsContext.Provider>
  );
}

function mapWithKey<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  const newMap = new Map(map);
  newMap.set(key, value);
  return newMap;
}

function mapWithoutKey<K, V>(map: Map<K, V>, key: K): Map<K, V> {
  const newMap = new Map(map);
  newMap.delete(key);
  return newMap;
}
