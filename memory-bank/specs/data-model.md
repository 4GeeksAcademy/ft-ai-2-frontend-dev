# Data Model Spec

## User

```python
class User(BaseModel):
    id: int | None
    email: str
    # Auth will be added later

    weather_data: list["WeatherData"] # Weather data the user has submitted
    proj_owned: list["Project"] # Projects the user has created
    proj_followed: list["Project"] # Projects the user follows
```

## Weather Data

```python
class WeatherData(BaseModel):
    id: int | None
    user_id: int | None # fk to User relationship
    lat: float
    lon: float
    altitude: float | None # Altitude in meters
    temp: float | None # Temp in celsius
    windspeed: float | None # Windspeed in kph
    wind_dir: float | None # Wind direction in degrees
    pressure: float | None # Atmospheric pressure in kPa
    humidity: float | None

    user: User # The related user object
    projects: list["Project"] # Projects this data is part of

```

## Project

```python
class Project(BaseModel):
    id: int | None
    user_id: int | None # fk to User relationship
    title: str
    description: str

```
