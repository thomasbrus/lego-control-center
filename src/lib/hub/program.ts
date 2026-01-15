export const programDemo = `
print("Hello world!")
`;

export const programMain = `
from usys import stdin, stdout
import ustruct

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

class MotorController:
    def __init__(self, ports):
        self.ports = ports
        self.motors = {}
        self._discover()

    def _discover(self):
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
motor_controller = MotorController([Port.A, Port.B, Port.C, Port.D])
light_manager = LightManager(hub)
battery_monitor = BatteryMonitor(hub)

class Commands:
    HUB_SHUTDOWN        = 0x10
    MOTOR_SET_SPEEDS    = 0x20
    MOTOR_STOP_ALL      = 0x21
    LIGHT_SET           = 0x30

class CommandProtocol:
    # [CommandId(B), ...4xArgument(h)]
    FORMAT = "<Bhhhh"
    SIZE = ustruct.calcsize(FORMAT)

# AppData for bidirectional communication
app_data = AppData(CommandProtocol.FORMAT)

class CommandHandler:
    def __init__(self):
        pass

    def process_stdin(self):
        values = ustruct.unpack(CommandProtocol.FORMAT, stdin.buffer.read(CommandProtocol.SIZE))
        self._execute(values)

    def process_app_data(self):
        self._execute(app_data.get_values())

    def _execute(self, values):
        command_id = values[0]

        if command_id == Commands.HUB_SHUTDOWN:
            hub.system.shutdown()
        elif command_id == Commands.MOTOR_SET_SPEEDS:
            # values[1:5] = speeds for ports A-D
            motor_controller.set_speeds(values[1:])
        elif command_id == Commands.MOTOR_STOP_ALL:
            motor_controller.stop_all()
        elif command_id == Commands.LIGHT_SET:
            # values[1] = color index (0 = NONE)
            light_manager.set(values[1])

class TelemetryProtocol:
    # [Time(I), HubBattery(B), ...4xMotorAngle(h), ...4xMotorSpeed(h), LightStatus(B)]
    FORMAT = "<IBhhhhhhhhB"

class TelemetryCollector:
    def __init__(self):
        self.stopWatch = StopWatch()

    def collect(self):
        angles, speeds = motor_controller.read_state()
        battery_percentage = battery_monitor.percentage()

        payload = ustruct.pack(
            TelemetryProtocol.FORMAT,
            self.stopWatch.time(),
            battery_percentage,
            *angles,
            *speeds,
            light_manager.current_index
        )

        return payload

    async def broadcast(self):
        await app_data.write_bytes(self.collect())

class HubController:
    def __init__(self):
        self.command_handler = CommandHandler()
        self.telemetry_broadcaster = TelemetryCollector()

    def process_stdin_command(self):
        self.command_handler.process_stdin()

    def process_app_data_command(self):
        self.command_handler.process_app_data()

    async def broadcast_telemetry(self):
        await self.telemetry_broadcaster.broadcast()

hub_controller = HubController()

async def process_stdin_command_loop():
    while True:
        hub_controller.process_stdin_command()

async def process_app_data_command_loop():
    while True:
        hub_controller.process_app_data_command()
        await wait(500)

async def broadcast_telemetry_loop():
    while True:
        await hub_controller.broadcast_telemetry()
        await wait(1000)

async def main():
    await multitask(process_stdin_command_loop(), process_app_data_command_loop(), broadcast_telemetry_loop())
`;

export const programRun = `
run_task(main())
`;
