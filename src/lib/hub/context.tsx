import { Hub, HubId, HubStatus } from "@/lib/hub/types";
import { createContext, useCallback, useReducer } from "react";

// Action types for the reducer
type HubAction =
  | { type: "ADD_HUB"; hub: Hub }
  | { type: "REMOVE_HUB"; id: HubId }
  | { type: "UPDATE_HUB"; id: HubId; updatedHub: Hub }
  | { type: "DISCONNECT_HUB"; id: HubId };

interface HubsContextValue {
  hubs: Hub[];
  getHub: (id: HubId) => Hub;
  dispatch: React.Dispatch<HubAction>;
  addHub: (hub: Hub) => void;
  removeHub: (id: HubId) => void;
  updateHub: (id: HubId, updatedHub: Hub) => Hub;
  disconnectHub: (id: HubId) => void;
}

export const HubsContext = createContext<HubsContextValue | undefined>(undefined);

const idleHub: Hub = { id: "untitled", name: "Untitled", status: HubStatus.Idle };

function hubsReducer(state: Map<HubId, Hub>, action: HubAction): Map<HubId, Hub> {
  switch (action.type) {
    case "ADD_HUB": {
      const next = new Map(state);
      next.set(action.hub.id, action.hub);
      return next;
    }
    case "REMOVE_HUB": {
      const next = new Map(state);
      next.delete(action.id);
      return next;
    }
    case "UPDATE_HUB": {
      const next = new Map(state);
      next.set(action.id, action.updatedHub);
      return next;
    }
    case "DISCONNECT_HUB": {
      const next = new Map(state);
      const hub = next.get(action.id);

      const disconnectedHub = { ...hub, status: HubStatus.Idle };
      delete disconnectedHub.device;
      delete disconnectedHub.capabilities;

      next.set(action.id, disconnectedHub as Hub);
      return next;
    }

    default:
      return state;
  }
}

export function HubsProvider({ children }: { children: React.ReactNode }) {
  const [hubs, dispatch] = useReducer(hubsReducer, new Map<HubId, Hub>([[idleHub.id, idleHub]]));

  const getHub = useCallback(
    (id: HubId) => {
      const hub = hubs.get(id);
      if (!hub) throw new Error(`Hub not found: ${id}`);
      return hub;
    },
    [hubs]
  );

  const addHub = useCallback((hub: Hub) => {
    dispatch({ type: "ADD_HUB", hub });
  }, []);

  const removeHub = useCallback((id: HubId) => {
    dispatch({ type: "REMOVE_HUB", id });
  }, []);

  const updateHub = useCallback((id: HubId, updatedHub: Hub) => {
    dispatch({ type: "UPDATE_HUB", id, updatedHub });
    return updatedHub;
  }, []);

  const disconnectHub = useCallback((id: HubId) => {
    dispatch({ type: "DISCONNECT_HUB", id });
  }, []);

  return (
    <HubsContext.Provider
      value={{
        hubs: Array.from(hubs.values()),
        getHub,
        dispatch,
        addHub,
        removeHub,
        updateHub,
        disconnectHub,
      }}
    >
      {children}
    </HubsContext.Provider>
  );
}
