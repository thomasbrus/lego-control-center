import { Hub, HubStatus } from "@/lib/hub/types";
import { createContext, useState } from "react";

interface HubsContextValue {
  hubs: Hub[];
  addHub: (hub: Hub) => void;
  removeHub: (id: Hub["id"]) => void;
  updateHubStatus: (id: Hub["id"], status: HubStatus) => void;
}

export const HubsContext = createContext<HubsContextValue | undefined>(undefined);

export function HubsProvider({ children }: { children: React.ReactNode }) {
  const [hubs, setHubs] = useState<Map<Hub["id"], Hub>>(new Map());

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

  return (
    <HubsContext.Provider value={{ hubs: Array.from(hubs.values()), addHub, removeHub, updateHubStatus }}>{children}</HubsContext.Provider>
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
