ports = tuple(getattr(Port, s) for s in "ABCDEF" if hasattr(Port, s))

def get_device_id(port):
  # Based on order at https://docs.pybricks.com/en/latest/pupdevices/index.html
  for device_class, device_id in ((Motor, 2), (ColorDistanceSensor, 5)):
    try: return device_class(port) and device_id
    except OSError: pass
  return 0

device_ids = tuple(get_device_id(port) for port in ports)

# [TelemetryType(B), DeviceTypeA(B), DeviceTypeB(B), DeviceTypeC(B), DeviceTypeD(B), DeviceTypeE(B), DeviceTypeF(B)]
AppData().write_bytes(pack("<BBBBBBB", 0x10, *device_ids))
