import asyncio
from random import randrange


background_tasks: set[asyncio.Task[int]] = set()


async def crunch_data() -> int:
    seconds = randrange(5, 10)
    print(f"crunch_data(): working for {seconds} second(s)")
    await asyncio.sleep(seconds)
    return seconds


def show_result(task: asyncio.Task[int]) -> None:
    background_tasks.discard(task)
    print(f"callback: crunch_data() returned {task.result()}")


async def main():
    task = asyncio.create_task(crunch_data())
    background_tasks.add(task)
    task.add_done_callback(show_result)

    print("main(): task scheduled, doing something else")
    await asyncio.sleep(0.5)

    print("main(): waiting for the scheduled task")
    result = await task
    print(f"main(): awaited task result is {result}")


if __name__ == "__main__":
    asyncio.run(main())
