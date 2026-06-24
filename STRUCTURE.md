# Project Structures

## React On Vite

React is very unopinionated about structure, but aiming for a structure like this will simplify imports down the line (and make it easier to find things.)

- `/`: Contains config files, application entry point (the file that runs to bootstrap the rest of the application)
    - `node_modules/`: This contains all the JS packages that are listed in your `package-lock.json`
    - `public/`: This contains static assets, things that aren't code.
    - `src/`: This contains the code that is your application!
        - *We stop with convention and move towards suggestion here!*
        - `assets/`: This is anything that is not code that you `import` into a file (for the most part)
        - `components/`: A folder that contains all your components, and the CSS for them.
            - `name/`: The root of the component structure
                - `Name.tsx`: This is the core component.
                - `Name.css`: This is the CSS for the component.
                - `NaveVariant.tsx`: This could be a potential variant (e.g. a horizontal card layout.)


## NextJS

NextJS is more opinionated!  To use the app router, you *must* follow the first part of this structure.

- `/`: Contains config files, application entry point (the file that runs to bootstrap the rest of the application)
    - `node_modules/`: This contains all the JS packages that are listed in your `package-lock.json`
    - `.next/`: This includes caching, should be listed in your `.gitignore`!
    - `public/`: This contains static assets, things that aren't code.
    - `app/`: This is the application if you are using the app router setup!
        - `page.tsx`: This is a page, it can be nested arbitrarily deep in a project, routing is done automagically.
        - `[slug]/page.tsx`: Slugs are dynamic routes (e.g. `/blog/[some_slug]/page.tsx` could be a page in a blog)
            - You can access slugs in a page using the `params` prop.
    - *We stop with convention and move towards suggestion here!*
    - `components/`: A folder that contains all your components, and the CSS for them.
        - `name/`: The root of the component structure
            - `Name.tsx`: This is the core component.
            - `Name.css`: This is the CSS for the component.
            - `NaveVariant.tsx`: This could be a potential variant (e.g. a horizontal card layout.)
