async def broadcast_cd_sensor_state(index):
    sensor = ColorDistanceSensor(ports[index])
    hue, saturation, value = await sensor.hsv()
    distance = await sensor.distance()

    # [TelemetryType(B), Port(B), Hue(h), Saturation(h), Value(h), Distance(h)]
    app_data.write_bytes(pack("<BBBhhhh", 0x30, index, hue, saturation, value, distance))

def broadcast_cd_sensor_states():
    [broadcast_cd_sensor_state(index) for index, device_id in enumerate(device_ids) if device_id == 2]

async def broadcast_cd_sensor_states_loop():
    while True: await broadcast_cd_sensor_states(); await wait(100)

tasks.append(broadcast_cd_sensor_states_loop())
