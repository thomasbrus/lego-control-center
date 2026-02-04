import { legoRequestDeviceOptions } from "@/lego/bluetooth";
import { pybricksRequestDeviceOptions } from "@/pybricks/bluetooth";

export const requestDeviceOptions = {
  filters: [...legoRequestDeviceOptions.filters, ...pybricksRequestDeviceOptions.filters],
  optionalServices: [...legoRequestDeviceOptions.optionalServices, ...pybricksRequestDeviceOptions.optionalServices],
};
