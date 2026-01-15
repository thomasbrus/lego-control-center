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
      // 1. set up characteristicvaluechanged handler
      // 2. stop / start notifications (remember to use stop start trick)
      // 3. retrieve capabilities
      // 4. start repl
      // 5. wait for repl ready (based on stdout line)
      // 6. upload program via paste mode
      // 7. run program

      let updatedHub = await startNotifications(connectedHub, { onTerminalOutput, onTelemetryEvent });
      updatedHub = await retrieveCapabilities(updatedHub);
      updatedHub = await startRepl(updatedHub);
      updatedHub = await launchProgram(updatedHub);
    }

    // cleanup:
    // stopNotifications + disconnect
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
