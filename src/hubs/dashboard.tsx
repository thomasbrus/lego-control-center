import { Button, Card, EmptyState } from "@/components";
import { useSearch } from "@tanstack/react-router";
import { BluetoothIcon } from "lucide-react";
import { Flex, styled } from "styled-system/jsx";
import { HubId } from "@/hubs/id";
import { hubStore } from "@/hubs/store";

export function HubDashboard({ children }: { children: React.ReactNode }) {
  return (
    <styled.main p="8" pb="16">
      {children}
    </styled.main>
  );
}

export function IdleHubDashboard({ hubId }: { hubId: HubId }) {
  return (
    <HubDashboard>
      <ConnectCard hubId={hubId} />
    </HubDashboard>
  );
}

function ConnectCard({ hubId }: { hubId: HubId }) {
  const hub = hubStore((state) => state.requireHub(hubId));
  const { debug } = useSearch({ from: "/" });

  async function handleConnect() {
    // await connectAndSetupHub(hubId, true);
  }

  async function handleSimulatedConnect() {
    // await connectAndSetupHub(hubId, false);
  }

  return (
    <Card.Root p="6" gap="4">
      <EmptyState title={hub.name} description="Let's connect this hub to get started.">
        <Flex mt="4" gap="3" justifyContent="center">
          <Button colorPalette="[primary]" onClick={handleConnect}>
            <BluetoothIcon />
            Connect
          </Button>
          {debug && (
            <Button onClick={handleSimulatedConnect}>
              <BluetoothIcon />
              Simulate
            </Button>
          )}
        </Flex>
      </EmptyState>
    </Card.Root>
  );
}
