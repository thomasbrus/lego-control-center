import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubStatus } from "@/lib/hub/types";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { BluetoothIcon } from "lucide-react";

export function HubConnectCard({
  hub,
  title,
  description,
  onTerminalOutput,
  onTelemetryEvent,
  onLaunchProgramProgress,
  onDisconnect,
}: {
  hub: Hub;
  title: string;
  description: string;
  onTerminalOutput: HubHooks.TerminalOutputHandler;
  onTelemetryEvent: HubHooks.TelemetryEventHandler;
  onLaunchProgramProgress: HubHooks.LaunchProgramProgressHandler;
  onDisconnect: () => void;
}) {
  const { simulated } = useModeContext();
  const { connect, retrieveDeviceInfo, startNotifications, retrieveCapabilities, startRepl, launchProgram } = simulated
    ? SimulatedHubHooks.useHub()
    : HubHooks.useHub();
  const { replaceHub } = HubHooks.useHubsContext();

  async function handleConnect() {
    let connectedHub = await connect(hub, { onDisconnect });

    if (connectedHub) {
      try {
        let updatedHub = await retrieveDeviceInfo(connectedHub);
        updatedHub = await startNotifications(updatedHub, { onTerminalOutput, onTelemetryEvent });
        updatedHub = await retrieveCapabilities(updatedHub);
        updatedHub = await startRepl(updatedHub);
        updatedHub = await launchProgram(updatedHub, { onProgress: onLaunchProgramProgress });
      } catch (error) {
        if (error instanceof Error) replaceHub(hub.id, { ...connectedHub, error, status: HubStatus.Error });
      }
    }
  }

  return (
    <Card.Root p="6" gap="4">
      <EmptyState title={title} description={description}>
        <Button colorPalette="[primary]" mt="4" onClick={handleConnect}>
          <BluetoothIcon />
          Connect
        </Button>
      </EmptyState>
    </Card.Root>
  );
}
