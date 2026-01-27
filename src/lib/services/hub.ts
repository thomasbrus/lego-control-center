import { BluetoothHubClient } from "../clients/bluetooth-hub-client";
import { SimulatedHubClient } from "../clients/simulated-hub-client";
import { ApplicationMode, applicationStore } from "../stores/application";
import { hubStore } from "../stores/hub";
import { HubId, HubStatus } from "../types/hub";
import { assertHubConnected, assertHubSupportsRepl } from "../utils/hub";

const HubClients = {
  [ApplicationMode.Live]: BluetoothHubClient,
  [ApplicationMode.Simulated]: SimulatedHubClient,
};

export async function connectHub(hubId: HubId) {
  const mode = applicationStore.getState().mode;

  hubStore.getState().setStatus(hubId, HubStatus.Connecting);

  function handleDisconnect() {
    hubStore.getState().setStatus(hubId, HubStatus.Idle);
  }

  const hubClient = await HubClients[mode].create({ onDisconnect: handleDisconnect });

  hubStore.getState().updateHub(hubId, (it) => (it.client = hubClient));
  hubStore.getState().setStatus(hubId, HubStatus.Connected);

  assertHubConnected(hubStore.getState().requireHub(hubId));

  hubStore.getState().setStatus(hubId, HubStatus.RetrievingHubType);

  const hubType = await hubStore.getState().requireConnectedHubClient(hubId).getHubType();

  hubStore.getState().updateHub(hubId, (it) => (it.type = hubType));

  hubStore.getState().setStatus(hubId, HubStatus.StartingEventStream);

  await hubStore.getState().requireConnectedHubClient(hubId).startEventStream();

  hubStore.getState().setStatus(hubId, HubStatus.RetrievingCapabilities);

  const hubCapabilities = await hubStore.getState().requireConnectedHubClient(hubId).getHubCapabilities();

  hubStore.getState().updateHub(hubId, (it) => (it.capabilities = hubCapabilities));

  assertHubSupportsRepl(hubStore.getState().requireHub(hubId));

  hubStore.getState().setStatus(hubId, HubStatus.StartingRepl);

  await hubStore.getState().requireConnectedHubClient(hubId).startRepl();

  //  const startRepl = useCallback(
  //     async (hub: Hub) => {
  //       const startingReplHub = replaceHub(hub.id, { ...hub, status: HubStatus.StartingRepl });
  //       await HubCommands.startRepl(hub);
  //       await HubCommands.waitForStdout(hub, ">>> ");

  //       return replaceHub(hub.id, { ...startingReplHub, status: HubStatus.Ready });
  //     },
  //     [replaceHub],
  //   );
}

export function resetHub(hubId: string) {
  const hub = hubStore.getState().requireHub(hubId);
  hubStore.getState().putHub({ id: hub.id, name: hub.name, status: HubStatus.Idle });
}

export function disconnectHub(hubId: string) {
  hubStore.getState().requireConnectedHubClient(hubId).disconnect();
  resetHub(hubId);
}
