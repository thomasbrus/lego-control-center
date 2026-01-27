import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ConnectedHub, Hub, HubId, HubStatus } from "../types/hub";
import { ConnectedHubClient } from "../types/hub-client";
import { assert } from "../utils/common";
import { assertHubClientConnected, assertHubConnected } from "../utils/hub";

const initialHub: Hub = {
  id: "untitled-hub",
  name: "Untitled Hub",
  status: HubStatus.Idle,
};

interface HubStoreState {
  hubs: Map<HubId, Hub>;
  requireHub: (id: HubId) => Hub;
  requireConnectedHub: (id: HubId) => ConnectedHub;
  requireConnectedHubClient: (id: HubId) => ConnectedHubClient;
  putHub: (hub: Hub) => void;
  updateHub: (id: HubId, updater: (hub: Hub) => void) => void;
  removeHub: (id: HubId) => void;
  setStatus: (id: HubId, status: HubStatus) => void;
  setLoadingState: (id: HubId, loadingState: Partial<Hub["loadingState"]>) => void;
  clearLoadingState: (id: HubId) => void;
  setError: (id: HubId, error: Error) => void;
}

export const hubStore = create<HubStoreState>()(
  immer((set, get) => ({
    hubs: new Map([[initialHub.id, initialHub]]),

    requireHub: (id) => {
      const hub = get().hubs.get(id);
      assert(!!hub, `Hub with id "${id}" not found`);
      return hub;
    },

    requireConnectedHub: (id) => {
      const hub = get().requireHub(id);
      assertHubConnected(hub);
      return hub;
    },

    requireConnectedHubClient: (id) => {
      const hub = get().requireConnectedHub(id);
      assertHubClientConnected(hub.client);
      return hub.client;
    },

    putHub: (hub) =>
      set((state) => {
        state.hubs.set(hub.id, hub);
      }),

    updateHub: (id, updater) =>
      set((state) => {
        const hub = state.hubs.get(id);
        if (hub) updater(hub);
      }),

    setStatus: (id, status) =>
      get().updateHub(id, (hub) => {
        hub.status = status;
      }),

    setLoadingState: (id, loadingState) =>
      get().updateHub(id, (hub) => {
        hub.loadingState = { progress: 0, modules: [], ...hub.loadingState, ...loadingState };
      }),

    clearLoadingState: (id) =>
      get().updateHub(id, (hub) => {
        delete hub.loadingState;
      }),

    setError: (id, error: Error) =>
      get().updateHub(id, (hub) => {
        hub.status = HubStatus.Error;
        hub.error = error;
      }),

    removeHub: (id) =>
      set((state) => {
        state.hubs.delete(id);
      }),
  })),
);
