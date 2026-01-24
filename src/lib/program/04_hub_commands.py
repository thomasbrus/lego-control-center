stdin_command_handlers[b'a'] = lambda args: hub.system.shutdown()
stdin_command_handlers[b'b'] = lambda args: hub.lignt.on(Color(*args[0:3]))
stdin_command_handlers[b'c'] = lambda args: hub.lignt.off()
