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
    __slots__ = ("COLORS", "MIN_VOLTAGE", "MAX_VOLTAGE")

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

    def shutdown(self):
        hub.system.shutdown()

    def set_light(self, index):
        hub.light.on(self.COLORS[index])

    def name(self):
        return hub.system.info()['name']

    def hub_type(self):
        hub_str = str(hub)

        if hub_str is '<PrimeHub>' and "inventor" in self.name().lower():
                hub_str = '<InventorHub>'

        return HUB_TYPES[hub_str]

    def battery_percentage(self):
        voltage = hub.battery.voltage()
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
        for port, motor in enumerate(self.motors):
            if motor:
                yield port, motor.control.limits()

    def read_states(self):
        for port, motor in enumerate(self.motors):
            if motor:
                yield port, motor.model.state()

class SensorsController:
    __slots__ = ("sensors",)

    def __init__(self):
        self.sensors = discover_devices(ColorDistanceSensor)
        self.sensor_states = {}
        gc.collect()

    async def update_states(self):
        for port, sensor in enumerate(self.sensors):
            if sensor:
                if str(sensor) == '<ColorDistanceSensor>':
                    distance = await sensor.distance()
                    hue, saturation, value = await sensor.hsv()
                    self.sensor_states[port] = (distance, hue, saturation, value)

    def read_states(self):
        for port, sensor_state in self.sensor_states.items():
            if str(self.sensors[port]) == '<ColorDistanceSensor>':
                yield port, 2, sensor_state


motors_controller = MotorsController()
sensors_controller = SensorsController()
hub_controller = HubController()

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
    HUB_STATE = const(0x11)
    HUB_IMU = const(0x12)
    MOTOR_LIMITS = const(0x20)
    MOTOR_STATE = const(0x21)
    SENSOR_STATE = const(0x30)

class TelemetryProtocol:
    MAX_SIZE = calcsize("<BBBhhhh")

    # [TelemetryType(B), HubType(B)]
    HUB_INFO_FORMAT = "<BB"
    HUB_INFO_SIZE = calcsize(HUB_INFO_FORMAT)

    # [TelemetryType(B), BatteryPercentage(B)]
    HUB_STATE_FORMAT = "<BB"
    HUB_STATE_SIZE = calcsize(HUB_STATE_FORMAT)

    # [TelemetryType(B), Pitch(h), Roll(h), Yaw(h)]
    HUB_IMU_FORMAT = "<Bhhh"
    HUB_IMU_SIZE = calcsize(HUB_IMU_FORMAT)

    # [TelemetryType(B), Port(B), Speed(h), Acceleration(h), torque(h)]
    MOTOR_LIMITS_FORMAT = "<BBhhh"
    MOTOR_LIMITS_SIZE = calcsize(MOTOR_LIMITS_FORMAT)

    # [TelemetryType(B), Port(B), Angle(h), Speed(h), Load(h), IsStalled(B)]
    MOTOR_STATE_FORMAT = "<BBhhhB"
    MOTOR_STATE_SIZE = calcsize(MOTOR_STATE_FORMAT)

    # [TelemetryType(B), Port(B), SensorType(B), Value0(h), Value1(h), Value2(h), Value3(h)]
    SENSOR_STATE_FORMAT = "<BBBhhhh"
    SENSOR_STATE_SIZE = calcsize(SENSOR_STATE_FORMAT)

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

    def collect_hub_state(self):
        pack_into(
            TelemetryProtocol.HUB_STATE_FORMAT,
            self.payload,
            0,
            TelemetryType.HUB_STATE,
            hub_controller.battery_percentage()
        )

        return bytes(self.payload)[:TelemetryProtocol.HUB_STATE_SIZE]

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
        for port, motor_limits in motors_controller.read_limits():
            pack_into(
                TelemetryProtocol.MOTOR_LIMITS_FORMAT,
                self.payload,
                0,
                TelemetryType.MOTOR_LIMITS,
                port,
                motor_limits[0],
                motor_limits[1],
                motor_limits[2]
            )

            yield bytes(self.payload)[:TelemetryProtocol.MOTOR_LIMITS_SIZE]

    def collect_motor_states(self):
        for port, motor_state in motors_controller.read_states():
            pack_into(
                TelemetryProtocol.MOTOR_STATE_FORMAT,
                self.payload,
                0,
                TelemetryType.MOTOR_STATE,
                port,
                int(motor_state[0]),
                int(motor_state[1]),
                int(motor_state[2]),
                int(motor_state[3])
            )

            yield bytes(self.payload)[:TelemetryProtocol.MOTOR_STATE_SIZE]

    def collect_sensor_states(self):
        for port, sensor_type, sensor_state in sensors_controller.read_states():
            pack_into(
                TelemetryProtocol.SENSOR_STATE_FORMAT,
                self.payload,
                0,
                TelemetryType.SENSOR_STATE,
                port,
                sensor_type,
                sensor_state[0],
                sensor_state[1],
                sensor_state[2],
                sensor_state[3]
            )

            yield bytes(self.payload)[:TelemetryProtocol.SENSOR_STATE_SIZE]

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

async def update_sensor_states_loop():
    while True:
        await sensors_controller.update_states()
        await wait(100)

async def broadcast_telemetry_loop():
    data = telemetry_collector.collect_hub_info()
    await app_data.write_bytes(data)

    for data in telemetry_collector.collect_motor_limits():
        await app_data.write_bytes(data)

    while True:
        data = telemetry_collector.collect_hub_state()
        await app_data.write_bytes(data)
        await wait(100)

        for i in range(10):
            data = telemetry_collector.collect_hub_imu()
            await app_data.write_bytes(data)

            for data in telemetry_collector.collect_motor_states():
                await app_data.write_bytes(data)

            for data in telemetry_collector.collect_sensor_states():
                await app_data.write_bytes(data)

            await wait(100)
            gc.collect()

async def main():
    await multitask(
        process_stdin_command_loop(),
        process_app_data_command_loop(),
        update_sensor_states_loop(),
        broadcast_telemetry_loop()
    )

run_task(main())
`;
