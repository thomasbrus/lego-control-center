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


class Commands:
    HUB_SHUTDOWN        = 0x10
    MOTOR_SET_SPEEDS    = 0x20
    MOTOR_STOP_ALL      = 0x21
    LIGHT_SET           = 0x30

class CommandHandler:
    def __init__(self, motor_controller, light_manager):
        self.motor_controller = motor_controller
        self.light_manager = light_manager

    def process(self, values):
        command_id = values[0]

        if command_id == Commands.HUB_SHUTDOWN:
            self.hub.system.shutdown()
        elif command_id == Commands.MOTOR_SET_SPEEDS:
            # values[1:5] = speeds for ports A-D
            self.motor_controller.set_speeds(values[1:])
        elif command_id == Commands.MOTOR_STOP_ALL:
            self.motor_controller.stop_all()
        elif command_id == Commands.LIGHT_SET:
            # values[1] = color index (0 = NONE)
            self.light_manager.set(values[1])

class TelemetryCollector:
    def __init__(self, motor_controller, light_manager, battery_monitor):
        self.motor_controller = motor_controller
        self.light_manager = light_manager
        self.battery_monitor = battery_monitor
        self.watch = Watch()

    def collect(self):
        angles, speeds = self.motor_controller.read_state()
        battery_percentage = self.battery_monitor.percentage()

        # Pack:
        # [Time(I), Light(B), Battery(B), 4xAngle(h), 4xSpeed(h)]
        payload = ustruct.pack(
            "<IBBhhhhhhhh",
            self.watch.time(),
            self.light_manager.current_index,
            battery_percentage,
            *angles,
            *speeds
        )

        return payload

class Protocol
    # Incoming: [CmdID(B), Arg1(h), Arg2(h), Arg3(h), Arg4(h)]
    FORMAT = "<Bhhhh"
    SIZE = ustruct.calcsize(FORMAT)

class HubController:
    def __init__(self, hub):
        self.hub = hub

        self.app_data = AppData(Protocol.FORMAT)
        self.motor_controller = MotorController([Port.A, Port.B, Port.C, Port.D])
        self.light_manager = LightManager(self.hub)
        self.battery_monitor = BatteryMonitor(self.hub)

        self.command_handler = CommandHandler(self.motor_controller, self.light_manager)
        self.telemetry_collector = TelemetryCollector(self.motor_controller, self.light_manager, self.battery_monitor)

    def process_stdin_command(self):
        values = ustruct.unpack(Protocol.FORMAT, stdin.buffer.read(Protocol.SIZE))
        self.command_handler.process(values)

    def process_app_data_command(self):
        self.command_handler.process(self.app_data.get_values())

    async def broadcast_telemetry(self):
        await self.app_data.write_bytes(self.telemetry_collector.collect())

hub_controller = HubController(hub)

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
