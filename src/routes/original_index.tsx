import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/original_index")({
  validateSearch: z.object({
    testing: z.boolean().optional().catch(false),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}

// function RouteComponent() {
//   return (
//     <HubsProvider>
//       <Columns />
//     </HubsProvider>
//   );
// }

// export function Columns() {
//   const { testing } = Route.useSearch();
//   const { hubIds } = testing ? useSimulatedHubs() : useHubs();

//   let columnBefore = null;
//   let columnAfter = null;

//   if (hubIds.length === 0) {
//     columnBefore = (
//       <div>
//         <ConnectHubCard title="No hub connected" description="Let's connect a hub to get started." />
//       </div>
//     );
//   } else {
//     columnAfter = (
//       <div>
//         <ConnectHubCard title="Connect another hub" description="Manage multiple all from one place." />
//       </div>
//     );
//   }

//   return (
//     <styled.main p="8" display="grid" gridTemplateColumns={{ md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }} gap="6">
//       {columnBefore}
//       {hubIds.map((hubId) => (
//         <HubColumn key={hubId} hubId={hubId} />
//       ))}

//       {columnAfter}
//     </styled.main>
//   );
// }

// function HubColumn({ hubId }: { hubId: Hub["id"] }) {
//   const { testing } = Route.useSearch();

//   const { hub, terminalLines, telemetryEvents } = testing ? useSimulatedHub(hubId) : useHub(hubId);

//   return (
//     <styled.div display="flex" flexDirection="column" gap="4">
//       <DetailsCard hub={hub} />
//       <DemoCard hub={hub} />
//       <TerminalCard terminalLines={terminalLines} />
//       <TelemetryCard telemetryEvents={telemetryEvents} />
//       <LightCard hub={hub} />
//     </styled.div>
//   );
// }

// function ConnectHubCard({ title, description }: { title?: string; description: string }) {
//   const { testing } = Route.useSearch();
//   const { connect } = testing ? useSimulatedHubs() : useHubs();

//   async function handleConnect() {
//     await connect();
//     // await launchProgram({ hub: hub!, updateHubStatus: () => {} });
//   }

//   return (
//     <Card.Root p="6" gap="4">
//       <EmptyState title={title} description={description}>
//         <Button colorPalette="[primary]" mt="4" onClick={handleConnect}>
//           <BluetoothIcon />
//           Connect
//         </Button>
//       </EmptyState>
//     </Card.Root>
//   );
// }

// function EmptyState({
//   title,
//   description,
//   children,
//   ...props
// }: { title?: string; description: string; children?: React.ReactNode } & Styles) {
//   const defaultProps = css.raw({
//     bg: "gray.2",
//     borderRadius: "l2",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     px: "6",
//     py: "8",
//   });

//   return (
//     <Box {...defaultProps} {...props}>
//       <styled.div textAlign="center">
//         {title && <Heading>{title}</Heading>}
//         {description && <Text color="fg.muted">{description}</Text>}
//         {children}
//       </styled.div>
//     </Box>
//   );
// }

// function getStatusBadge(status: HubStatus) {
//   switch (status) {
//     case HubStatus.Ready:
//       return <Badge colorPalette="green">Ready</Badge>;
//     case HubStatus.Connecting:
//       return <Badge colorPalette="yellow">Connecting...</Badge>;
//     case HubStatus.RetrievingCapabilities:
//       return <Badge colorPalette="yellow">Retrieving capabilities...</Badge>;
//     case HubStatus.Connected:
//       return <Badge colorPalette="green">Connected</Badge>;
//     case HubStatus.StartingRepl:
//       return <Badge colorPalette="blue">Starting REPL...</Badge>;
//     case HubStatus.UploadingProgram:
//       return <Badge colorPalette="blue">Uploading program...</Badge>;
//     case HubStatus.StartingProgram:
//       return <Badge colorPalette="blue">Starting program...</Badge>;
//     case HubStatus.Ready:
//       return <Badge colorPalette="green">Ready</Badge>;
//     case HubStatus.Error:
//       return <Badge colorPalette="red">Error</Badge>;
//     default:
//       return <Badge>Unknown</Badge>;
//   }
// }

// function DetailsCard({ hub }: { hub: Hub }) {
//   const { testing } = Route.useSearch();
//   const { removeHub } = useHubsContext();
//   const isReady = hub.status === HubStatus.Ready;

//   const handleDisconnect = useCallback(async () => {
//     await (testing ? simulatedDisconnect() : disconnect(hub));
//     removeHub(hub.id);
//   }, [hub, removeHub, testing]);

//   const handleShutdown = useCallback(async () => {
//     await (testing ? simulatedHubShutdown() : hubShutdown(hub));
//     removeHub(hub.id);
//   }, [hub, removeHub, testing]);

//   return (
//     <Card.Root>
//       <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
//         <Card.Title>{hub.name}</Card.Title>
//         <Group attached>
//           <Button size="xs" variant="surface" colorPalette="[danger]" onClick={handleShutdown} disabled={!isReady}>
//             Shutdown
//           </Button>
//           <Button size="xs" variant="surface" onClick={handleDisconnect}>
//             Disconnect
//           </Button>
//         </Group>
//       </Card.Header>
//       <Card.Body>
//         <Table.Root variant="surface">
//           <Table.Head>
//             <Table.Row>
//               <Table.Header>Status</Table.Header>
//               <Table.Header>Max Write Size</Table.Header>
//             </Table.Row>
//           </Table.Head>
//           <Table.Body>
//             <Table.Row>
//               <Table.Cell>{getStatusBadge(hub.status)}</Table.Cell>
//               <Table.Cell>{hub.capabilities?.maxWriteSize ?? "—"}</Table.Cell>
//             </Table.Row>
//           </Table.Body>
//         </Table.Root>
//       </Card.Body>
//     </Card.Root>
//   );
// }

// function DemoCard({ hub }: { hub: Hub }) {
//   const disabled = hub.status !== HubStatus.Connected;

//   useEffect(() => {
//     if (disabled) return;

//     launchProgram({ hub, updateHubStatus: () => {} });
//   }, [disabled]);

//   return (
//     <Card.Root>
//       <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
//         <Card.Title display="flex" alignItems="center" gap="2">
//           <Icon size="md">
//             <BracesIcon />
//           </Icon>
//           Demo
//         </Card.Title>
//       </Card.Header>
//       <Card.Body>
//         <styled.code bg="gray.2" p="2" borderRadius="l1" fontSize="sm" whiteSpace="pre-wrap">
//           {"{ ... }"}
//         </styled.code>
//       </Card.Body>
//       <Card.Footer display="grid">
//         <Button disabled={disabled} variant="outline" onClick={() => launchProgram({ hub, updateHubStatus: () => {} })}>
//           Launch program
//         </Button>
//         {/* <Button disabled={disabled} variant="outline" onClick={() => enterPasteMode(hub)}>
//           Enter paste mode
//         </Button>
//         <Button disabled={disabled} variant="outline" onClick={() => writeStdinWithResponse(hub, programMain)}>
//           Send program
//         </Button>
//         <Button disabled={disabled} variant="outline" onClick={() => exitPasteMode(hub)}>
//           Exit paste mode
//         </Button> */}
//       </Card.Footer>
//     </Card.Root>
//   );
// }

// function TerminalCard({ terminalLines }: { terminalLines: string[] }) {
//   const scrollArea = useScrollArea();

//   useEffect(() => {
//     scrollArea.scrollToEdge({ edge: "bottom" });
//   }, [terminalLines.length]);

//   return (
//     <Card.Root>
//       <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
//         <Card.Title display="flex" alignItems="center" gap="2">
//           <Icon size="md">
//             <TerminalIcon />
//           </Icon>
//           Terminal
//         </Card.Title>
//       </Card.Header>
//       <Card.Body display="block">
//         {terminalLines.join().length === 0 ? (
//           <EmptyState description="No output yet." />
//         ) : (
//           <ScrollArea.Default value={scrollArea} size="xs" maxH="64">
//             <styled.pre fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
//               {terminalLines.map((terminalLine, i) => (
//                 <React.Fragment key={i}>
//                   {terminalLine}
//                   {i < terminalLines.length - 1 && <br />}
//                 </React.Fragment>
//               ))}
//             </styled.pre>
//           </ScrollArea.Default>
//         )}
//       </Card.Body>
//     </Card.Root>
//   );
// }

// function TelemetryCard({ telemetryEvents }: { telemetryEvents: TelemetryEvent[] }) {
//   const scrollArea = useScrollArea();

//   useEffect(() => {
//     scrollArea.scrollToEdge({ edge: "bottom" });
//   }, [telemetryEvents.length]);

//   return (
//     <Card.Root>
//       <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
//         <Card.Title display="flex" alignItems="center" gap="2">
//           <Icon size="md">
//             <RadioTowerIcon />
//           </Icon>
//           Telemetry
//         </Card.Title>
//       </Card.Header>
//       <Card.Body display="block">
//         {telemetryEvents.length === 0 ? (
//           <EmptyState description="No telemetry data yet." />
//         ) : (
//           <ScrollArea.Default value={scrollArea} size="xs" maxH="64">
//             <Table.Root variant="surface">
//               <Table.Head>
//                 <Table.Row>
//                   <Table.Header>Time</Table.Header>
//                   <Table.Header>Battery</Table.Header>
//                   <Table.Header>Motor Angles</Table.Header>
//                   <Table.Header>Motor Speeds</Table.Header>
//                   <Table.Header>Light</Table.Header>
//                 </Table.Row>
//               </Table.Head>
//               <Table.Body>
//                 {telemetryEvents.map((event, index) => (
//                   <Table.Row key={index}>
//                     <Table.Cell>{(event.time / 1000).toFixed(1)}s</Table.Cell>
//                     <Table.Cell>{event.hubBattery}%</Table.Cell>
//                     <Table.Cell fontSize="xs">{event.motorAngles.join(", ")}</Table.Cell>
//                     <Table.Cell fontSize="xs">{event.motorSpeeds.join(", ")}</Table.Cell>
//                     <Table.Cell>{event.lightStatus}</Table.Cell>
//                   </Table.Row>
//                 ))}
//               </Table.Body>
//             </Table.Root>
//           </ScrollArea.Default>
//         )}
//       </Card.Body>
//     </Card.Root>
//   );
// }

// const lightCollection = createListCollection({
//   items: [
//     { value: "1", label: "Black" },
//     { value: "2", label: "Red" },
//     { value: "3", label: "Orange" },
//     { value: "4", label: "Yellow" },
//     { value: "5", label: "Green" },
//     { value: "6", label: "Cyan" },
//     { value: "7", label: "Blue" },
//     { value: "8", label: "Violet" },
//     { value: "9", label: "Magenta" },
//   ],
// });

// function LightCard({ hub }: { hub: Hub }) {
//   const [light, setLight] = useState<number>(5);
//   const disabled = hub.status !== HubStatus.Connected;

//   function handleValueChange(details: ValueChangeDetails) {
//     setLight(Number(details.value));
//   }

//   return (
//     <Card.Root>
//       <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
//         <Card.Title display="flex" alignItems="center" gap="2">
//           <Icon size="md">
//             <LightbulbIcon />
//           </Icon>
//           Light
//         </Card.Title>
//       </Card.Header>
//       <Card.Body>
//         <Select.Default
//           label="Color"
//           collection={lightCollection}
//           disabled={disabled}
//           value={[String(light)]}
//           onValueChange={handleValueChange}
//         >
//           {lightCollection.items.map((item) => (
//             <Select.Item key={item.value} item={item}>
//               <Select.ItemText>{item.label}</Select.ItemText>
//               <Select.ItemIndicator />
//             </Select.Item>
//           ))}
//         </Select.Default>
//       </Card.Body>
//       <Card.Footer>
//         <Button disabled={disabled} variant="outline">
//           Turn off
//         </Button>
//         <Button disabled={disabled}>Apply</Button>
//       </Card.Footer>
//     </Card.Root>
//   );
// }
