from ustruct import pack
from umath import exp
from usys import stdin, stdout
from uselect import poll

# Tracks the functions to run in the main loop.
# Each module can append its own coroutine to this list.
tasks = []

# Tracks the stdin command handlers registered by each module.
# This is used for commands that must be handled and may block.
stdin_command_handlers = {}

# Tracks the app data command handlers registered by each module.
# This is used for last-one-wins command handling.
app_data_command_handlers = {}

app_data = AppData("<Bhhhh")
