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

def do_nothing(*args, **kwargs):
    return None

class NoneDevice:
    def __bool__(self):
        return False

    def __getattr__(self, name):
        return do_nothing

def discover_devices(device_cls):
    devices = {}

    for port in [Port.A, Port.B, Port.C, Port.D, Port.E, Port.F]:
        try:
            devices[port] = device_cls(port)
        except OSError:
            devices[port] = NoneDevice()

    return devices

class HubController:
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

    MIN_VOLTAGE = 6000
    MAX_VOLTAGE = 8300

    def __init__(self, hub):
        self.hub = hub

    def shutdown(self):
        self.hub.system.shutdown()

    def set_light(self, index):
        self.hub.light.on(self.COLORS[index])

    def battery_percentage(self):
        voltage = self.hub.battery.voltage()
        value = int((voltage - self.MIN_VOLTAGE) * 100 / (self.MAX_VOLTAGE - self.MIN_VOLTAGE))
        return max(0, min(100, value))

    def signal_strength(self):
        return self.hub.ble.signal_strength(0)

class MotorsController
    def __init__(self):
        self.motors = discover_devices(Motor)

    def set_speeds(self, speeds):
        for i, port in enumerate(self.ports):
            motor = self.motors[port]
            motor.run(speeds[i])

    def stop_all(self):
        for motor in self.motors.values():
            motor.stop()

    def read_states(self):
        for port, motor in self.motors.items():
            if motor:
                yield port, motor.model.state()

class ColorDistanceSensorsController:
    def __init__(self):
        self.sensors = discover_devices(ColorDistanceSensor)

    def read_states(self):
        for port, sensor in self.sensors.items():
            if sensor:
                yield port, [sensor.distance(), *sensor.hsv()]

motors_controller = MotorsController()
color_distance_sensors_controller = ColorDistanceSensorsController()
hub_controller = HubController(hub)
battery_monitor = BatteryMonitor(hub)

class CommandType:
    SHUTDOWN_HUB = 0x10
    SET_HUB_LIGHT = 0x11

    SET_MOTOR_SPEEDS = 0x20
    STOP_ALL_MOTORS = 0x21

    SET_COLOR_DISTANCE_SENSOR_LIGHT = 0x30

    @classmethod
    def all(cls):
        return [cls.SHUTDOWN_HUB, cls.SET_HUB_LIGHT, cls.SET_MOTOR_SPEEDS, cls.STOP_ALL_MOTORS, cls.SET_COLOR_DISTANCE_SENSOR_LIGHT]

class CommandProtocol:
    # [CommandType(B), ...4xArgument(h)]
    FORMAT = "<Bhhhh"
    SIZE = calcsize(FORMAT)

app_data = AppData(CommandProtocol.FORMAT)

class CommandHandler:
    def __init__(self):
        self.poller = poll()
        self.poller.register(stdin)

    async def process_stdin(self):
        while not self.poller.poll(0):
            await wait(10)

        command_type = stdin.buffer.read(1)[0]

        # Remove bytes that are not commands
        while command_type not in CommandType.all():
            command_type = stdin.buffer.read(1)[0]

        payload = bytes([command_type]) + stdin.buffer.read(CommandProtocol.SIZE - 1)
        values = unpack(CommandProtocol.FORMAT, payload)

        args = values[1:]
        self.handle_command(command_type, args)

    def process_app_data(self):
        values = app_data.get_values()
        command_type = values[0]
        args = values[1:]
        self.handle_command(command_type, args)

    def handle_command(self, command_type, args):
        if command_type == CommandType.SHUTDOWN_HUB:
            hub_controller.shutdown()
        elif command_type == CommandType.SET_HUB_LIGHT:
            hub_controller.set_light(args[0])
        elif command_type == CommandType.SET_MOTOR_SPEEDS:
            motors_controller.set_speeds(args[0:])
        elif command_type == CommandType.STOP_ALL_MOTORS:
            motors_controller.stop_all()
        elif command_type == CommandType.SET_COLOR_DISTANCE_SENSOR_LIGHT:
            pass # To be implemented

class TelemetryType:
    HUB_STATUS = 0x11
    HUB_IMU = 0x12
    MOTOR_STATUS = 0x20
    COLOR_DISTANCE_SENSOR_STATUS = 0x30

class TelemetryProtocol:
    MAX_SIZE = calcsize("<Bhhhhh")

    # [TelemetryType(B), BatteryPercentage(B), SignalStrength(b)]
    HUB_STATUS_FORMAT = "<BBb"
    HUB_STATUS_SIZE = calcsize(HUB_STATUS_FORMAT)

    # [TelemetryType(B), Pitch(h), Roll(h), Yaw(h)]
    HUB_IMU_FORMAT = "<Bhhh"
    HUB_IMU_SIZE = calcsize(HUB_IMU_FORMAT)

    # [TelemetryType(B), Port(B), Angle(h), Speed(h), Load(h), IsStalled(B)]
    MOTOR_STATUS_FORMAT = "<BBhhh?"
    MOTOR_STATUS_SIZE = calcsize(MOTOR_STATUS_FORMAT)

    # [TelemetryType(B), Port(B), Distance(h), Hue(h), Saturation(h), Value(h)]
    COLOR_DISTANCE_SENSOR_STATUS_FORMAT = "<BBhhhh"
    COLOR_DISTANCE_SENSOR_STATUS_SIZE = calcsize(COLOR_DISTANCE_SENSOR_STATUS_FORMAT)

class TelemetryCollector:
    def __init__(self):
        self.payload = bytearray(TelemetryProtocol.MAX_SIZE)

    def collect_hub_status(self):
        pack_into(
            TelemetryProtocol.HUB_STATUS_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_STATUS,
            hub_controller.battery_percentage(),
            hub_controller.signal_strength()
        )

        return memoryview(self.payload)[:TelemetryProtocol.HUB_STATUS_SIZE]

    def collect_hub_imu(self):
        pack_into(
            TelemetryProtocol.HUB_IMU_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_IMU,
            *hub.imu.pitch_roll(),
            hub.imu.heading('3D')
        )

        return memoryview(self.payload)[:TelemetryProtocol.HUB_IMU_SIZE]

    def collect_motor_statuses(self):
        for port, motor_status in motors_controller.read_states():
            pack_into(
                TelemetryProtocol.MOTOR_STATUS_FORMAT,
                self.payload,
                0,
                TelemetryType.MOTOR_STATUS,
                port,
                *motor_status
            )

            yield memoryview(self.payload)[:TelemetryProtocol.MOTOR_STATUS_SIZE]

    def collect_color_distance_sensor_statuses(self):
        for port, sensor_status in color_distance_sensors_controller.read_states():
            pack_into(
                TelemetryProtocol.COLOR_DISTANCE_SENSOR_STATUS_FORMAT,
                self.payload,
                0,
                TelemetryType.COLOR_DISTANCE_SENSOR_STATUS,
                port,
                *sensor_status
            )

            yield memoryview(self.payload)[:TelemetryProtocol.COLOR_DISTANCE_SENSOR_STATUS_SIZE]

command_handler = CommandHandler()
telemetry_collector = TelemetryCollector()

async def process_stdin_command_loop():
    while True:
        await self.command_handler.process_stdin()
        await wait(0)

async def process_app_data_command_loop():
    while True:
        self.command_handler.process_app_data()
        await wait(500)

async def broadcast_low_rate_telemetry_loop():
    while True:
        bytes = self.telemetry_collector.collect_hub_status()
        await app_data.write_bytes(bytes)
        await wait(10000)

async def broadcast_high_rate_telemetry_loop():
    while True:
        bytes = self.telemetry_collector.collect_hub_imu()
        await app_data.write_bytes(bytes)

        for bytes in self.telemetry_collector.collect_motor_statuses():
            await app_data.write_bytes(bytes)

        for bytes in self.telemetry_collector.collect_color_distance_sensor_statuses():
            await app_data.write_bytes(bytes)

        await wait(1000)

async def main():
    await multitask(
        process_stdin_command_loop(),
        process_app_data_command_loop(),
        broadcast_telemetry_low_rate_loop(),
        broadcast_high_rate_telemetry_loop()
    )

run_task(main())
`;
