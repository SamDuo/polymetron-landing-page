# Implementation Plan: SmartBricks-Inspired UI + MCP/Data Integration

## Task Type
- [x] Frontend (UI/UX redesign inspired by SmartBricks patterns)
- [x] Backend (MCP servers + data API integration)
- [x] Fullstack (end-to-end feature additions)

---

## Technical Solution

Upgrade the Polymetron demo from a basic dashboard to a SmartBricks-quality platform with:
1. **News to Know** sidebar feed (RSS MCP for real estate/zoning news)
2. **Street View property images** (Google Maps Static API)
3. **SmartBricks-style property/zone cards** with score badges
4. **Real zoning polygons** from Atlanta ArcGIS Open Data
5. **Recent permits feed** from Atlanta Open Data building permits
6. **Enhanced dashboard layout** with metric ribbon + richer map interactions

All implemented as pure HTML/CSS/JS (no build step) to match current stack.

---

## Implementation Steps

### Step 1: Metric Ribbon (Above Map)
**Deliverable:** Horizontal stat bar between toolbar and map/panel split

Add a compact row of 4-5 key metrics visible at all times on Dashboard:
- "6 Subdistricts" | "625 ft Max Height" | "FAR 25.0" | "5 Climate Provisions" | "35K Sales"

```
HTML: <div class="metric-ribbon"> inside view-dashboard, above dash-split
CSS: display:flex, gap:16px, padding:12px 16px, bg:white, border-bottom, 
     each metric: small icon + number + label, font-size 0.78rem
```

**Files:** index.html (add HTML), styles.css (add .metric-ribbon)

### Step 2: News to Know Panel
**Deliverable:** Collapsible news sidebar on the right edge of dashboard

Add a "News to Know" slide-out panel accessible via a button in the toolbar:
- Shows 5-8 recent RE/zoning headlines
- Each item: source icon, headline (link), date, 1-line summary
- Data source: hardcoded for demo (real integration via RSS MCP later)

Demo data (pre-cached headlines):
```javascript
const NEWS = [
  { source: "Bisnow", date: "Mar 31", title: "Midtown Atlanta Sees Record Mixed-Use Permits in Q1 2026", url: "#" },
  { source: "AJC", date: "Mar 30", title: "Atlanta Cool Roof Ordinance Takes Effect — What Developers Need to Know", url: "#" },
  { source: "CoStar", date: "Mar 29", title: "BeltLine Eastside Trail Corridor: Rents Up 18% YoY", url: "#" },
  { source: "City of Atlanta", date: "Mar 28", title: "Planning Commission Approves SPI-16 Amendment Package", url: "#" },
  { source: "GlobeSt", date: "Mar 27", title: "Fulton County Assessments Lag Market by 15% — Opportunity or Risk?", url: "#" },
];
```

```
HTML: <div class="news-panel"> with toggle button in toolbar
CSS: fixed right panel, width 340px, slide-in animation, z-index 200
JS: toggle visibility, render news items
```

**Files:** index.html (add panel HTML + toolbar button), styles.css (panel styles), app.js (toggle + render)

### Step 3: Street View Thumbnail in Zone Detail
**Deliverable:** Google Street View image when a zone is selected

When user clicks a zone marker, show a Street View thumbnail at the top of the detail panel:
- Use Google Street View Static API: `https://maps.googleapis.com/maps/api/streetview?size=400x200&location={lat},{lon}&key={KEY}`
- Fallback: show a styled placeholder with the zone color if no API key
- For demo: use static images or the free embed (no API key needed for embed iframe)

```
HTML: <div class="streetview-wrap"> inside panel-zone, above zone-name
CSS: width:100%, height:160px, border-radius:10px, overflow:hidden, object-fit:cover
JS: On selectZone(), set img src to streetview URL or embed iframe
```

Demo approach (no API key needed):
```html
<iframe src="https://www.google.com/maps/embed/v1/streetview?location={lat},{lon}&key=..." 
        width="100%" height="160" style="border:0;border-radius:10px"></iframe>
```

Alternative (free, no key): Use Mapbox Static API with the existing token:
```
https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/{lon},{lat},15,0/400x200@2x?access_token={TOKEN}
```

**Files:** index.html (add container), styles.css (streetview styles), app.js (update selectZone)

### Step 4: SmartBricks-Style Zone Cards
**Deliverable:** Property card design with score badge, replacing plain stat boxes

Redesign the zone Overview tab to use SmartBricks-style cards:
- Large zone card at top with: name, score badge (circular, colored), subdistrict tag
- Below: key metrics in 2x3 grid with icons
- Each metric card: subtle gradient background, left icon, value + label

```
Card Layout:
┌──────────────────────────────────────┐
│ [Satellite img]                      │
│ ┌────────┐                           │
│ │  85    │  SPI-16 Core              │
│ │ Score  │  Core Subdistrict         │
│ └────────┘  [Heat Island] chip       │
├──────────────────────────────────────┤
│ ↕ 625 ft    ▦ FAR 25.0   ⏱ 18-24mo │
│ $ $350-450  🏗 High       🅿 Reduced │
└──────────────────────────────────────┘
```

**Files:** styles.css (new card classes), app.js (update selectZone rendering)

### Step 5: Real Zoning Polygons from Atlanta ArcGIS
**Deliverable:** Actual zoning district boundaries on the Mapbox map

Query Atlanta's public ArcGIS Feature Service for SPI-16 zoning boundaries:
- Endpoint: `https://dpcd-coaplangis.opendata.arcgis.com/` (find the zoning layer)
- Fetch GeoJSON via: `{service_url}/query?where=1=1&outFields=*&f=geojson&geometry={bbox}`
- Add as a Mapbox fill layer with semi-transparent zone colors
- Fallback: pre-download the GeoJSON and bundle as a static file

```javascript
// On map load, add zoning source
map.addSource('zoning', { type: 'geojson', data: 'zoning-spi16.geojson' });
map.addLayer({
  id: 'zoning-fill', type: 'fill', source: 'zoning',
  paint: { 'fill-color': ['match', ['get', 'ZONE_'], ...colorMap], 'fill-opacity': 0.15 }
});
map.addLayer({
  id: 'zoning-line', type: 'line', source: 'zoning',
  paint: { 'line-color': '#1b3a2d', 'line-width': 1.5, 'line-opacity': 0.4 }
});
```

**Files:** app.js (add layer on map load), zoning-spi16.geojson (new file, pre-downloaded)

### Step 6: Recent Permits Feed
**Deliverable:** "Development Activity" section in dashboard showing recent permits

Add a section below the metric ribbon or as a tab showing recent building permits:
- Data source: Atlanta Open Data (ArcGIS) — building permits 2019-2024
- For demo: pre-cache 8-10 recent Midtown permits as static data

```javascript
const RECENT_PERMITS = [
  { address: "1100 Peachtree St NE", type: "New Construction", status: "Issued", date: "2024-11", sqft: "450,000", stories: 32 },
  { address: "887 West Peachtree St", type: "Renovation", status: "Under Review", date: "2024-09", sqft: "28,000", stories: 4 },
  // ... 6 more
];
```

Display as a compact table or card list with status badges (Issued=green, Under Review=amber, Pending=gray).

**Files:** index.html (add permits section), styles.css (permit card styles), app.js (render permits)

### Step 7: Map Layer Controls
**Deliverable:** Floating control panel on the map for toggling data layers

Add a small floating panel in the top-right of the map with toggle switches:
- "Zoning Boundaries" (toggle zoning-fill layer)
- "Heat Vulnerability" (toggle HVI choropleth from atlanta-tracts.geojson)
- "Development Activity" (toggle permit markers)
- "Transit / MARTA" (toggle transit layer)

```
HTML: <div class="map-controls"> inside map-wrap
CSS: position:absolute, top:12px, right:12px, bg:white, rounded, shadow
JS: toggle map layer visibility on switch change
```

**Files:** index.html (add controls HTML), styles.css (control panel styles), app.js (layer toggle logic)

### Step 8: Enhanced Map Legend
**Deliverable:** Compact legend in bottom-left of map

Show zone marker colors with names, and any active layer legend (HVI scale, zoning colors):

```
┌─────────────────────┐
│ ● SPI-16 Core       │
│ ● Midtown Village   │
│ ● Midtown Garden    │
│ ● Transition        │
│ ● Georgia Tech      │
│ ● BeltLine Eastside │
└─────────────────────┘
```

**Files:** index.html (legend HTML), styles.css (legend styles)

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| index.html | Modify | Add metric ribbon, news panel, streetview container, permits section, map controls, legend |
| styles.css | Modify | Add news panel, metric ribbon, property card, map control, legend, permit card styles |
| app.js | Modify | Add news toggle, streetview rendering, permit rendering, layer controls, legend |
| zoning-spi16.geojson | Create | Pre-downloaded zoning boundaries from Atlanta ArcGIS |

---

## Priority Order (for demo)

| Priority | Step | Time Est. | Impact |
|----------|------|-----------|--------|
| 1 | Metric Ribbon | 20 min | Immediate data density |
| 2 | News to Know Panel | 30 min | SmartBricks parity |
| 3 | Street View Thumbnail | 20 min | Visual property context |
| 4 | SmartBricks-Style Cards | 30 min | Professional card design |
| 5 | Map Legend | 15 min | Investor clarity |
| 6 | Map Layer Controls | 25 min | Interactive depth |
| 7 | Recent Permits Feed | 25 min | Real data signal |
| 8 | Real Zoning Polygons | 40 min | Geographic precision |

Total: ~3.5 hours for all 8 steps. Steps 1-5 (~2 hours) deliver 80% of the visual impact.

---

## MCP Integration Roadmap (Post-Demo)

### Phase 1: Free Data (This Week)
| Integration | MCP/API | Action |
|-------------|---------|--------|
| Zoning polygons | Atlanta ArcGIS REST API | Query + cache GeoJSON |
| Building permits | Atlanta Open Data ArcGIS | Query recent permits by location |
| News feeds | RSS MCP (mcp-rss-aggregator) | Subscribe to Bisnow ATL, AJC RE, CoStar |
| Site scraping | Puppeteer MCP | Scrape Accela for active permits |

### Phase 2: Paid Data ($95-200/mo)
| Integration | API | Action |
|-------------|-----|--------|
| Property records | ATTOM API ($95/mo) | Sales history, ownership, valuations |
| Street View | Google Maps API (~$7/1K) | Property imagery by address |
| Parcel boundaries | Regrid API (free tier) | Parcel outlines on map |

### Phase 3: Scale (Post-Raise)
| Integration | API | Action |
|-------------|-----|--------|
| Nationwide parcels | Regrid Enterprise (~$80K/yr) | 155M parcels |
| AI-enriched permits | Shovels.ai | Contractor profiles, permit intelligence |
| Property comps | BatchData ($0.01/call) | Pay-per-call supplemental data |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| Google Street View API key required | Use Mapbox Satellite Static API (token already exists) |
| ArcGIS query may be slow/large | Pre-download and bundle as static GeoJSON |
| News panel clutters dashboard on small screens | Make it a slide-out that hides by default |
| Too many map layers slows rendering | Lazy-load layers only when toggled on |
| No Node.js for MCP servers | MCP integration is post-demo; demo uses pre-cached data |

---

## Design References

- **SmartBricks**: Property cards with score badges, city discovery grid, 4-step workflow, GenAI advisor
- **Algoma.co**: Sequential analysis panels, dark sidebar, tabbed zone detail
- **TestFit.io**: Buildability gauge, permitted vs feasible comparison
- **Revalo.io**: Multi-layer map controls, parcel-level detail

---

## SESSION_ID
- CODEX_SESSION: N/A (no external model backend available)
- GEMINI_SESSION: N/A (no external model backend available)
