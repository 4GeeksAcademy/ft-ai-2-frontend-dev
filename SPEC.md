# Book App

## Development Conventions:

- This project is intended as a live example for adult students.
- Code should be clear and well-documented.
- The project should be done in sensible steps, and committed to the git repo for each step.

## Overview

Book App is a tool to let me track what books I own, what books I am loaning to friends, when I loaned the books to whom.

## Tech Stack

- NextJS application using the app router
- Tailwind CSS for styling
- libSQL database for long-term data storage

## NextJS Directory Structure

I'd like to keep all application source inside a `src/` directory, including the app router, structured like this:

- `./`: Project root
    - `src/`: Application source.
        - `app/`: The Next.js app router pages and layouts.
        - `components/`: A folder that contains all your components, and the CSS for them.
            - `component_name/`: The root of the component structure
                - `ComponentName.tsx`: This is the core component.
                - `ComponentName.css`: This is the CSS for the component.
                - `ComponentNaveVariant.tsx`: Variants of the components should be separate files (e.g. a horizontal card layout could be CardHorizontal.tsx)
        - `db/`: Database client, schema setup, and query helpers for libSQL.
        - `types.d.ts`: The types for the project

The `@/*` import alias maps to `src/*`, so a component can be imported as `@/components/card/Card`.

## Data types

### Friend
```ts
interface Friend {
    id: number;
    name: string;
    phone_number: string; // the number with all non-essential bits stripped out for easy formatting for tel:/ links
    email: string;
    books_borrowed: Loan[];
}
```

### Book
```ts
interface Book {
    id: number;
    title: string;
    description: string;
    cover_img: string;
    loan_history: Loan[];
}
```

### Loan
```ts
interface Loan {
    id: number;
    borrower: Friend;
    borrow_date: Date;
    returned_date: Date | null;
}
```

## Page structure:

- `/`: Home dashboard, shows current loans and has a panel for books that have been on loan for longer than 2 weeks.
    - `library/`: Show books in a sortable and filterable list
        - `[id]/`: Individual book page, contains details about the book and a borrowing history, as well as letting me loan a book to a friend.
        - `create_book/`: Page that lets me add a new book to the database.
    - `friends/`: Show friends in a sortable and filterable list
        - `[id]/`: Individual friends page, contains contact details and a borrowing history.
        - `create_friend/`: Page that lets me add a new friend to the database.
