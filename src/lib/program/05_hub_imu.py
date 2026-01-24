def broadcast_hub_imu():
    pitch, roll = hub.imu.tilt()
    heading = hub.imu.heading()

    # [TelemetryType(B), Pitch(h), Roll(h), Heading(h)]
    app_data.write_bytes(pack("<Bhhh", 0x12, int(pitch), int(roll), int(heading)))

async def broadcast_hub_imu_loop():
     while True: broadcast_hub_imu(); await wait(100)

tasks.append(broadcast_hub_imu_loop())
