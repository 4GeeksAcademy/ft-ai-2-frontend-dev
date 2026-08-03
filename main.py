import csv
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator
import matplotlib.pyplot as plt
import numpy as np

plt.style.use('_mpl-gallery')


class NEObject(BaseModel):
    model_config = ConfigDict(str_strip_whitespace = True)

    spkid: int
    full_name: str | None
    name: str | None
    diameter_km: float | None
    diameter_is_estimated: bool | None
    size_category: str | None
    albedo: float | None
    rot_per: float | None
    first_obs: datetime | None
    last_obs: datetime | None

    @field_validator('*', mode="before")
    @classmethod
    def blank_string(cls, value):
        if value == "":
            return None
        return value


near_earth_objects: NEObject = []


with open("input/near_earth_asteroids_2025.csv", "rt") as csvfile:
    # Within the with structure you have access to an object
    # that represents the file and lets you interact with it.
    reader = csv.DictReader(csvfile)
    for row in reader:
        near_earth_objects.append(NEObject.model_validate(row))

diameters: list[float] = []
albedos: list[float] = []

def lerp(v0, v1, t):
    return (1 - t) * v0 + t * v1

for obj in near_earth_objects:
    if obj.albedo:
        albedos.append(obj.albedo)
        diameters.append(obj.diameter_km)

fig, ax = plt.subplots()

ax.scatter(
    [(x / max(diameters)) * 10 for x in diameters],
    [x * 10 for x in albedos],
)
ax.set(
    xlim=(0, 10), xticks=np.arange(0, 10),
    ylim=(0, 10), yticks=np.arange(0, 10),
)

fig.savefig("output/figure.png")
