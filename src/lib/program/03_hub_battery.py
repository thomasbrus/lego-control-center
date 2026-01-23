def broadcast_battery_percentage(nominal_voltage, curve_steepness):
    # Logistic Function for smooth plateau modeling
    exponent = -curve_steepness * (hub.battery.voltage() - nominal_voltage)
    value = int(100 / (1 + exp(exponent)))
    AppData().write_bytes(pack("<BB", 0x20, value))
