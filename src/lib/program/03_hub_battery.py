# Parameters for the battery percentage calculation (nominal_voltage, curve_steepness)
battery_parameters = { 'TechnicHub>': (7200, 0.005), '<PrimeHub>': (7400, 0.006) }.get(str(hub))

def broadcast_battery_percentage():
    # Logistic Function for smooth plateau modeling
    exponent = -battery_parameters[1] * (hub.battery.voltage() - battery_parameters[0])
    value = int(100 / (1 + exp(exponent)))

    # [TelemetryType(B), BatteryPercentage(B)]
    app_data.write_bytes(pack("<BB", 0x11, value))

async def broadcast_battery_percentage_loop():
    while True: broadcast_battery_percentage(); await wait(60000)

tasks.append(broadcast_battery_percentage_loop())
