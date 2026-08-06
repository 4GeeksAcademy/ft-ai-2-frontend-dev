# Frontend MVP Spec

## Pages & Routes

| Route | Page Component | Type | Description |
|-------|---------------|------|-------------|
| `/` | `HomePage` | Server | Map list with "New Map" action |
| `/maps/[mapId]` | `MapBuilderPage` | Client | Map builder with graph + node management |

All other routes return a 404.

---

## Component Tree

```
RootLayout                     # Server — app/layout.tsx
├── HomePage                   # Server — app/page.tsx
│   ├── MapList                # Client — list of maps
│   │   └── MapCard            # Client — single map card
│   └── CreateMapDialog        # Client — modal for new map
│
└── MapBuilderPage             # Client — app/maps/[mapId]/page.tsx
    ├── BuilderHeader          # Client — map name, actions
    ├── SearchBar              # Client — fuzzy search input
    ├── GraphPanel             # Client — reagraph container
    │   └── ConceptGraph       # Client — reagraph wrapper component
    ├── SidePanel              # Client — slides in/out on mobile
    │   ├── NodeList           # Client — scrollable list of nodes
    │   │   └── NodeListItem   # Client — single node row
    │   ├── NodeDetail         # Client — view/edit a single node
    │   └── CategoryManager    # Client — manage categories
    │       └── CategoryBadge  # Client — category tag
    └── AddNodeDialog          # Client — modal form for new node
```

### Server vs Client Breakdown

**Server Components:**
- `RootLayout` — No interactivity needed; fetches no dynamic data at render.
- `HomePage` — Fetches map list server-side, passes to client children.

**Client Components (`'use client'`):**
Everything under the map builder and map list interactions — because they need
state, effects, event handlers, and browser APIs (reagraph, fuse.js, etc.).

---

## Map List Page (`/`)

### Layout

```
┌──────────────────────────────────┐
│  Wordweb                    [+]  │  ← Header + New Map button
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │  📘 Spanish Vocabulary     │  │
│  │  42 words · 5 categories   │  │  ← MapCard
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  🧬 Biology Terms          │  │
│  │  18 words · 3 categories   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  🎨 Art History Concepts   │  │
│  │  7 words · 1 category      │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### States

| State | Behavior |
|-------|----------|
| **Loading** | Skeleton cards (3x gray pulsing rectangles) |
| **Empty** | "No maps yet. Create your first one!" + prominent CTA button |
| **Error** | "Couldn't load maps. [Try again]" button |
| **Populated** | Grid of MapCard components, 1-3 columns depending on viewport |

### Create Map Flow

1. Click "+" or "New Map" button
2. `CreateMapDialog` opens as a centered modal
3. User enters map name (required, max 100 chars)
4. User clicks "Create"
5. `POST /api/maps` → receives map with UUID
6. Navigate to `/maps/{uuid}`

---

## Map Builder Page (`/maps/[mapId]`)

### Layout (Desktop)

```
┌─────────────────────────────────────────────────────┐
│  ← Maps    Spanish Vocabulary    [Edit] [Delete]   │  ← BuilderHeader
├─────────────────────────────────────────────────────┤
│                           │  🔍 Search...            │  ← SearchBar
│                           ├─────────────────────────┤
│                           │  📋 Nodes (42)     [+]  │  ← SidePanel
│                           │                         │
│                           │  ┌───────────────────┐  │
│   Graph Panel             │  │ 📕 el libro       │  │
│   (reagraph clusters)     │  │ 📘 la casa        │  │  ← NodeList
│   ┌──────┐ ┌──────┐      │  │ 📗 el perro       │  │
│   │nouns │ │verbs │      │  │ 📙 el gato        │  │
│   │ ○ ○  │ │ ○ ○  │      │  │                   │  │
│   │ ○ ○  │ │ ○    │      │  │                   │  │
│   └──────┘ └──────┘      │  │                   │  │
│                           │  └───────────────────┘  │
│                           │                         │
│                           │  ┌───────────────────┐  │
│                           │  │ 🏷️ Categories [+] │  │  ← CategoryManager
│                           │  │                   │  │
│                           │  │ #nouns (22)       │  │
│                           │  │ #verbs (12)       │  │
│                           │  └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Layout (Mobile)

```
┌──────────────────────┐
│ ← Maps   Spanish ... │  ← BuilderHeader
├──────────────────────┤
│ 🔍 Search...         │  ← SearchBar
├──────────────────────┤
│                      │
│   Graph Panel        │  ← reagraph (full width)
│   (reagraph)         │
│                      │
├──────────────────────┤
│ [📋 Nodes] [🏷️ Cats]│  ← Tab bar (mobile)
├──────────────────────┤
│ 📕 el libro          │
│ 📘 la casa           │  ← Active tab content
│ 📗 el perro          │
└──────────────────────┘
```

### States

| State | Behavior |
|-------|----------|
| **Loading** | Full-page skeleton with pulsing graph placeholder |
| **Empty map** | Graph shows empty canvas + "Add your first word to get started" overlay |
| **Populated** | Graph renders nodes; side panel shows list |
| **Error** | "Couldn't load this map. It may have been deleted." + link back to home |
| **Not found** | 404 page with "Map not found" message |

---

## Components Detail

### ConceptGraph (reagraph wrapper)

**Props:**
```typescript
interface ConceptGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  onNodeClick: (nodeId: string) => void
  clusterAttribute: string  // e.g. "category" — maps to GraphNode.cluster
}
```

**Behavior:**
- Renders nodes clustered by their assigned category using reagraph's built-in
  clustering engine (`d3-force-cluster-3d` under the hood).
- Pass `clusterAttribute="category"` to `<GraphCanvas>` — this tells reagraph
  to group nodes by the `cluster` field on each `GraphNode`.
- Each reagraph cluster renders as a visually grouped blob of nodes with a
  category label. Clusters are laid out by the force-directed algorithm, so
  related nodes stay near each other on the canvas.
- Nodes without a category (`cluster` is `undefined`/empty) are left unclustered
  and float freely in the force layout.
- Colors are assigned to clusters via the reagraph theme's `cluster` styling.
- Clicking a node calls `onNodeClick` to show the detail panel.
- Right-click or tap-and-hold on empty space to deselect.
- Auto-layout: reagraph's force-directed layout handles all positioning —
  no manual positioning needed.
- Responsive: fills available container width/height.

### NodeList

**Props:**
```typescript
interface NodeListProps {
  nodes: Node[]
  searchQuery: string
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string) => void
  onAddNode: () => void
}
```

**Behavior:**
- Scrollable list of all nodes in the map
- Each item shows: name, definition preview (truncated), category badge
- Clicking an item selects it and shows `NodeDetail` panel
- Search query filters the list in real-time via fuse.js
- "+" button at top opens `AddNodeDialog`

### NodeDetail

**Props:**
```typescript
interface NodeDetailProps {
  node: Node
  categories: Category[]
  onUpdate: (nodeId: string, data: Partial<Node>) => void
  onDelete: (nodeId: string) => void
  onClose: () => void
}
```

**Behavior:**
- Shows full node info: name, definition, category
- Inline editing: click name or definition to edit directly
- Category dropdown to reassign
- Delete button with confirmation dialog
- Close button or click outside to dismiss

### CategoryManager

**Props:**
```typescript
interface CategoryManagerProps {
  categories: Category[]
  onCreate: (name: string) => void
  onRename: (categoryId: string, name: string) => void
  onDelete: (categoryId: string) => void
}
```

**Behavior:**
- Shows list of categories with node counts
- Click "+" to create a new category (inline text input)
- Click existing category to rename
- Delete button with confirmation — reassigned nodes' `category_id` to null on
  the backend, which removes them from the cluster on the graph
- Each category shows a color dot (auto-assigned from a palette)
- Any change (create, rename, delete) triggers a re-render of the graph — nodes
  smoothly animate into their new cluster positions

### SearchBar

**Props:**
```typescript
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
```

**Behavior:**
- Text input with search icon
- Debounced (300ms) before firing onChange
- Clear button (×) when value is non-empty
- Placeholder: "Search words..."

### CreateMapDialog / AddNodeDialog

Both follow the same pattern:
- Centered modal overlay with backdrop
- Form with validation
- Submit button + Cancel button
- On submit: call API, on success: update parent state, close dialog
- On cancel or Escape key: close without action

---

## Search Implementation

**Library:** fuse.js (client-side)

**Configuration:**
```typescript
const fuseOptions = {
  keys: ['name', 'definition'],
  threshold: 0.4,
  maxResults: 50,
}
```

**Behavior:**
- Search index rebuilt when nodes change
- Search results highlight matching text
- Empty search query shows all nodes
- No results state: "No words match your search"

---

## Styling Guidelines

- **Layout:** Flexbox + CSS Grid via Tailwind utility classes
- **Responsive breakpoints:**
  - Mobile: `< 768px` — single column, bottom tab bar, side panel as sheet
  - Tablet/Desktop: `≥ 768px` — side-by-side graph + panel
- **Graph panel:** Minimum 60% of viewport height on mobile, flexible on desktop
- **Colors:** Tailwind default palette; categories auto-assigned from a
  predefined set of 8 distinct colors
- **Dark mode:** Not an MVP requirement

---

## Error Handling

All client-side API calls follow this pattern:

1. Call the API endpoint
2. If success: update state / navigate
3. If network error: show toast "Connection error. Check your server."
4. If server error (4xx/5xx): show toast with error message from API response
5. If validation error: show inline error on the relevant form field

Use a lightweight notification/toast system (custom React context or a minimal
library) for non-blocking feedback.