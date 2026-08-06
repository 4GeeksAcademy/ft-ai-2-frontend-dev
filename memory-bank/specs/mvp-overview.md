# MVP Overview

## Product

**Wordweb** — a concept mapping application for the browser. Instructors build
maps of concepts and vocabulary for students to explore.

## MVP Goal

A working, single-user web application that allows an instructor to:

1. Create and manage multiple concept maps.
2. Add, edit, and delete vocabulary nodes within a map.
3. Group nodes by category.
4. View the map as an interactive graph.
5. Search nodes by name (exact + fuzzy).

Everything beyond this scope is **post-MVP** and explicitly excluded.

---

## MVP Scope

### In Scope

| Feature | Description |
|---------|-------------|
| Map CRUD | Create, list, view, update, and delete concept maps |
| Node CRUD | Add, edit, delete vocabulary nodes inside a map |
| Category management | Create categories, assign nodes to categories |
| Graph visualization | Interactive graph view using `reagraph` with category-driven clustering |
| Fuzzy search | Search nodes by name across a map using `fuse.js` (client-side) |
| Fuzzy search | Search nodes by name across a map using `fuse.js` (client-side) |
| Mobile-first UI | All views usable on mobile and desktop |
| Single-user | No authentication, no multi-user — one local user |

### Explicitly Out of Scope (Post-MVP)

- User authentication and multi-user support
- Student/browsing view (separate from builder view)
- Collaboration or sharing
- Undo/redo
- Drag-and-drop node positioning
- Export/import maps
- History or versioning
- Real-time sync
- Image or file attachments on nodes

---

## User Stories

### Map Management

```
As an instructor
I want to create a new concept map
So that I can organize a set of vocabulary
```

```
As an instructor
I want to see a list of all my maps
So that I can choose which one to work on
```

```
As an instructor
I want to rename or delete a map
So that I can keep my workspace organized
```

### Node Management

```
As an instructor
I want to add a vocabulary word to a map
So that students can explore it
```

```
As an instructor
I want to edit a word's name or definition
So that I can correct or improve the content
```

```
As an instructor
I want to delete a word from a map
So that I can remove irrelevant or duplicate entries
```

### Categories

```
As an instructor
I want to create named categories
So that I can group related vocabulary
```

```
As an instructor
I want to assign a category to a node
So that related words are visually grouped
```

### Visualization & Search

```
As an instructor
I want to see the map as an interactive graph
So that I can understand relationships between concepts
```

```
As an instructor
I want to search for a word by name
So that I can quickly find it in a large map
```

---

## User Flow (Happy Path)

```
Home (Map List)
    │
    ├── Click "New Map" → Modal → Creates map → Opens Map Builder
    │
    └── Click existing map → Opens Map Builder

Map Builder
    ├── Graph view (reagraph) shows all nodes, clustered by category
    ├── Node list sidebar/panel shows all nodes as a list
    ├── Click "Add Node" → Form → Creates node → Appears on graph (in correct cluster)
    ├── Click node on graph → Panel with Edit/Delete actions
    ├── Assign category to node → Node animates into the corresponding cluster
    ├── Categories section → Create/rename/delete categories (graph updates live)
    └── Search bar → Filters nodes in real-time
```

---

## Non-Goals (Anti-Scope)

- The MVP will **not** have user accounts — all data is local to the single user.
- The MVP will **not** have separate "instructor" and "student" views — the
  builder is the only view.
- The MVP will **not** support custom node positioning — `reagraph` handles
  layout and clustering automatically.
- The MVP will **not** support manual collapse/expand of individual clusters on
  the graph — reagraph's force-directed clustering auto-groups by category, but
  toggling cluster visibility or drilling into a single cluster is post-MVP.