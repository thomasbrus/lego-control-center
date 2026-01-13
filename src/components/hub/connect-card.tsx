import { Button, Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import * as HubHooks from "@/lib/hub/hooks";
import { useHubsContext } from "@/lib/hub/hooks";
import { Hub } from "@/lib/hub/types";
import * as VirtualHubHooks from "@/lib/virtual-hub/hooks";
import { BluetoothIcon } from "lucide-react";

export function ConnectCard({ hub, title, description }: { hub: Hub; title: string; description: string }) {
  const { virtualMode } = useHubsContext();
  const { connect, retrieveCapabilities } = virtualMode ? VirtualHubHooks.useHub() : HubHooks.useHub();

  async function handleConnect() {
    const connectedHub = await connect(hub);

    if (connectedHub) {
      // 1. set up characteristicvaluechanged handler
      // 2. stop / start notifications
      await retrieveCapabilities(connectedHub);
      // 3. start repl
      // 4. wait for repl ready (based on stdout line)
      // 5. upload program via paste mode
      // 6. run program
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
