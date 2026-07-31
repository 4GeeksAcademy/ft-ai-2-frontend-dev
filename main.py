import csv
from pathlib import Path
from pprint import pprint

# from PIL import Image

from src.models import Pet


def demo():
    # pillow lets you do image editing in Python (which is cool):
    # with Image.open("assets/feeesh.png") as fish:
    #     out = fish.transpose(Image.Transpose.ROTATE_180)
    #     out.save("assets/upsidedownfish.png")

    # You validate a file exists like this:
    if Path("hello.txt").exists():
        with open("hello.txt", "rt") as oops:
            print(oops)
    else:
        print("hello.txt does not exist.")


def main():
    fieldnames = ["name", "type", "age", "favorite_toy"]

    # You can dump the models to a dictionary and write them:
    # writing_pets = [
    #     Pet(
    #         name="Sombra",
    #         type="Cat",
    #         age=4,
    #         favorite_toy="Goth Flamingo"
    #     ),
    #     Pet(
    #         name="Spot",
    #         type="Dog",
    #         age=9,
    #         favorite_toy="Tire Chew Toy"
    #     ),
    #     Pet(
    #         name="Milo",
    #         type="Dog",
    #         age=9,
    #         favorite_toy="Dory"
    #     ),
    #     Pet(
    #         name="Taffy",
    #         type="Dog",
    #         age=1,
    #         favorite_toy="Furry Duck"
    #     ),
    #     Pet(
    #         name="Stitch",
    #         type="Shrimp",
    #         age=1,
    #         favorite_toy="Rock"
    #     )
    # ]

    # with open("assets/pets.csv", "wt") as pets_file:
    #     writer = csv.DictWriter(
    #         pets_file, lineterminator='\n',
    #         fieldnames=fieldnames
    #     )
    #     writer.writeheader()
    #     for pet in writing_pets:
    #         writer.writerow(pet.model_dump())

    pets = []

    with open("assets/pets.csv", "rt") as pets_file:
        reader = csv.DictReader(pets_file)
        for pet in reader:
            pets.append(Pet.model_validate(pet))

    for pet in pets:
        print(pet.name, pet.age, type(pet.age))


if __name__ == "__main__":
    main()
