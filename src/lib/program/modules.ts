import setup from "@/lib/program/01_setup.py?raw";
import hubDevices from "@/lib/program/02_hub_devices.py?raw";
import hubBattery from "@/lib/program/03_hub_battery.py?raw";
import hubCommands from "@/lib/program/04_hub_commands.py?raw";
import hubIMU from "@/lib/program/05_hub_imu.py?raw";
import motorLimits from "@/lib/program/06_motor_limits.py?raw";
import motorStates from "@/lib/program/07_motor_states.py?raw";
import motorCommands from "@/lib/program/08_motor_commands.py?raw";
import colorDistanceSensorStates from "@/lib/program/09_color_distance_sensor_states.py?raw";
import stdinCommands from "@/lib/program/10_stdin_commands.py?raw";
import appDataCommands from "@/lib/program/11_app_data_commands.py?raw";
import main from "@/lib/program/12_main.py?raw";

export const programModules = {
  setup,
  hubDevices,
  hubBattery,
  hubCommands,
  hubIMU,
  motorLimits,
  motorStates,
  motorCommands,
  colorDistanceSensorStates,
  stdinCommands,
  appDataCommands,
  main,
};
