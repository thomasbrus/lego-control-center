def broadcast_motor_limit(index):
    motor = Motor(ports[index])
    limits = motor.control.limits()

    # [TelemetryType(B), Port(B), Speed(h), Acceleration(h), Torque(h)]
    app_data.write_bytes(pack("<BBhhh", 0x20, index, limits[0], limits[1], limits[2]))

# Based on order at https://docs.pybricks.com/en/latest/pupdevices/index.html (Motor = 2)
[broadcast_motor_limit(index) for index, device_id in enumerate(device_ids) if device_id == 2]
