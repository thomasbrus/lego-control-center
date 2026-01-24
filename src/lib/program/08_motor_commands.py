stdin_command_handlers[b'd'] = lambda args: Motor(ports[args[0]]).stop()
app_data_command_handlers[b'e'] = lambda args: Motor(ports[args[0]]).run(args[1])
