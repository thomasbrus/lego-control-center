def broadcast_motor_state(index):
    state = Motor(ports[index]).model.state()

    # [TelemetryType(B), Port(B), Angle(h), Speed(h), Load(h), IsStalled(B)]
    app_data.write_bytes(pack("<BBhhhB", 0x21, index, int(state[0]), int(state[1]), int(state[2]), int(state[3])))

def broadcast_motor_states():
    [broadcast_motor_state(index) for index, device_id in enumerate(device_ids) if device_id == 2]

async def broadcast_motor_states_loop():
    while True: broadcast_motor_states(); await wait(100)

tasks.append(broadcast_motor_states_loop())
