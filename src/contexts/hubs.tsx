import { Hub } from "@/lib/hub/api";
import { createContext, useState } from "react";

interface HubsContextValue {
  hubs: Hub[];
  addHub: (hub: Hub) => void;
  removeHub: (id: Hub["id"]) => void;
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

  return <HubsContext.Provider value={{ hubs: Array.from(hubs.values()), addHub, removeHub }}>{children}</HubsContext.Provider>;
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
