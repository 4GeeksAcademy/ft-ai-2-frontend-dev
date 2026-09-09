from src.queue import Queue, PriorityQueue, CircularQueue

# # Default queue:
# queue: Queue[str] = Queue()

# queue.enqueue("Making a sandwich:")
# queue.enqueue("Take your bread and lay 2 slices on your work surface.")
# queue.enqueue("Grab your toppings (e.g. peanut butter, jelly.)")
# queue.enqueue("Grab your topping spreading utensil (e.g. a butter knife.)")
# queue.enqueue("Spread your toppings on your bread.")
# queue.enqueue("Close the sandwich toppings-side in and enjoy.")

# print(queue.dequeue())
# print(queue.dequeue())
# print(queue.dequeue())
# print(queue.dequeue())
# print(queue.dequeue())
# print(queue.dequeue())

# # Priority queue
# alpha_queue: PriorityQueue[str] = PriorityQueue()

# alpha_queue.enqueue("Making a sandwich:")
# alpha_queue.enqueue("Take your bread and lay 2 slices on your work surface.")
# alpha_queue.enqueue("Grab your toppings (e.g. peanut butter, jelly.)")
# alpha_queue.enqueue("Grab your topping spreading utensil (e.g. a butter knife.)")
# alpha_queue.enqueue("Spread your toppings on your bread.")
# alpha_queue.enqueue("Close the sandwich toppings-side in and enjoy.")

# print(alpha_queue.dequeue())
# print(alpha_queue.dequeue())
# print(alpha_queue.dequeue())
# print(alpha_queue.dequeue())
# print(alpha_queue.dequeue())
# print(alpha_queue.dequeue())

# Circular queue
light: CircularQueue[str] = CircularQueue(3)

light.enqueue("Green")
light.enqueue("Yellow")
light.enqueue("Red")

for _ in range(12):
    print(light.dequeue())
