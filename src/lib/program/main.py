# region setup
from ustruct import pack
from umath import exp
from usys import stdin, stdout
from uselect import poll

# Used for broadcasting telemetry data.
app_data = AppData("<Bhhhh")

# Tracks the functions to run in the main loop.
# Each module can append its own coroutine to this list.
tasks = []

# Tracks the stdin command handlers registered by each module.
# This is used for commands that must be handled and may block.
stdin_command_handlers = {}

# Tracks the app data command handlers registered by each module.
# This is used for last-one-wins command handling.
app_data_command_handlers = {}
# endregion

# region devices
ports = tuple(getattr(Port, s) for s in "ABCDEF" if hasattr(Port, s))

def get_device(port):
    for device_class, device_type in ((Motor, 2), (ColorDistanceSensor, 5)):
        try:
            return device_class(port), device_type
        except OSError:
            continue
    return None, 0

devices, device_types = zip(*[get_device(p) for p in ports])

# [TelemetryType(B), DeviceTypeA(B), DeviceTypeB(B), DeviceTypeC(B), DeviceTypeD(B), DeviceTypeE(B), DeviceTypeF(B)]
app_data.write_bytes(pack("<BBBBBBB", 0x10, *device_types))
# endregion

# region battery
# Parameters for the battery percentage calculation (nominal_voltage, curve_steepness)
battery_parameters = { 'technichub': (7200, 0.005), 'primehub': (7400, 0.006) }.get(version[0])

def broadcast_battery_percentage():
    # Logistic function for smooth plateau modeling
    exponent = -battery_parameters[1] * (hub.battery.voltage() - battery_parameters[0])
    value = int(100 / (1 + exp(exponent)))

    # [TelemetryType(B), BatteryPercentage(B)]
    app_data.write_bytes(pack("<BB", 0x11, value))

async def broadcast_battery_percentage_loop():
    while True: broadcast_battery_percentage(); await wait(60000)

tasks.append(broadcast_battery_percentage_loop())
# endregion

# region system-commands
# Let's start at 0x20 since it is the first printable character (space)
# and won't cause side effects in the REPL (unlike ctrl+c / 0x03 for example).
stdin_command_handlers[0x20] = lambda args: hub.system.shutdown()
# endregion

# region light-commands
stdin_command_handlers[0x30] = lambda args: hub.lignt.on(Color(*args[0:3]))
stdin_command_handlers[0x31] = lambda args: hub.lignt.off()
# endregion

# region imu
def broadcast_hub_imu():
    pitch, roll = hub.imu.tilt()
    heading = hub.imu.heading()

    # [TelemetryType(B), Pitch(h), Roll(h), Heading(h)]
    app_data.write_bytes(pack("<Bhhh", 0x12, int(pitch), int(roll), int(heading)))

async def broadcast_hub_imu_loop():
     while True: broadcast_hub_imu(); await wait(100)

tasks.append(broadcast_hub_imu_loop())
# endregion

# region device-enumeration
def enumerate_devices(device_cls, cbk):
    # Finds all devices of type device_cls and executes callback(port, device)
    [cbk(ports[i], device) for i, device in enumerate(devices) if isinstance(device, device_cls)]
# endregion

# region motor-limits
def broadcast_motor_limit(port, motor):
    limits = motor.control.limits()

    # [TelemetryType(B), Port(B), Speed(h), Acceleration(h), Torque(h)]
    app_data.write_bytes(pack("<BBhhh", 0x20, port, limits[0], limits[1], limits[2]))

enumerate_devices(Motor, broadcast_motor_limit)
# endregion

# region motor-state
def broadcast_motor_state(index):
    state = Motor(ports[index]).model.state()

    # [TelemetryType(B), Port(B), Angle(h), Speed(h), Load(h), IsStalled(B)]
    app_data.write_bytes(pack("<BBhhhB", 0x21, index, int(state[0]), int(state[1]), int(state[2]), int(state[3])))

async def broadcast_motor_states_loop():
    while True: enumerate_devices(Motor, broadcast_motor_state); await wait(100)
# endregion

tasks.append(broadcast_motor_states_loop())

# region motor-commands
stdin_command_handlers[0x40] = lambda args: Motor(ports[args[0]]).stop()
app_data_command_handlers[0x41] = lambda args: Motor(ports[args[0]]).run(args[1])
# endregion

# region color-distance-sensor-state
async def broadcast_cd_sensor_state(index):
    sensor = ColorDistanceSensor(ports[index])
    hue, saturation, value = await sensor.hsv()
    distance = await sensor.distance()

    # [TelemetryType(B), Port(B), Hue(h), Saturation(h), Value(h), Distance(h)]
    app_data.write_bytes(pack("<BBBhhhh", 0x30, index, hue, saturation, value, distance))

async def broadcast_cd_sensor_states_loop():
    while True: await enumerate_devices(ColorDistanceSensor, broadcast_cd_sensor_state); await wait(100)

tasks.append(broadcast_cd_sensor_states_loop())
# endregion

# region stdin-processing
poller = poll()
poller.register(stdin)

async def process_stdin():
    if not poller.poll(0): return
    id, *args = unpack("<Bhhhh", stdin.buffer.read(9))
    stdin_command_handlers[id](args)

async def process_stdin_loop():
    while True:
        await process_stdin()
        await wait(0)

tasks.append(process_stdin_loop())
# endregion

# region app-data-processing
app_data_command_handlers[0] = lambda args: None

def process_app_data():
    # [CommandType(B), ...4xArgument(h)]
    type, *args = app_data.get_values()
    app_data_command_handlers[type](args)

async def process_app_data_loop():
    while True:
        process_app_data()
        await wait(100)
# endregion

# region
run_task(multitask(*tasks))
# endregion
