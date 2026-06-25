# Components

All reusable UI components live here. Each component gets its own folder so the
component and its styles stay together:

```
components/
  component_name/
    ComponentName.tsx        # the core component
    ComponentName.css        # styles for the component
    ComponentNameVariant.tsx # variants live in their own files
```

For example, a card with a horizontal layout variant would be:

```
components/
  card/
    Card.tsx
    Card.css
    CardHorizontal.tsx
```
