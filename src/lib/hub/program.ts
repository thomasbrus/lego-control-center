export const programDemo = `
print("Hello world!")

async def say_hello():
    while True:
        print("Hello world!")
        await wait(1000)

async def main():
    await multitask(say_hello())

run_task(main())
`;

export const programMain = `
from usys import stdin, stdout
from ustruct import unpack, pack_into, calcsize
from uselect import poll

class BatteryMonitor:
    def __init__(self, hub, v_min=6000, v_max=8300):
        self.hub = hub
        self.v_min = v_min
        self.v_max = v_max

    def percentage(self):
        v = self.hub.battery.voltage()
        pct = int((v - self.v_min) * 100 / (self.v_max - self.v_min))
        return max(0, min(100, pct))

class LightManager:
    COLORS = [
        Color.NONE,     # 0 = NONE (off, not black)
        Color.BLACK,    # 1
        Color.RED,      # 2
        Color.ORANGE,   # 3
        Color.YELLOW,   # 4
        Color.GREEN,    # 5
        Color.CYAN,     # 6
        Color.BLUE,     # 7
        Color.VIOLET,   # 8
        Color.MAGENTA,  # 9
    ]

    def __init__(self, hub):
        self.hub = hub
        self.current_index = 0

    def set(self, index):
        self.hub.light.on(self.COLORS[index])
        self.current_index = index

def do_nothing(*args, **kwargs):
    return 0

class NoneMotor:
    def __getattr__(self, name):
        return do_nothing

class MotorsController:
    def __init__(self, ports):
        self.ports = ports
        self.motors = {}
        self.discover()

    def discover(self):
        for port in self.ports:
            try:
                self.motors[port] = Motor(port)
            except OSError:
                self.motors[port] = NoneMotor()

    def set_speeds(self, speeds):
        """
        speeds: iterable of speed values, one per port
        """
        for i, port in enumerate(self.ports):
            motor = self.motors[port]
            motor.run(speeds[i])

    def stop_all(self):
        for motor in self.motors.values():
            motor.stop()

    def read_state(self):
        angles = []
        speeds = []

        for port in self.ports:
            motor = self.motors[port]
            angles.append(motor.angle())
            speeds.append(motor.speed())

        return angles, speeds

# Global instances for shared state
motors_controller = MotorsController([Port.A, Port.B, Port.C, Port.D])
light_manager = LightManager(hub)
battery_monitor = BatteryMonitor(hub)

class Commands:
    SHUTDOWN_HUB       = 0x10
    SET_MOTOR_SPEEDS   = 0x20
    STOP_ALL_MOTORS    = 0x21
    SET_LIGHT          = 0x30

    @classmethod
    def all(cls):
        return [cls.SHUTDOWN_HUB, cls.SET_MOTOR_SPEEDS, cls.STOP_ALL_MOTORS, cls.SET_LIGHT]

class PacketProtocol:
    # [CommandId(B), ...4xArgument(h)]
    FORMAT = "<Bhhhh"
    SIZE = calcsize(FORMAT)

app_data = AppData(PacketProtocol.FORMAT)

class CommandHandler:
    def __init__(self):
        self.poller = poll()
        self.poller.register(stdin)

    async def process_stdin(self):
        while not self.poller.poll(0):
            await wait(10)

        command_id = stdin.buffer.read(1)[0]

        # Remove bytes that are not commands
        while command_id not in Commands.all():
            command_id = stdin.buffer.read(1)[0]

        payload = bytes([command_id]) + stdin.buffer.read(PacketProtocol.SIZE - 1)
        values = unpack(PacketProtocol.FORMAT, payload)

        args = values[1:]
        self.handle_command(command_id, args)

    def process_app_data(self):
        values = app_data.get_values()
        command_id = values[0]
        args = values[1:]
        self.handle_command(command_id, args)

    def handle_command(self, command_id, args):
        if command_id == Commands.SHUTDOWN_HUB:
            hub.system.shutdown()
        elif command_id == Commands.SET_MOTOR_SPEEDS:
            motors_controller.set_speeds(args[0:])
        elif command_id == Commands.STOP_ALL_MOTORS:
            motors_controller.stop_all()
        elif command_id == Commands.SET_LIGHT:
            light_manager.set(args[0])

class TelemetryProtocol:
    # [HubBattery(B), ...4xMotorAngle(h), ...4xMotorSpeed(h), LightStatus(B)]
    FORMAT = "<BhhhhhhhhB"
    SIZE = calcsize(FORMAT)

class TelemetryCollector:
    def __init__(self):
        self.stopWatch = StopWatch()
        self.payload = bytearray(TelemetryProtocol.SIZE)

    def collect(self):
        angles, speeds = motors_controller.read_state()
        battery_percentage = battery_monitor.percentage()

        pack_into(
            TelemetryProtocol.FORMAT,
            self.payload,
            0,
            battery_percentage,
            *angles,
            *speeds,
            light_manager.current_index
        )

        return bytes(self.payload)

    async def broadcast(self):
        await app_data.write_bytes(self.collect())

class HubController:
    def __init__(self):
        self.command_handler = CommandHandler()
        self.telemetry_broadcaster = TelemetryCollector()

    async def process_stdin_command(self):
        await self.command_handler.process_stdin()

    def process_app_data_command(self):
        self.command_handler.process_app_data()

    async def broadcast_telemetry(self):
        await self.telemetry_broadcaster.broadcast()

hub_controller = HubController()

async def discover_motors_loop():
    while True:
        motors_controller.discover()
        await wait(500)

async def process_stdin_command_loop():
    while True:
        await hub_controller.process_stdin_command()
        await wait(0)

async def process_app_data_command_loop():
    while True:
        hub_controller.process_app_data_command()
        await wait(500)

async def broadcast_telemetry_loop():
    while True:
        await hub_controller.broadcast_telemetry()
        await wait(1000)

async def main():
    await multitask(
        discover_motors_loop(),
        process_stdin_command_loop(),
        process_app_data_command_loop(),
        broadcast_telemetry_loop()
    )

run_task(main())
`;

export const programRun = `
run_task(main())
`;
