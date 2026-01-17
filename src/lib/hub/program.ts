export const programDemo1 = `
print("Hello world!")

async def say_hello():
    while True:
        print("Hello world!")
        await wait(1000)
`;

export const programDemo2 = `
async def main():
    await multitask(say_hello())

run_task(main())
`;

export const programMain1 = `
from usys import stdin, stdout
from ustruct import unpack, pack_into, calcsize
from uselect import poll
from micropython import const # This is key for saving RAM

PORT_NAMES = ('A', 'B', 'C', 'D', 'E', 'F')
PORTS = tuple(getattr(Port, name) for name in PORT_NAMES if hasattr(Port, name))

def discover_device_on_port(port, *device_classes):
    for device_cls in device_classes:
        try:
            return device_cls(port)
        except OSError:
            pass
    return None

def discover_devices(*device_classes):
    return [discover_device_on_port(p, *device_classes) for p in PORTS]

HUB_TYPES = {
'<TechnicHub>': 2,
    '<InventorHub>': 3,
    '<PrimeHub>': 4,
}

class HubController:
    __slots__ = ("hub", "COLORS", "MIN_VOLTAGE", "MAX_VOLTAGE")

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

    def name(self):
        return self.hub.system.info().name

    def hub_type(self):
        hub_str = str(self.hub)

        if hub_str is '<PrimeHub>' and "inventor" in self.name().lower():
                hub_str = '<InvenHorHub>'

        return HUB_TYPES[hub_str]

    def battery_percentage(self):
        voltage = self.hub.battery.voltage()
        value = int((voltage - self.MIN_VOLTAGE) * 100 / (self.MAX_VOLTAGE - self.MIN_VOLTAGE))
        return max(0, min(100, value))

class MotorsController:
    __slots__ = ("motors",)

    def __init__(self):
        self.motors = discover_devices(Motor)
        gc.collect()

    def set_speeds(self, speeds):
        for motor, speed in zip(self.motors, speeds):
            if motor:
                motor.run(speed)

    def stop_all(self):
        for motor in self.motors:
            motor.stop()

    def read_limits(self):
        for port_index, motor in enumerate(self.motors):
            if motor:
                yield port_index, motor.control.limits()

    def read_states(self):
        for port_index, motor in enumerate(self.motors):
            if motor:
                yield port_index, motor.model.state()

SENSOR_STATE_READERS = {
    ColorDistanceSensor: (0, lambda sensor: [sensor.distance()] + list(sensor.hsv())),
}

class SensorsController:
    __slots__ = ("sensors",)

    def __init__(self):
        self.sensors = discover_devices(ColorDistanceSensor)
        gc.collect()

    def read_states(self):
        for port_index, sensor in enumerate(self.sensors):
            if sensor:
                sensor_type_id, read_state = SENSOR_STATE_READERS[type(sensor)]
                yield port_index, sensor_type_id, read_state(sensor)

motors_controller = MotorsController()
sensors_controller = SensorsController()
hub_controller = HubController(hub)

class CommandType:
    SHUTDOWN_HUB = const(0x10)
    SET_HUB_LIGHT = const(0x11)
    SET_MOTOR_SPEEDS = const(0x20)
    STOP_ALL_MOTORS = const(0x21)
    SET_SENSOR_LIGHT = const(0x30)

ALL_COMMAND_TYPES = [
    CommandType.SHUTDOWN_HUB,
    CommandType.SET_HUB_LIGHT,
    CommandType.SET_MOTOR_SPEEDS,
    CommandType.STOP_ALL_MOTORS,
    CommandType.SET_SENSOR_LIGHT
]

class CommandProtocol:
    # [CommandType(B), ...4xArgument(h)]
    FORMAT = "<Bhhhh"
    SIZE = calcsize(FORMAT)

app_data = AppData(CommandProtocol.FORMAT)

class CommandHandler:
    __slots__ = ("poller",)

    def __init__(self):
        self.poller = poll()
        self.poller.register(stdin)

    async def process_stdin(self):
        if not self.poller.poll(0):
            return

        command_type = stdin.buffer.read(1)[0]

        # Remove bytes that are not commands
        while command_type not in ALL_COMMAND_TYPES:
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
        elif command_type == CommandType.SET_SENSOR_LIGHT:
            pass # To be implemented
`;

export const programMain2 = `
class TelemetryType:
    HUB_INFO = const(0x10)
    HUB_STATUS = const(0x11)
    HUB_IMU = const(0x12)
    MOTOR_LIMITS = const(0x20)
    MOTOR_STATUS = const(0x21)
    SENSOR_STATUS = const(0x30)

class TelemetryProtocol:
    MAX_SIZE = calcsize("<BBBhhhh")

    # [TelemetryType(B), HubType(B)]
    HUB_INFO_FORMAT = "<BB"
    HUB_INFO_SIZE = calcsize(HUB_INFO_FORMAT)

    # [TelemetryType(B), BatteryPercentage(B)]
    HUB_STATUS_FORMAT = "<BB"
    HUB_STATUS_SIZE = calcsize(HUB_STATUS_FORMAT)

    # [TelemetryType(B), Pitch(h), Roll(h), Yaw(h)]
    HUB_IMU_FORMAT = "<Bhhh"
    HUB_IMU_SIZE = calcsize(HUB_IMU_FORMAT)

    # [TelemetryType(B), PortIndex(B), Speed(h), Acceleration(h), torque(h)]
    MOTOR_LIMITS_FORMAT = "<BBhhh"
    MOTOR_LIMITS_SIZE = calcsize(MOTOR_LIMITS_FORMAT)

    # [TelemetryType(B), PortIndex(B), Angle(h), Speed(h), Load(h), IsStalled(B)]
    MOTOR_STATUS_FORMAT = "<BBhhhB"
    MOTOR_STATUS_SIZE = calcsize(MOTOR_STATUS_FORMAT)

    # [TelemetryType(B), PortIndex(B), SensorType(B), Distance(h), Hue(h), Saturation(h), Value(h)]
    SENSOR_STATUS_FORMAT = "<BBBhhhh"
    SENSOR_STATUS_SIZE = calcsize(SENSOR_STATUS_FORMAT)

class TelemetryCollector:
    __slots__ = ("payload",)

    def __init__(self):
        self.payload = bytearray(TelemetryProtocol.MAX_SIZE)

    def collect_hub_info(self):
        pack_into(
            TelemetryProtocol.HUB_INFO_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_INFO,
            hub_controller.hub_type()
        )

        return bytes(self.payload)[:TelemetryProtocol.HUB_INFO_SIZE]

    def collect_hub_status(self):
        pack_into(
            TelemetryProtocol.HUB_STATUS_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_STATUS,
            hub_controller.battery_percentage()
        )

        return bytes(self.payload)[:TelemetryProtocol.HUB_STATUS_SIZE]

    def collect_hub_imu(self):
        pitch, roll = hub.imu.tilt()
        heading = hub.imu.heading('3D')

        pack_into(
            TelemetryProtocol.HUB_IMU_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_IMU,
            int(pitch),
            int(roll),
            int(heading)
        )

        return bytes(self.payload)[:TelemetryProtocol.HUB_IMU_SIZE]

    def collect_motor_limits(self):
        for port_index, motor_limits in motors_controller.read_limits():
            pack_into(
                TelemetryProtocol.MOTOR_LIMITS_FORMAT,
                self.payload,
                0,
                TelemetryType.MOTOR_LIMITS,
                port_index,
                motor_limits[0],
                motor_limits[1],
                motor_limits[2]
            )

            yield bytes(self.payload)[:TelemetryProtocol.MOTOR_LIMITS_SIZE]

    def collect_motor_statuses(self):
        for port_index, motor_status in motors_controller.read_states():
            pack_into(
                TelemetryProtocol.MOTOR_STATUS_FORMAT,
                self.payload,
                0,
                TelemetryType.MOTOR_STATUS,
                port_index,
                int(motor_status[0]),
                int(motor_status[1]),
                int(motor_status[2]),
                int(motor_status[3])
            )

            yield bytes(self.payload)[:TelemetryProtocol.MOTOR_STATUS_SIZE]

    def collect_sensor_statuses(self):
        for port_index, sensor_type, sensor_status in sensors_controller.read_states():
            pack_into(
                TelemetryProtocol.SENSOR_STATUS_FORMAT,
                self.payload,
                0,
                TelemetryType.SENSOR_STATUS,
                port_index,
                sensor_type,
                sensor_status[0],
                sensor_status[1],
                sensor_status[2],
                sensor_status[3]
            )

            yield bytes(self.payload)[:TelemetryProtocol.SENSOR_STATUS_SIZE]

command_handler = CommandHandler()
telemetry_collector = TelemetryCollector()

async def process_stdin_command_loop():
    while True:
        await command_handler.process_stdin()
        await wait(0)

async def process_app_data_command_loop():
    while True:
        command_handler.process_app_data()
        await wait(500)

async def broadcast_telemetry_loop():
    bytes = telemetry_collector.collect_hub_info()
    await app_data.write_bytes(bytes)

    for bytes in telemetry_collector.collect_motor_limits():
        await app_data.write_bytes(bytes)

    while True:
        bytes = telemetry_collector.collect_hub_status()
        await app_data.write_bytes(bytes)
        await wait(100)

        for i in range(10):
            bytes = telemetry_collector.collect_hub_imu()
            await app_data.write_bytes(bytes)

            for bytes in telemetry_collector.collect_motor_statuses():
                await app_data.write_bytes(bytes)

            # for bytes in telemetry_collector.collect_sensor_statuses():
            #     await app_data.write_bytes(bytes)

            await wait(100)
            gc.collect()

async def main():
    await multitask(
        process_stdin_command_loop(),
        process_app_data_command_loop(),
        broadcast_telemetry_loop()
    )

run_task(main())
`;
