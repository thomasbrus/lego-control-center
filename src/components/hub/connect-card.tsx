import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub } from "@/lib/hub/types";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { BluetoothIcon } from "lucide-react";

export function ConnectCard({
  hub,
  title,
  description,
  onTerminalOutput,
  onTelemetryEvent,
  onDisconnect,
}: {
  hub: Hub;
  title: string;
  description: string;
  onTerminalOutput: (output: string) => void;
  onTelemetryEvent: (event: TelemetryEvent) => void;
  onDisconnect: () => void;
}) {
  const { simulated } = useModeContext();
  const { connect, startNotifications, retrieveCapabilities, startRepl, launchProgram } = simulated
    ? SimulatedHubHooks.useHub()
    : HubHooks.useHub();

  async function handleConnect() {
    let connectedHub = await connect(hub, { onDisconnect });

    if (connectedHub) {
      let updatedHub = await startNotifications(connectedHub, { onTerminalOutput, onTelemetryEvent });
      updatedHub = await retrieveCapabilities(updatedHub);
      updatedHub = await startRepl(updatedHub);
      updatedHub = await launchProgram(updatedHub);
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
