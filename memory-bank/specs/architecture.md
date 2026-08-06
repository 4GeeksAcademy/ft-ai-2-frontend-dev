# MVP Architecture

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         NextJS Application               │    │
│  │                                          │    │
│  │  ┌───────────┐  ┌─────────────────────┐  │    │
│  │  │ Server    │  │  Client Components  │  │    │
│  │  │ Components│  │                     │  │    │
│  │  │ (RSC)     │  │  - Map Builder      │  │    │
│  │  │           │  │  - Graph View        │  │    │
│  │  │ - Map List│  │  - Node Forms        │  │    │
│  │  │ - Layout  │  │  - Search            │  │    │
│  │  └───────────┘  └─────────────────────┘  │    │
│  │                                                  │
│  │  ┌──────────────────────────────────────────┐    │
│  │  │  API Client Layer (fetch calls)          │    │
│  │  └──────────────────────────────────────────┘    │
│  └──────────────────────────────────────────┘    │
│                         │                          │
│                    HTTP (fetch)                    │
│                         │                          │
└─────────────────────────│─────────────────────────┘
                          │
┌─────────────────────────│─────────────────────────┐
│                  ▲      ▼                         │
│  ┌──────────────────────────────────────────┐    │
│  │         FastAPI Backend                   │    │
│  │                                          │    │
│  │  ┌────────────┐  ┌─────────────────────┐ │    │
│  │  │  Routes    │  │  Pydantic Models    │ │    │
│  │  │ (Routers)  │  │  (Validation)       │ │    │
│  │  └────────────┘  └─────────────────────┘ │    │
│  │                                          │    │
│  │  ┌─────────────────────────────────────┐ │    │
│  │  │  Service Layer (business logic)     │ │    │
│  │  └─────────────────────────────────────┘ │    │
│  │                                          │    │
│  │  ┌─────────────────────────────────────┐ │    │
│  │  │  TinyDB (JSON file storage)         │ │    │
│  │  └─────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend framework | NextJS 14+ (App Router) | SSR, routing, React |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS | Utility-first responsive design |
### Graph visualization
| Graph visualization | reagraph (force-directed with clustering) | Interactive concept map display with category-based clustering |
| Fuzzy search | fuse.js | Client-side node search |
| Backend framework | FastAPI | REST API server |
| Language | Python 3.11+ | Backend logic |
| Data storage | TinyDB | JSON-based document store |
| Serialization | Pydantic | Request/response validation |
| Package management | uv | Fast Python package installer and resolver |
| Project orchestration | Turborepo | Monorepo management |

---

## Project Structure (Monorepo)

```
wordweb/
├── apps/
│   ├── frontend/              # NextJS application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # Map list (home)
│   │   │   │   └── maps/
│   │   │   │       └── [mapId]/
│   │   │   │           └── page.tsx  # Map builder
│   │   │   ├── components/
│   │   │   │   ├── maps/             # Map list components
│   │   │   │   ├── builder/          # Map builder components
│   │   │   │   ├── graph/            # reagraph wrapper
│   │   │   │   ├── nodes/            # Node CRUD components
│   │   │   │   └── ui/               # Shared UI primitives
│   │   │   ├── lib/
│   │   │   │   ├── api.ts            # API client
│   │   │   │   └── types.ts          # Shared TypeScript types
│   │   │   └── hooks/                # Custom React hooks
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/               # FastAPI application
│       ├── app/
│       │   ├── main.py               # App entry + CORS config
│       │   ├── routers/
│       │   │   ├── maps.py           # /api/maps endpoints
│       │   │   └── nodes.py          # /api/maps/{id}/nodes
│       │   ├── models/
│       │   │   ├── map.py            # Map Pydantic models
│       │   │   └── node.py           # Node Pydantic models
│       │   ├── services/
│       │   │   ├── map_service.py    # Map business logic
│       │   │   └── node_service.py   # Node business logic
│       │   ├── database.py           # TinyDB setup + middleware
│       │   └── serializers.py        # UUID serializers
│       ├── data/
│       │   └── db.json               # TinyDB data file
│       ├── pyproject.toml            # uv project config + deps
│       └── uv.lock                   # Locked dependency versions
│
├── package.json               # Root workspace config (turborepo)
├── turbo.json
└── README.md
```

---

## API Endpoints

### Maps

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/maps` | List all maps |
| `POST` | `/api/maps` | Create a new map |
| `GET` | `/api/maps/{map_id}` | Get a single map with its nodes |
| `PUT` | `/api/maps/{map_id}` | Update map metadata (name) |
| `DELETE` | `/api/maps/{map_id}` | Delete a map and all its nodes |

### Nodes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/maps/{map_id}/nodes` | List all nodes in a map |
| `POST` | `/api/maps/{map_id}/nodes` | Create a new node in a map |
| `GET` | `/api/maps/{map_id}/nodes/{node_id}` | Get a single node |
| `PUT` | `/api/maps/{map_id}/nodes/{node_id}` | Update a node |
| `DELETE` | `/api/maps/{map_id}/nodes/{node_id}` | Delete a node |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/maps/{map_id}/categories` | List categories for a map |
| `POST` | `/api/maps/{map_id}/categories` | Create a category |
| `PUT` | `/api/maps/{map_id}/categories/{cat_id}` | Update a category |
| `DELETE` | `/api/maps/{map_id}/categories/{cat_id}` | Delete a category |

---

## Clustering Configuration

### reagraph GraphCanvas Setup

```tsx
<GraphCanvas
  nodes={graphNodes}
  edges={graphEdges}
  clusterAttribute="cluster"    // ← matches GraphNode.cluster field
  theme={wordwebTheme}           // ← custom theme with cluster styling
  layoutType="forceDirected2d"   // ← clustering requires force layout
  onNodeClick={(node) => onNodeClick(node.id)}
/>
```

**Key points:**
- `clusterAttribute="cluster"` tells reagraph to group nodes by the `cluster`
  field on each GraphNode. This uses `d3-force-cluster-3d` under the hood.
- Clustering only works with force-directed layouts (`forceDirected2d` is the
  default, which is what we use).
- The theme handles visual styling of clusters (stroke, label color).

### Theme Cluster Styling

```typescript
import { Theme } from 'reagraph';

const wordwebTheme: Theme = {
  // ...base theme settings...
  cluster: {
    stroke: '#4B5563',              // Gray-600 cluster outline
    label: {
      stroke: '#1F2937',            // Gray-800 label background
      color: '#F3F4F6',             // Gray-100 label text
    },
  },
};
```

Node colors are assigned client-side by mapping category names to a predefined
8-color palette:

```typescript
const CATEGORY_PALETTE: Record<string, string> = {
  nouns: '#EF4444',     // red
  verbs: '#3B82F6',     // blue
  adjectives: '#10B981', // emerald
  // ...dynamically assigned from a rotating palette for new categories
};
```

---

## CORS Configuration

Since the frontend (NextJS dev server) and backend (FastAPI) run on different
ports during development, CORS must be configured:

```python
# FastAPI main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS dev server
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)
```

In production, both frontend and backend will be served from the same origin,
so this can be tightened.

---

## Data Flow

### Reading a Map with Nodes

```
1. User navigates to /maps/{mapId}
2. NextJS server component calls GET /api/maps/{mapId}
3. FastAPI route handler:
   a. Receives map_id path parameter
   b. map_service.get_map(map_id) fetches map doc from TinyDB
   c. node_service.get_nodes(map_id) fetches all nodes for this map
   d. category_service.get_categories(map_id) fetches all categories
   e. Returns combined response with nodes + categories
4. NextJS renders initial page shell, hydrates client components
5. Client builds GraphNode[] from nodes and categories:
   - Each GraphNode gets `cluster` set to its category name
   - Nodes without a category have no `cluster` (float freely)
6. ConceptGraph renders <GraphCanvas clusterAttribute="cluster" ... />
   - reagraph uses d3-force-cluster-3d to group nodes by category
   - Cluster labels are rendered automatically by reagraph
```

### Creating a Node

```
1. User fills "Add Node" form in the builder
2. Client component validates form fields (client-side)
3. Client sends POST /api/maps/{mapId}/nodes with JSON body
4. FastAPI validates body against Pydantic model
5. node_service.create_node() inserts into TinyDB
6. Returns created node with generated UUID
7. Client adds the new node to the graph:
   - If the node has a category_id, its GraphNode.cluster is set to the
     category name → reagraph places it inside the corresponding cluster
   - If no category, the node appears unclustered in the force layout
```

### Updating a Node's Category

```
1. User changes a node's category via the NodeDetail panel
2. Client sends PUT /api/maps/{mapId}/nodes/{nodeId}
3. Backend updates the node's category_id
4. Client updates local state:
   - GraphNode.cluster changes to the new category name (or undefined)
   - reagraph smoothly animates the node to its new cluster position
```