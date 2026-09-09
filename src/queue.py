from typing import (
    TypeVar, Generic, Callable
)

T = TypeVar('T')

class Queue(Generic[T]):
    """A first in first out data structure (FIFO)"""
    _items: list[T]

    def __init__(self):
        """Creates a new queue."""
        self._items = []

    def enqueue(self, item: T) -> None:
        """Adds items to the queue"""
        self._items.append(item)

    def dequeue(self) -> T:
        """Removes items from the queue"""
        if not len(self._items):
            raise IndexError("Queue is empty")
        return self._items.pop(0)


class PriorityQueue(Queue[T]):
    """A queue that sorts on some criteria for dequeuing."""
    _priority_func: Callable | None

    def __init__(self, priority_func: Callable | None = None):
        super().__init__()
        self._priority_func = priority_func

    def enqueue(self, item: T):
        super().enqueue(item)
        self._items = sorted(
            self._items,
            key=self._priority_func
        )


class CircularQueue(Queue[T]):
    """I spotted some bugs in this, but that's
    going to be an exercise for the viewers to
    sort out."""
    _size: int
    _index: int

    def __init__(self, size: int):
        if size < 0:
            raise ValueError("Size of queue cannot be negative.")

        super().__init__()
        self._size = size
        self._index = 0

    def enqueue(self, item):
        """This is enqueuing items wrong if you delete
        items that you are dequeing."""
        if len(self._items) >= self._size:
            raise ValueError("Circular queue is full.")
        
        super().enqueue(item)

    def dequeue(self, remove_item: bool = False):
        item = self._items[self._index]

        if item is None:
            raise IndexError("Queue is empty")

        if remove_item:
            del self._items[self._index]

        self._index = (self._index + 1) % self._size
        return item
