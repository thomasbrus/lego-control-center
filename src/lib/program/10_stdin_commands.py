poller = poll()
poller.register(stdin)

async def process_stdin(self):
    if not poller.poll(0): return
    id, *args = unpack("<Bhhhh", stdin.buffer.read(9))
    stdin_command_handlers[id](args)

async def process_stdin_loop():
    while True:
        await process_stdin()
        await wait(0)

tasks.append(process_stdin_loop())
