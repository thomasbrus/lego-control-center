import { assert } from "@/common/utils";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AnyConnectedHub, AnyHub, assertHubClientConnected, assertHubConnected, initialHub } from "./hub";
import { AnyConnectedHubClient } from "./client";
import { HubId } from "./id";
import { LegoHub } from "@/lego/hub";
import { PybricksHub } from "@/pybricks/hub";
import { HubFirmware } from "./firmware";

enableMapSet();

interface HubStoreState {
  hubsById: Map<HubId, AnyHub>;
  requireHub: (id: HubId) => AnyHub;
  requireLegoHub: (id: HubId) => LegoHub;
  requirePybricksHub: (id: HubId) => PybricksHub;
  requireConnectedHub: (id: HubId) => AnyConnectedHub;
  requireConnectedHubClient: (id: HubId) => AnyConnectedHubClient;
  getHubs: () => AnyHub[];
  getHubIds: () => HubId[];
  putHub: (hub: AnyHub) => void;
  updateHub: (id: HubId, updater: (hub: AnyHub) => void) => void;
  removeHub: (id: HubId) => void;
  // setStatus: (id: HubId, status: AnyHubStatus) => void;
  // clearLoadingState: (id: HubId) => void;
  // setError: (id: HubId, error: Error) => void;
}

export const hubStore = create<HubStoreState>()(
  immer((set, get) => ({
    hubsById: new Map([[initialHub.id, initialHub]]),

    getHubs: () => Array.from(get().hubsById.values()),
    getHubIds: () => Array.from(get().hubsById.keys()),

    requireHub: (id) => {
      const hub = get().hubsById.get(id);
      assert(!!hub, `Hub with id "${id}" not found`);
      return hub;
    },

    requireLegoHub: (id) => {
      const hub = get().requireHub(id);
      assert(hub.firmware === HubFirmware.Lego, `Hub with id "${id}" is not a Lego hub`);
      return hub;
    },

    requirePybricksHub: (id) => {
      const hub = get().requireHub(id);
      assert(hub.firmware === HubFirmware.Pybricks, `Hub with id "${id}" is not a Lego hub`);
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
        state.hubsById.set(hub.id, hub);
      }),

    updateHub: (id, updater) =>
      set((state) => {
        const hub = state.hubsById.get(id);
        if (hub) updater(hub);
      }),

    // setStatus: (id, status) =>
    //   get().updateHub(id, (hub) => {
    //     hub.status = status;
    //   }),

    // clearLoadingState: (id) =>
    //   get().updateHub(id, (hub) => {
    //     delete hub.loadingState;
    //   }),

    // setError: (id, error: Error) =>
    //   get().updateHub(id, (hub) => {
    //     hub.status = HubStatus.Error;
    //     hub.error = error;
    //   }),

    removeHub: (id) =>
      set((state) => {
        state.hubsById.delete(id);
      }),
  })),
);
