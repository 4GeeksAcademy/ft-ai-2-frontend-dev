# Helping LLMs understand APIs

This is a small, single-page React application written in typescript to demonstrate the end result of communicating with an LLM on how to use an API effectively.

## Tech Stack

- React with Typescript and React Compiler using `vite create@latest`
- Tailwind CSS for styling, using BEM CSS, CSS nesting and the Tailwind `@apply` directive to have clean readable CSS
- The dotlag.space library API, you can find the openapi docs here: [https://library.dotlag.space/openapi.json](https://library.dotlag.space/openapi.json)

## Project Layout

- `src/`: The core application code with a standard Vite React structure, with the following exceptions:
  - `components/`: A folder that contains all components, and their CSS.
    - `name/`: The root of the component structure
      - `Name.tsx`: This is the core component.
      - `Name.css`: This is the CSS for the component.
      - `NaveVariant.tsx`: This could be a potential variant (e.g. a horizontal card layout.)

## Components

- `BookCard`: A card displaying details about a `Book` object from the API
- `BookCreateForm`: A form allowing you to create a `Book` object
- `BookUpdateForm`: A form allowing you to update a `Book` object
- `BookDeleteForm`: A form allowing you to delete a `Book` object from the API
  - `DeleteConfirmModal`: A modal asking you if you really do want to delete a book from the API, allowing you to back out in case you change your mind.
