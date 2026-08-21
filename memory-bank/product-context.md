# Citizen Weather Tracker API

Citizen Weather Tracker API is a prototype backend for a community project to track weather patterns over a county for use by scientists.

## Key Features

- Uploading weather data along with location data.
- Uploading images alongside the weather data (mocked up, bulk file storage will come later.)
- Downloading CSV files with queries to filter the data.

## Architecture

- FastAPI using SQLmodel for database storage, and `uv` for package management.
- Postgres DB hosted by supabase and connected to using a connection string and *not* their python package.

## Users

- Laypeople will be able to submit weather data and track favorite locations.
- Scientists will be able to administrate data, as well as export it as a csv.
