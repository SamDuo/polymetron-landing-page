# Implementation Plan: 3D Zoning Envelope + Deepblocks-Style Massing

## The Vision

Three-layer 3D building visualization per parcel showing:
1. **Zoning Envelope** (wireframe) — max buildable volume from zoning code (height, FAR, setbacks)
2. **Existing Building** (solid gray) — what's actually built today
3. **Proposed Massing** (solid accent) — what a developer could build

Like the NYC zoning diagrams + Deepblocks DEV, but rendered live on Mapbox with climate risk overlay.

---

## Task Type
- [x] Frontend (3D visualization, map interaction)
- [x] Backend (zoning computation, data pipeline)
- [x] Fullstack (end-to-end from data to visual)

---

## Technical Evaluation: Deepblocks + Mapbox MTS

### What Deepblocks Does
- **DEV**: Draw parcel on map, generate 3D massing + financial projections
- **Algorithms**: Scan properties using 8 years of zoning/development data across 300+ US cities
- Three products: DEV ($55/mo beta), ChatDB (demographic queries), Algorithms (canvassing)
- They use Mapbox Tiling Service to serve millions of parcels as vector tilesets

### What MTS Gives You
- Upload line-delimited GeoJSON (up to 20GB per source)
- Define "recipes" for zoom levels, attribute filtering, simplification
- MTS processes into vector tilesets served via Mapbox CDN
- API: `POST /tilesets/v1/sources/{username}/{id}` (upload), `POST /tilesets/v1/{tileset_id}/publish` (process)
- Rate limit: 2 publishes/minute, 100 source uploads/minute
- **Cost**: Paid plans required for production (free tier limited)

### Verdict: MTS is overkill for demo, essential for scale

| Stage | Approach | Why |
|-------|----------|-----|
| **Demo (now)** | GeoJSON directly via `map.addSource()` | Free, instant, ~30 parcels |
| **Pilot (6 mo)** | MTS for Atlanta parcels | 100K+ parcels need tiling |
| **Scale (12+ mo)** | MTS + custom tile pipeline | Multi-city, millions of parcels |

---

## Technical Solution: 3D Rendering

### Option A: Mapbox `fill-extrusion` (simplest)
- Already loaded, ~30 lines of JS
- Supports transparency via `fill-extrusion-opacity`
- **Cannot do wireframe** — edges are missing
- Good for solid buildings, bad for zoning envelope

### Option B: deck.gl `GeoJsonLayer` (recommended)
- Can load via CDN: `https://unpkg.com/deck.gl@9.1/dist.min.js`
- `wireframe: true` property — true edge rendering
- Per-feature RGBA transparency
- MapboxOverlay integrates with existing Mapbox map
- ~40 lines of JS

### Recommendation: **Hybrid**
- Use **Mapbox `fill-extrusion`** for existing buildings (simpler, better performance)
- Use **deck.gl `GeoJsonLayer`** for zoning envelope wireframe (unique visual)
- Use **Mapbox `fill-extrusion`** for proposed massing (solid color)

---

## Implementation Steps

### Step 1: Add deck.gl CDN + 3D Map Config
**Deliverable:** Map pitches to 55 degrees with 3D perspective when entering a zone

Add deck.gl via CDN and configure the map for 3D viewing:

```html
<script src="https://unpkg.com/deck.gl@9.1/dist.min.js"></script>
```

```javascript
// When user clicks a zone, fly to 3D view
map.flyTo({
  center: [zone.lon, zone.lat],
  zoom: 16.5,
  pitch: 55,
  bearing: -25,
  duration: 2000
});

// Enable anti-aliasing for clean 3D edges
// Set in map constructor: antialias: true
```

**Files:** index.html (add script tag), app.js (update map config + flyTo)

### Step 2: Create Demo Parcel Data
**Deliverable:** GeoJSON with 3-5 sample parcels per zone, each with building heights + zoning max

Create a `parcels-demo.js` file with hardcoded parcel data for Midtown Atlanta:

```javascript
const DEMO_PARCELS = {
  type: 'FeatureCollection',
  features: [
    // SPI-16 Core - 1100 Peachtree (proposed tower)
    {
      type: 'Feature',
      properties: {
        id: 'parcel-001',
        zone: 'spi16-core',
        address: '1100 Peachtree St NE',
        zoning_height_m: 190,    // 625 ft max (SPI-16 Core with SAP)
        existing_height_m: 0,     // vacant lot
        proposed_height_m: 150,   // proposed 50-story tower
        far_max: 25.0,
        far_existing: 0,
        setback_front_m: 0,       // 0 ft setback in Core
        setback_side_m: 1.5,
        type: 'vacant',
        risk_score: 72            // heat vulnerability
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3856, 33.7870], [-84.3850, 33.7870],
          [-84.3850, 33.7865], [-84.3856, 33.7865],
          [-84.3856, 33.7870]
        ]]
      }
    },
    // SPI-16 Core - existing 30-story building
    {
      type: 'Feature',
      properties: {
        id: 'parcel-002',
        zone: 'spi16-core',
        address: '1075 Peachtree St NE',
        zoning_height_m: 190,
        existing_height_m: 91,     // ~30 stories
        proposed_height_m: 190,    // could go to max
        far_max: 25.0,
        far_existing: 12.5,
        type: 'underbuilt',
        risk_score: 45
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3848, 33.7862], [-84.3842, 33.7862],
          [-84.3842, 33.7857], [-84.3848, 33.7857],
          [-84.3848, 33.7862]
        ]]
      }
    },
    // Midtown Garden - low-rise in high-potential zone
    {
      type: 'Feature',
      properties: {
        id: 'parcel-003',
        zone: 'midtown-garden',
        address: '725 Ponce de Leon Ave',
        zoning_height_m: 46,      // 150 ft max
        existing_height_m: 12,     // 4-story building
        proposed_height_m: 40,     // proposed 12-story
        far_max: 8.0,
        far_existing: 1.8,
        type: 'underbuilt',
        risk_score: 85            // high heat island
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3720, 33.7735], [-84.3714, 33.7735],
          [-84.3714, 33.7730], [-84.3720, 33.7730],
          [-84.3720, 33.7735]
        ]]
      }
    },
    // Transition Zone - adaptive reuse candidate
    {
      type: 'Feature',
      properties: {
        id: 'parcel-004',
        zone: 'transition',
        address: '887 West Peachtree St',
        zoning_height_m: 23,       // 75 ft max
        existing_height_m: 15,     // 5-story
        proposed_height_m: 22,
        far_max: 3.2,
        far_existing: 2.1,
        type: 'existing',
        risk_score: 60
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3880, 33.7810], [-84.3874, 33.7810],
          [-84.3874, 33.7805], [-84.3880, 33.7805],
          [-84.3880, 33.7810]
        ]]
      }
    },
    // BeltLine Eastside - new development
    {
      type: 'Feature',
      properties: {
        id: 'parcel-005',
        zone: 'beltline-east',
        address: '550 Somerset Terrace',
        zoning_height_m: 30,
        existing_height_m: 0,
        proposed_height_m: 28,
        far_max: 5.0,
        far_existing: 0,
        type: 'vacant',
        risk_score: 90            // flood + heat
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3635, 33.7680], [-84.3628, 33.7680],
          [-84.3628, 33.7675], [-84.3635, 33.7675],
          [-84.3635, 33.7680]
        ]]
      }
    }
  ]
};
```

**Files:** parcels-demo.js (new), index.html (add script tag)

### Step 3: Render 3D Layers on Map
**Deliverable:** Three visual layers — envelope (wireframe), existing (solid), proposed (accent)

```javascript
function init3DLayers() {
  // Layer 1: Zoning Envelope — transparent wireframe (max buildable volume)
  // Using deck.gl for wireframe capability
  const deckOverlay = new deck.MapboxOverlay({
    layers: [
      new deck.GeoJsonLayer({
        id: 'zoning-envelope',
        data: DEMO_PARCELS,
        extruded: true,
        wireframe: true,
        getElevation: f => f.properties.zoning_height_m,
        getFillColor: [79, 195, 247, 25],     // almost invisible fill
        getLineColor: [79, 195, 247, 160],    // cyan wireframe
        lineWidthMinPixels: 1
      })
    ]
  });
  map.addControl(deckOverlay);

  // Layer 2: Existing Buildings — solid gray
  map.addSource('existing-buildings', {
    type: 'geojson',
    data: {
      ...DEMO_PARCELS,
      features: DEMO_PARCELS.features.filter(f => f.properties.existing_height_m > 0)
    }
  });
  map.addLayer({
    id: 'existing-3d', type: 'fill-extrusion',
    source: 'existing-buildings',
    paint: {
      'fill-extrusion-color': '#78909C',
      'fill-extrusion-height': ['get', 'existing_height_m'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85
    }
  });

  // Layer 3: Proposed/Gap — semi-transparent accent
  map.addSource('proposed-buildings', {
    type: 'geojson',
    data: DEMO_PARCELS
  });
  map.addLayer({
    id: 'proposed-3d', type: 'fill-extrusion',
    source: 'proposed-buildings',
    paint: {
      'fill-extrusion-color': [
        'case',
        ['==', ['get', 'type'], 'vacant'], '#4ade80',    // green for vacant
        ['==', ['get', 'type'], 'underbuilt'], '#c0532c', // accent for underbuilt
        '#b8953a'                                          // amber for others
      ],
      'fill-extrusion-height': ['get', 'proposed_height_m'],
      'fill-extrusion-base': ['get', 'existing_height_m'],
      'fill-extrusion-opacity': 0.55
    }
  });
}
```

**Files:** app.js (add init3DLayers function, call on map load)

### Step 4: Interactive Parcel Click → Detail Panel
**Deliverable:** Click a parcel to see envelope vs existing vs proposed breakdown

When user clicks a 3D parcel:
- Highlight the parcel
- Show detail card in the dark panel with:

```
┌─────────────────────────────────────┐
│  1100 Peachtree St NE               │
│  SPI-16 Core | Vacant               │
│─────────────────────────────────────│
│                                     │
│  ZONING ENVELOPE                    │
│  ██████████████████████ 625 ft      │
│                                     │
│  PROPOSED BUILDING                  │
│  ████████████████░░░░░░ 492 ft      │
│                                     │
│  EXISTING STRUCTURE                 │
│  ░░░░░░░░░░░░░░░░░░░░░ 0 ft        │
│                                     │
│  BUILDABILITY GAP                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 133 ft     │
│  (21% unused development rights)    │
│                                     │
│  FAR: 0 / 25.0 (100% available)    │
│  Heat Risk: ●●●○○ Moderate          │
│                                     │
│  [Generate Feasibility Report]      │
└─────────────────────────────────────┘
```

**Files:** app.js (click handler + render), styles.css (bar chart styles)

### Step 5: Toggle Between 2D and 3D Views
**Deliverable:** Button on map to switch between flat (pitch: 0) and 3D (pitch: 55) views

```javascript
let is3D = false;
document.getElementById('btn-3d-toggle').addEventListener('click', () => {
  is3D = !is3D;
  map.easeTo({
    pitch: is3D ? 55 : 0,
    bearing: is3D ? -25 : 0,
    duration: 1000
  });
  // Toggle 3D layers visibility
  map.setLayoutProperty('existing-3d', 'visibility', is3D ? 'visible' : 'none');
  map.setLayoutProperty('proposed-3d', 'visibility', is3D ? 'visible' : 'none');
});
```

**Files:** index.html (add toggle button), app.js (toggle logic), styles.css (button styles)

### Step 6: Climate Risk Color Overlay on 3D Buildings
**Deliverable:** Buildings colored by heat vulnerability score instead of flat colors

```javascript
// Color proposed buildings by risk_score
'fill-extrusion-color': [
  'interpolate', ['linear'], ['get', 'risk_score'],
  0, '#4ade80',    // low risk = green
  50, '#b8953a',   // moderate = amber
  80, '#c0532c',   // high = accent red
  100, '#8b0000'   // extreme = dark red
]
```

Add a toggle: "Color by: Zoning Type | Risk Score | FAR Utilization"

**Files:** app.js (color toggle), index.html (toggle buttons)

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| index.html | Modify | Add deck.gl CDN, 3D toggle button, parcel detail markup |
| styles.css | Modify | Parcel detail card, bar chart, 3D toggle button styles |
| app.js | Modify | 3D map config, flyTo, layer init, parcel click handler |
| parcels-demo.js | Create | Demo parcel data with zoning/height/risk attributes |

---

## Priority Order

| Priority | Step | Time Est. | Impact |
|----------|------|-----------|--------|
| 1 | deck.gl CDN + 3D map config | 15 min | Enables everything |
| 2 | Demo parcel data | 20 min | Foundation for 3D |
| 3 | Render 3D layers | 30 min | The "wow" visual |
| 4 | Parcel click detail | 25 min | Investor story |
| 5 | 2D/3D toggle | 10 min | Polish |
| 6 | Climate risk colors | 15 min | Differentiator from Deepblocks |

Total: ~2 hours. Steps 1-3 (~1 hour) give you the visual demo.

---

## Deepblocks Competitive Positioning

| Feature | Deepblocks | Polymetron |
|---------|-----------|------------|
| 3D Massing | Yes (core product) | Building (this plan) |
| Financial Pro Forma | Yes ($55/mo) | Not yet (Phase 2) |
| Zoning Code Engine | 300+ US cities | Atlanta + 9 cities (RAG) |
| Climate Risk Overlay | No | **Yes (core differentiator)** |
| Heat Vulnerability | No | **Yes (ML models)** |
| Food Security | No | **Yes (AFCN data)** |
| Displacement Risk | No | **Yes (ownership duration)** |
| Intervention Simulation | No | **Yes (scenario engine)** |
| Business Model | SaaS ($55/mo) | **Consulting ($75K-200K/yr)** |

**Key insight:** Deepblocks shows what you CAN build. Polymetron shows what you SHOULD build — factoring in climate, community, and resilience. The 3D envelope is table stakes; the intelligence layer is the moat.

---

## MTS Integration Roadmap (Post-Demo)

### Phase 1: Demo (now) — Direct GeoJSON
```
DEMO_PARCELS → map.addSource('geojson') → fill-extrusion + deck.gl wireframe
5-10 parcels, ~5KB, instant load
```

### Phase 2: Atlanta Pilot (3-6 mo) — MTS
```
Regrid API → NDJSON → MTS upload → tileset recipe → vector tiles
~100K Fulton County parcels with zoning + risk attributes
Recipe: minzoom 10, maxzoom 16, filter by SPI-16 boundary
Cost: Mapbox paid plan (~$50/mo)
```

### Phase 3: Multi-City (6-24 mo) — MTS + Custom Pipeline
```
Multi-city parcel data → ETL pipeline → MTS batch upload → tilesets per metro
Incremental updates via changesets API
Recipe per city (different zoning code fields)
Cost: Mapbox enterprise ($500+/mo)
```

---

## Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| deck.gl CDN adds 200KB page weight | Lazy-load only when 3D is activated |
| Demo parcels look fake without real footprints | Use real parcel coordinates from Atlanta ArcGIS |
| No wireframe if deck.gl fails to load | Fallback to Mapbox fill-extrusion with low opacity |
| 3D view may be slow on low-end machines | Default to 2D, let user opt into 3D |
| MTS requires paid Mapbox plan | Free tier sufficient for demo; MTS only needed at scale |

---

## SESSION_ID
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
