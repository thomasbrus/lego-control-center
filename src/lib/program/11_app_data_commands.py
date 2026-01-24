app_data_command_handlers[0] = lambda args: None

def process_app_data():
    # [CommandType(B), ...4xArgument(h)]
    type, *args = app_data.get_values()
    app_data_command_handlers[type](args)

async def process_app_data_loop():
    while True:
        process_app_data()
        await wait(100)
