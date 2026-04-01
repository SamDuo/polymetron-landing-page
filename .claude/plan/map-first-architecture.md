# Implementation Plan v3: Map-First Single-View Architecture

## Core Principle

**The map IS the product. Everything else is context.**

No pages. No tabs. No routing. One full-screen map with panels that slide in when needed and disappear when done. The map never reloads, never loses state.

---

## Architecture: One Map + Toolbar + Sliding Panels

```
+----------------------------------------------------------+
|  POLYMETRON   [Search any address...]   [Filters] [Brief] |
|               [Layers] [3D]                               |
+----------------------------------------------------------+
|                                                           |
|                        MAP                                |
|                    (full screen)                           |
|                    (always mounted)                        |
|                    (never reloads)                         |
|                                                           |
|        [285K sf]    [450K sf]                             |
|                  [42K sf]                                  |
|            [9K sf]        [38K sf]                         |
|                                                           |
+----------------------------------------------------------+
```

No default panel. The map speaks for itself. Panels appear only on interaction.

---

## Toolbar (fixed top bar)

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D]|
+----------------------------------------------------------+
```

| Button | Behavior |
|--------|----------|
| Search | Expands into autocomplete input. Results appear as markers. Select address -> panel slides in with property detail. |
| Filters | Dropdown panel below toolbar. Sliders for height, FAR, lot size. Toggles for type, risk, variance. Updates markers in real-time. |
| Brief | Opens left panel with market intelligence for current map area. Changes to site intel when a parcel is selected. |
| Layers | Dropdown with toggle switches: heat vulnerability, permits, transit, zoning boundaries, satellite. |
| 3D | Toggles pitch (0 to 55 degrees). Shows zoning envelope wireframes when active. |

---

## Map States

### State 1: Default (zoomed out, district clusters)

When app first loads, map shows Atlanta metro with clustered markers per district:

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D]|
+----------------------------------------------------------+
|                                                           |
|                                                           |
|       +------------------+                                |
|       | MIDTOWN SPI-16   |                                |
|       | 47 permits       |                                |
|       | $385/sqft        |                                |
|       +------------------+                                |
|                                                           |
|                   +------------------+                    |
|                   | OLD FOURTH WARD  |                    |
|                   | 23 permits       |                    |
|                   | $310/sqft        |                    |
|                   +------------------+                    |
|                                                           |
|   +------------------+                                    |
|   | WESTSIDE         |    +------------------+            |
|   | 58 permits       |    | BUCKHEAD         |            |
|   | $275/sqft        |    | 31 permits       |            |
|   +------------------+    | $420/sqft        |            |
|                           +------------------+            |
|                                                           |
+----------------------------------------------------------+
```

These are Mapbox cluster markers. Click one or zoom in -> clusters break into individual parcel markers.

### State 2: Zoomed into district (individual markers)

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D]|
+----------------------------------------------------------+
|                                                           |
|           Midtown SPI-16                                  |
|                                                           |
|        +--------+    +--------+                           |
|        | 285K sf|    | 450K sf|                           |
|        +---+----+    +---+----+                           |
|            .             .                                |
|                                                           |
|        +--------+                                         |
|        | 42K sf |    +--------+                           |
|        +---+----+    | 9K sf  |                           |
|            .         +---+----+                           |
|                          .                                |
|                                        +--------+        |
|                                        | 38K sf |        |
|                                        +---+----+        |
|                                            .              |
+----------------------------------------------------------+
```

Markers show buildable sqft. Color-coded:
- Green marker = vacant (full build opportunity)
- Orange marker = underbuilt (partial opportunity)
- Gray marker = existing (near max capacity)

### State 3: Parcel selected (panel slides in)

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D]|
+----------------------------------------------------------+
|  +--------------------+                                   |
|  | [x]                |                                   |
|  | [Street View]      |       MAP                        |
|  | [Satellite]        |   (zoomed to parcel,              |
|  | +--------------+   |    boundary highlighted,          |
|  | | (photo)      |   |    nearby markers visible)        |
|  | +--------------+   |                                   |
|  |                    |                                   |
|  | 1075 Peachtree     |                                   |
|  | SPI-16 Core        |                                   |
|  | 0.52 ac            |                                   |
|  |                    |                                   |
|  | +------+------+    |                                   |
|  | |625 ft|25 FAR|    |                                   |
|  | +------+------+    |                                   |
|  | |285K  | NO   |    |                                   |
|  | |bld sf|varnce|    |                                   |
|  | +------+------+    |                                   |
|  |                    |                                   |
|  | WHAT YOU CAN BUILD |                                   |
|  | 50-story mixed-use |                                   |
|  | tower by right.    |                                   |
|  | 50% density unused.|                                   |
|  | Est: $100M-$128M   |                                   |
|  |                    |                                   |
|  | DEAL CHECKS        |                                   |
|  | [check] By right   |                                   |
|  | [check] MARTA near |                                   |
|  | [check] No flood   |                                   |
|  | [warn] Cool roof   |                                   |
|  | [warn] Heat: Med   |                                   |
|  | [warn] 3 permits   |                                   |
|  |                    |                                   |
|  | FACTS              |                                   |
|  | Owner  Peachtree   |                                   |
|  | Built  1985        |                                   |
|  | Lot    0.52 ac     |                                   |
|  | Zoning SPI-16-SA1  |                                   |
|  |                    |                                   |
|  | [Save Site]        |                                   |
|  | [GENERATE REPORT]  |                                   |
|  +--------------------+                                   |
+----------------------------------------------------------+
```

Panel width: 380px on desktop. Slides in from left with Framer Motion.
Close button [x] dismisses panel, map returns to previous state.

### State 4: Brief open (left panel, different content)

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief*] [Layers] [3D]|
+----------------------------------------------------------+
|  +--------------------+                                   |
|  | [x]                |                                   |
|  |                    |       MAP                        |
|  | INTELLIGENCE BRIEF |   (shows district                 |
|  | Midtown SPI-16     |    boundary outline)              |
|  | Apr 1, 2026        |                                   |
|  | . Zoning Analyst   |                                   |
|  |                    |                                   |
|  | SUMMARY            |                                   |
|  | SPI-16 is at a     |                                   |
|  | development        |                                   |
|  | inflection point.  |                                   |
|  | Mar 28 amendment   |                                   |
|  | reduced setbacks...|                                   |
|  |                    |                                   |
|  | ALERTS             |                                   |
|  | [!] SPI-16 amend   |                                   |
|  | [~] Cool roof      |                                   |
|  | [+] BeltLine +23%  |                                   |
|  |                    |                                   |
|  | ACTIONS            |                                   |
|  | 1. Review setbacks |                                   |
|  | 2. Model cool roof |                                   |
|  | 3. Eval BeltLine   |                                   |
|  |                    |                                   |
|  | NEWS               |                                   |
|  | Bisnow 2h ...      |                                   |
|  | AJC 5h ...         |                                   |
|  | CoStar 1d ...      |                                   |
|  |                    |                                   |
|  | [Export PDF]        |                                   |
|  | [Ask agent...]     |                                   |
|  +--------------------+                                   |
+----------------------------------------------------------+
```

Brief button in toolbar gets active indicator (*) when panel is open.
If a parcel was selected before clicking Brief, the brief shows site-specific intelligence. Otherwise shows area-level.

### State 5: 3D mode active

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D*]|
+----------------------------------------------------------+
|                                                           |
|                  (map pitched to 55 degrees)              |
|                                                           |
|              +-- -- -- -- --+                             |
|              |  wireframe   |                             |
|              |  envelope    |                             |
|              |              |                             |
|              | +----------+ |                             |
|              | | proposed | |                             |
|              | |          | |                             |
|              | +----------+ |                             |
|              | | existing | |                             |
|              | |          | |                             |
|              +--+----------+-+                            |
|                                                           |
|                   +----------+                            |
|                   | LAYERS   |                            |
|                   | Envelope |                            |
|                   | Existing |                            |
|                   | Proposed |                            |
|                   +----------+                            |
|                                                           |
+----------------------------------------------------------+
```

3D button toggles:
- Map pitch: 0 to 55 degrees (animated)
- deck.gl wireframe envelope layers: visible/hidden
- Mapbox fill-extrusion layers: visible/hidden
- Bearing shifts to -25 for depth perspective

### State 6: Filters dropdown

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters*] [Brief] [Layers] [3D]|
+----------------------------+                              |
|                            |                              |
|  Height   [0] ------- [625]|       MAP                   |
|  FAR      [0] ------- [25] |   (markers update           |
|  Lot size [0] ------- [5ac]|    in real-time              |
|                            |    as filters change)        |
|  Type                      |                              |
|  [ ] Vacant                |                              |
|  [ ] Underbuilt            |                              |
|  [ ] Existing              |                              |
|                            |                              |
|  Risk                      |                              |
|  [ ] Low [ ] Med [ ] High  |                              |
|                            |                              |
|  [x] No variance needed    |                              |
|                            |                              |
|  5 of 47 sites match       |                              |
|  [Apply] [Reset]           |                              |
+----------------------------+                              |
|                                                           |
+----------------------------------------------------------+
```

Filters drop down from toolbar. Map markers filter in real-time as sliders move. Shows count of matching sites. Click outside or press Apply to close.

### State 7: Layers dropdown

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...] [Filters] [Brief] [Layers*] [3D] |
+----------------------------------------------+           |
|                                              |            |
|                MAP                   +-------+------+     |
|                                      | LAYERS       |     |
|                                      |              |     |
|                                      | [x] Markers  |     |
|                                      | [ ] Heat map |     |
|                                      | [ ] Permits  |     |
|                                      | [ ] Transit  |     |
|                                      | [ ] Zoning   |     |
|                                      | [ ] Satellite|     |
|                                      +--------------+     |
|                                                           |
+----------------------------------------------------------+
```

Small dropdown panel from the Layers button. Toggle switches add/remove map layers. Heat map uses atlanta-tracts.geojson choropleth. Permits shows recent building permits as markers. Zoning shows district boundaries.

### State 8: Search expanded

```
+----------------------------------------------------------+
|  POLYMETRON   [1075 Peachtree St N... x]  [Filters] ...   |
|               +---------------------------+               |
|               | 1075 Peachtree St NE,     |               |
|               | Atlanta, GA 30309         |               |
|               +---------------------------+               |
|               | 1075 Peachtree Walk NE    |               |
|               +---------------------------+               |
|               | 1075 Peachtree Dunwoody   |               |
|               +---------------------------+               |
|                                                           |
|                        MAP                                |
|                                                           |
+----------------------------------------------------------+
```

Google Places Autocomplete dropdown. Select an address -> map flies to it -> property detail panel slides in.

### State 9: Compare mode (2+ saved sites)

When user has saved 2+ sites, a floating "Compare" pill appears at bottom:

```
+----------------------------------------------------------+
|  POLYMETRON   [Search...]   [Filters] [Brief] [Layers] [3D]|
+----------------------------------------------------------+
|                                                           |
|                        MAP                                |
|               (shows all saved parcels                    |
|                highlighted)                               |
|                                                           |
|  +----------------------------------------------------+  |
|  | COMPARE (3 sites)                              [x]  |  |
|  |                                                     |  |
|  |       1075       1100       725                     |  |
|  |       Peachtree  Peachtree  Ponce                   |  |
|  |                                                     |  |
|  | Ht    625 ft     625 ft     150 ft                  |  |
|  | FAR   25.0       25.0       8.0                     |  |
|  | Build 285K sf    450K sf    42K sf                  |  |
|  | Cost  $100-128M  $158-203M  $15-19M                |  |
|  | Var?  No         No         No                      |  |
|  | Heat  Moderate   Moderate   HIGH                    |  |
|  | Type  Underbuilt Vacant     Underbuilt              |  |
|  |                                                     |  |
|  | [GENERATE COMPARISON REPORT]                        |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

Compare panel slides up from bottom as a wider panel (glassmorphism over map). Map adjusts to show all saved parcels in view.

---

## Mobile Layout (< 768px)

Same architecture, different panel positions:

```
+---------------------------+
|  POLYMETRON  [Search] [...] |
+---------------------------+
|                           |
|         MAP               |
|     (full screen)         |
|                           |
|                           |
+---------------------------+
|  --- drag handle ---      |
|  (bottom sheet)           |
|  Snaps to: peek/half/full |
|                           |
|  Content: same as left    |
|  panel on desktop         |
+---------------------------+
```

- Property detail: bottom sheet slides up
- Brief: bottom sheet slides up
- Filters: bottom sheet slides up
- Compare: bottom sheet slides up (full height)
- 3D/Layers: toggle buttons stay in toolbar

---

## Panel Transitions (Framer Motion)

| Trigger | Animation |
|---------|-----------|
| Click marker | Left panel slides in from left (300ms ease-out) |
| Close panel [x] | Panel slides out to left (200ms ease-in) |
| Click Brief | If panel open: cross-fade content. If closed: slide in. |
| Toggle 3D | Map pitch animates 0 to 55 (1000ms ease-in-out). Buildings grow from ground. |
| Open filters | Dropdown fades in + slides down (200ms) |
| Open compare | Bottom panel slides up (300ms spring) |
| Zoom into cluster | Cluster marker expands into individual markers (Mapbox native) |
| Save site | Marker pulses briefly. Floating pill appears at bottom. |

---

## Component Tree

```
App
  +-- Toolbar
  |     +-- Logo
  |     +-- SearchBar (Google Places Autocomplete)
  |     +-- FilterButton -> FilterDropdown
  |     +-- BriefButton (toggles panel)
  |     +-- LayersButton -> LayersDropdown
  |     +-- ThreeDButton (toggles pitch + envelopes)
  |
  +-- MapContainer (always mounted, never unmounts)
  |     +-- MapboxMap (react-map-gl)
  |     +-- DeckGLOverlay (wireframe envelopes, visible when 3D on)
  |     +-- ClusterMarkers (district-level, zoom < 13)
  |     +-- ParcelMarkers (individual, zoom >= 13)
  |     +-- HeatLayer (toggle via Layers)
  |     +-- ZoningLayer (toggle via Layers)
  |     +-- PermitLayer (toggle via Layers)
  |
  +-- LeftPanel (AnimatePresence, slides in/out)
  |     +-- PropertyDetail (when parcel selected)
  |     |     +-- PhotoHero (Street View + Satellite tabs)
  |     |     +-- MetricBar (height, FAR, buildable sf, variance)
  |     |     +-- WhatYouCanBuild (plain language summary)
  |     |     +-- DealChecks (green checks, amber warnings)
  |     |     +-- PropertyFacts (owner, built, lot, zoning)
  |     |     +-- Actions (Save, Report, View 3D)
  |     |
  |     +-- BriefPanel (when Brief button active)
  |           +-- AreaBrief (no parcel selected)
  |           |     +-- Summary
  |           |     +-- AlertCards
  |           |     +-- RecommendedActions
  |           |     +-- NewsFeed
  |           |
  |           +-- SiteBrief (parcel selected)
  |                 +-- SiteAssessment
  |                 +-- DealChecks
  |                 +-- NearbyActivity
  |                 +-- AreaNews
  |
  +-- ComparePanel (slides up from bottom when 2+ saved)
  |     +-- SiteColumns
  |     +-- MetricRows
  |     +-- GenerateButton
  |
  +-- SavedPill (floating, bottom center, shows count)
  |     +-- "3 sites saved [Compare]"
  |
  +-- BottomSheet (mobile only, replaces LeftPanel)
```

---

## Data Flow

```
User action
    |
    +-- Click marker on map
    |   -> selectParcel(parcelId)
    |   -> map.flyTo(parcel coordinates)
    |   -> LeftPanel opens with PropertyDetail
    |   -> fetch Street View image
    |   -> if Brief was open, switch to SiteBrief
    |
    +-- Type in search bar
    |   -> Google Places Autocomplete
    |   -> select address
    |   -> geocode to lat/lng
    |   -> map.flyTo(coordinates)
    |   -> find nearest parcel or create ad-hoc
    |   -> LeftPanel opens with PropertyDetail
    |
    +-- Click Brief button
    |   -> if parcel selected: show SiteBrief
    |   -> if no parcel: show AreaBrief for current map bounds
    |   -> LeftPanel opens with BriefPanel
    |
    +-- Adjust filter slider
    |   -> filter DEMO_PARCELS array
    |   -> update marker visibility on map (real-time)
    |   -> show count "5 of 47 match"
    |
    +-- Toggle 3D
    |   -> map.easeTo({ pitch: 55, bearing: -25 })
    |   -> deckOverlay.setProps({ layers: [envelope, existing, proposed] })
    |
    +-- Toggle layer
    |   -> map.setLayoutProperty(layerId, 'visibility', on/off)
    |
    +-- Click "Save Site"
    |   -> add to savedSites array
    |   -> SavedPill appears/updates count
    |   -> marker gets saved indicator
    |
    +-- Click "Compare" on SavedPill
        -> ComparePanel slides up from bottom
        -> map.fitBounds(all saved parcel bounds)
```

---

## Design System

### Colors

```css
--bg: #ffffff
--bg-warm: #f6f4f0
--ink: #1a1714
--muted: #7a7267
--brand: #1b3a2d
--accent: #c0532c
--green: #00c853
--amber: #ff9100
--red: #ff1744
--line: #f0f0f0
```

### Glassmorphism (panels over map)

```css
/* Tailwind */
className="backdrop-blur-xl backdrop-saturate-150 bg-white/90 border border-white/20 rounded-2xl shadow-lg"
```

Use for: left panel, filter dropdown, layers dropdown, compare panel, saved pill.

### Typography

```
--f-display: 'Instrument Serif', serif  (big numbers, panel titles)
--f-body: 'Manrope', sans-serif        (everything else)
```

### Icons: Lucide React

### Components: shadcn/ui + Aceternity UI

---

## Tech Stack

```
Next.js 14 (App Router — single page, no routing needed)
Tailwind CSS
shadcn/ui (buttons, inputs, toggles, dropdowns)
Aceternity UI (glass effects)
Lucide React (icons)
Framer Motion (panel slide animations)
react-map-gl (Mapbox wrapper)
deck.gl (3D wireframe envelopes via MapboxOverlay)
Recharts (chart in Brief panel)
Google Places Autocomplete (address search)
Google Street View Static API (building photos)
Mapbox Static API (satellite fallback)
```

---

## Implementation Steps

| Step | What | Time |
|------|------|------|
| 1 | Next.js + Tailwind + shadcn/ui scaffold | 30 min |
| 2 | Full-screen MapContainer with react-map-gl | 30 min |
| 3 | Toolbar with all buttons (no functionality yet) | 30 min |
| 4 | Demo parcel data + parcel markers with labels | 45 min |
| 5 | Cluster markers at low zoom (district bubbles) | 30 min |
| 6 | LeftPanel slide animation (Framer Motion) | 30 min |
| 7 | PropertyDetail component (photo, metrics, deal checks, facts) | 1.5 hr |
| 8 | Street View + Satellite hero with fallback | 30 min |
| 9 | Click marker -> fly to + open PropertyDetail | 30 min |
| 10 | SearchBar with Google Places Autocomplete | 45 min |
| 11 | FilterDropdown with sliders + real-time marker filtering | 45 min |
| 12 | BriefPanel (area + site modes) | 1 hr |
| 13 | News feed in BriefPanel (Google News RSS) | 30 min |
| 14 | LayersDropdown + toggle switches | 30 min |
| 15 | 3D toggle + deck.gl wireframe envelopes | 1 hr |
| 16 | Save site + SavedPill floating button | 30 min |
| 17 | ComparePanel (bottom slide-up) | 1 hr |
| 18 | Mobile bottom sheet (responsive) | 1 hr |
| 19 | Glassmorphism styling on all panels | 30 min |
| 20 | Polish: animations, loading states, image fallbacks | 1 hr |

Total: ~13 hours. Steps 1-9 (~6 hours) give you a working map-first app with property details.

---

## User Story Coverage

### Developer (primary)

| Need | How It Works |
|------|-------------|
| Where should I look? | Default zoom: district clusters with summary stats |
| Show me parcels | Zoom in: clusters break into labeled markers |
| Filter by criteria | Filters dropdown: height, FAR, type, risk, variance |
| What's allowed here? | Click marker: PropertyDetail panel slides in |
| Show me the building | Street View + Satellite hero in panel |
| How big can I build? | 3D button: wireframe envelope appears on map |
| What kills this deal? | Deal checks in PropertyDetail (green/amber) |
| Compare sites | Save 2+ sites: Compare pill appears, click for side-by-side |
| Market intelligence | Brief button: area or site intelligence + news |
| Search any address | Search bar with autocomplete |
| Give me a report | "Generate Report" button in panel |

### City Planner (v2)

| Need | Planned |
|------|---------|
| Compliance check | v2: proposal vs zoning rules engine |
| Climate impact | v2: before/after intervention simulation |
| Displacement risk | v2: ownership duration layer |
| Community input | v2: NPU data integration |

---

## What This Replaces

This plan supersedes:
- multipage-webapp.md (6-page architecture)
- multipage-webapp-v2.md (2-page Redfin split view)
- smartbricks-upgrade.md (original UI upgrade)
- geoai-consulting-pivot.md (consulting reframe)

All the content decisions from those plans (plain language, deal checks, consulting framing, user stories) carry forward. Only the architecture changed: from pages to panels.

---

## SESSION_ID
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
