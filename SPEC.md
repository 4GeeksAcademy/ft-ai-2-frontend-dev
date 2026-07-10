# World Cup CLI Tool

A simple Python command line tool to allow you to summarize data about world cup matches based on the csv data in `data/`.

## Tech stack

- Python 3.12
  - `csv` for data parsing and writing out reports.
  - `argparse` for parsing command line arguments.
  - `venv` for virtual environment.
- `pyyaml` for yaml reading and writing.
- `pydantic` for data models.
- Store packages using a `requirements.txt`.

## Features

- Get matches by team
- Get matches by stage
- Get win ratio between two teams
- Summarize match history between two teams
- Ability to output data in CSV, JSON, or YAML formats.
