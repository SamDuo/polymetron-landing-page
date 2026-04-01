# Implementation Plan v2: 2-Page Redfin-Style Web App

## Design Philosophy

**Redfin layout + Robinhood simplicity + McKinsey intelligence**

- Desktop: split view (left pane + map)
- Mobile: single column with bottom nav
- 2 pages only — overview grid, then the app
- Consulting-as-a-service: brief follows your focus

---

## Page Architecture (2 pages)

```
/                → Market Overview (4 district grid)
/explore         → Split View (left pane + map = the whole app)
```

---

## Page 1: `/` — Market Overview

4 clickable district panels. Shows the user this is a city-wide platform, not a single-district tool.

```
+------------------------------------------------------+
|  POLYMETRON          [Search any address...]          |
|  Urban Intelligence                                  |
+------------------------------------------------------+
|                                                      |
|  Atlanta Metro — Development Intelligence            |
|  4 districts monitored by Polymetron agents           |
|                                                      |
|  +------------------------+------------------------+ |
|  |  MIDTOWN SPI-16        |  OLD FOURTH WARD       | |
|  |                        |                        | |
|  |  [satellite thumbnail] |  [satellite thumbnail] | |
|  |                        |                        | |
|  |  $385/sqft  +3.2%      |  $310/sqft  +5.1%      | |
|  |  47 permits             |  23 permits             | |
|  |  1,777 vacant parcels   |  892 vacant parcels     | |
|  |  Avg gap: 42%           |  Avg gap: 38%           | |
|  |                        |                        | |
|  +------------------------+------------------------+ |
|  |  BUCKHEAD              |  WESTSIDE / BELTLINE   | |
|  |                        |                        | |
|  |  [satellite thumbnail] |  [satellite thumbnail] | |
|  |                        |                        | |
|  |  $420/sqft  -1.2%      |  $275/sqft  +8.3%      | |
|  |  31 permits             |  58 permits             | |
|  |  643 vacant parcels     |  2,100 vacant parcels   | |
|  |  Avg gap: 25%           |  Avg gap: 55%           | |
|  |                        |                        | |
|  +------------------------+------------------------+ |
|                                                      |
|  Powered by Polymetron Zoning Analyst                |
+------------------------------------------------------+
```

Each panel thumbnail: Mapbox satellite static image of the district center.

**Interactions:**
- Click a district card -> navigates to `/explore?district=midtown-spi16`
- Search bar at top -> type any address -> navigates to `/explore?address=1075+Peachtree`
- Framer Motion: card scales up slightly on hover, slides into split view on click

---

## Page 2: `/explore` — Split View (The App)

Redfin-style: left pane (40% width) + map (60% width).

```
+---------------------------+-------------------------------+
|  [Search any address...]  |                               |
|  [Filters] [Sort]         |                               |
|                           |                               |
|  [Search] [Brief] [Sites] |        MAPBOX MAP             |
|  ________________________ |                               |
|                           |     Markers with labels:      |
|  (tab content below)      |     [285K sf] [450K sf]       |
|                           |     [42K sf]  [38K sf]        |
|                           |                               |
|                           |     3D envelope visible       |
|                           |     when parcel selected      |
|                           |                               |
|                           |     [2D/3D toggle]            |
|                           |     [Layers]                  |
|                           |                               |
+---------------------------+-------------------------------+
```

### Left Pane: 3 Tabs

---

### Tab 1: Search (default)

Shows property cards for the current map area. Scrollable list.

```
+---------------------------+
|  Midtown SPI-16            |
|  5 sites  Sort: Buildable  |
|                           |
|  +-----+  1100 Peachtree  |
|  |photo|  Vacant           |
|  |     |  450K buildable sf|
|  +-----+  625 ft max      |
|            No variance     |
|                           |
|  +-----+  1075 Peachtree  |
|  |photo|  Underbuilt       |
|  |     |  285K buildable sf|
|  +-----+  625 ft max      |
|            No variance     |
|                           |
|  +-----+  725 Ponce Leon  |
|  |photo|  Underbuilt       |
|  |     |  42K buildable sf |
|  +-----+  150 ft max      |
|            No variance     |
|                           |
|  (scroll for more...)      |
+---------------------------+
```

**When a card is clicked**, the left pane slides to **Property Detail** (replaces the list, not a new page):

```
+---------------------------+
|  <- Back to results        |
|                           |
|  [Street View] [Satellite] |
|  +------------------------+|
|  |                        ||
|  |   (building photo)     ||
|  |                        ||
|  +------------------------+|
|                           |
|  1075 Peachtree St NE      |
|  SPI-16 Core . 0.52 acres  |
|                           |
|  +------+ +------+ +-----+|
|  |625 ft| |25.0  | |285K ||
|  |Max Ht| |FAR   | |BldSF||
|  +------+ +------+ +-----+|
|                           |
|  WHAT YOU CAN BUILD        |
|  A 50-story mixed-use     |
|  tower by right. Currently|
|  30-story office (1985).  |
|  50% density unused.      |
|  Est: $100M-$128M         |
|                           |
|  DEAL CONSIDERATIONS       |
|  [check] No variance       |
|  [check] MARTA < 0.25 mi  |
|  [check] No flood zone     |
|  [warn] Cool roof +$30-60K|
|  [warn] Heat: Moderate     |
|  [warn] 3 permits nearby   |
|                           |
|  PROPERTY FACTS            |
|  Owner    Peachtree LLC    |
|  Built    1985             |
|  Lot      0.52 acres       |
|  Assessed $12.4M           |
|  Zoning   SPI-16-SA1       |
|  Overlays BeltLine, DRI    |
|                           |
|  [View 3D Envelope]        |
|  [Save to Sites]           |
|  [GENERATE REPORT]         |
+---------------------------+
```

Map simultaneously:
- Flies to the parcel
- Highlights parcel boundary
- If "View 3D Envelope" clicked, map pitches to 55 deg and shows wireframe

---

### Tab 2: Brief (contextual intelligence)

**Auto-switches based on what user is looking at:**

| Context | Brief Shows |
|---------|------------|
| District selected (no parcel) | Area market intelligence + news + agent alerts |
| Parcel selected | Site-specific analysis + deal brief + nearby activity + area news |

**Area-level brief (no parcel selected):**

```
+---------------------------+
|  INTELLIGENCE BRIEF        |
|  Midtown Atlanta SPI-16    |
|  Generated Apr 1, 2026     |
|  . Polymetron Zoning Analyst|
|                           |
|  EXECUTIVE SUMMARY         |
|  Midtown SPI-16 is at a   |
|  development inflection    |
|  point. The Mar 28 amend- |
|  ment package reduced Core |
|  setbacks from 10ft to 5ft.|
|                           |
|  3 ACTIVE ALERTS           |
|  [!] SPI-16 Amendment      |
|  [~] Cool Roof Ordinance   |
|  [+] BeltLine permits +23% |
|                           |
|  RECOMMENDED ACTIONS        |
|  1. Review setback changes |
|  2. Model cool roof costs  |
|  3. Evaluate BeltLine sites|
|                           |
|  MARKET NEWS                |
|  Bisnow 2h - Record permits|
|  AJC 5h - Cool Roof takes  |
|  effect...                 |
|  CoStar 1d - BeltLine rents|
|  up 18% YoY               |
|                           |
|  [Export PDF Report]        |
|  [Ask agent a question...] |
+---------------------------+
```

**Site-level brief (parcel selected):**

```
+---------------------------+
|  SITE INTELLIGENCE         |
|  1075 Peachtree St NE      |
|  Generated Apr 1, 2026     |
|  . Polymetron Zoning Analyst|
|                           |
|  ASSESSMENT                |
|  This site presents a     |
|  moderate-risk, high-upside|
|  development opportunity. |
|  50% of allowed density is |
|  unused. By-right entitle- |
|  ment eliminates 3-12 month|
|  variance timeline.       |
|                           |
|  DEAL CONSIDERATIONS       |
|  [check] No variance       |
|  [check] MARTA proximity   |
|  [warn] Cool roof +$30-60K|
|  [warn] Heat: Moderate     |
|                           |
|  NEARBY ACTIVITY           |
|  3 permits within 0.5 mi  |
|  - 1080 Peachtree: 42-fl  |
|    mixed-use (Issued)      |
|  - 1050 Peachtree: reno   |
|    (Under review)          |
|  - 880 W Peachtree: 28-fl |
|    residential (Pending)   |
|                           |
|  AREA NEWS                 |
|  Bisnow 2h - SPI-16 record|
|  permits in Q1 2026...    |
|                           |
|  [Export Site Report]       |
|  [Ask agent about site...] |
+---------------------------+
```

---

### Tab 3: Sites (saved parcels + compare)

```
+---------------------------+
|  SAVED SITES (3)           |
|                           |
|  +-----+ 1075 Peachtree   |
|  |photo| 285K sf . $100M  |
|  +-----+ [x remove]       |
|                           |
|  +-----+ 1100 Peachtree   |
|  |photo| 450K sf . $158M  |
|  +-----+ [x remove]       |
|                           |
|  +-----+ 725 Ponce Leon   |
|  |photo| 42K sf . $15M    |
|  +-----+ [x remove]       |
|                           |
|  [COMPARE SITES]           |
+---------------------------+
```

**When "Compare Sites" is clicked**, left pane switches to comparison view:

```
+---------------------------+
|  <- Back to saved          |
|  COMPARE (3 sites)         |
|                           |
|        1075    1100   725  |
|        Peach   Peach  Ponce|
|                           |
| Height  625    625    150  |
| FAR     25.0   25.0   8.0 |
| Build   285K   450K   42K |
| Cost    $100M  $158M  $15M|
| Var?    No     No     No  |
| Heat    Med    Med    HIGH |
| Type    Under  Vacant Under|
|                           |
| BEST FOR                   |
|        Mixed  High   Adapt |
|        use    rise   reuse |
|        tower  resid        |
|                           |
| [GENERATE COMPARISON]      |
+---------------------------+
```

Map shows all 3 parcels highlighted simultaneously with connecting lines.

---

## Search Bar + Filters

### Search Bar (top of left pane, always visible)

```
+---------------------------+
|  [icon] Search any address |
+---------------------------+
```

- Google Places Autocomplete for address suggestions
- Type address -> map flies to location -> property detail loads
- Type district name -> map zooms to district -> card list updates

### Filters (collapsible panel below search)

```
+---------------------------+
|  [Filters] [Sort: Buildable]|
|                           |
|  Height    [0] ---- [625] |
|  FAR       [0] ---- [25]  |
|  Lot size  [0] ---- [5 ac]|
|                           |
|  Type                      |
|  [ ] Vacant                |
|  [ ] Underbuilt            |
|  [ ] Existing              |
|                           |
|  Risk                      |
|  [ ] Low  [ ] Med  [ ] High|
|                           |
|  [x] No variance needed    |
|                           |
|  [Apply] [Reset]           |
+---------------------------+
```

---

## Map Markers with Labels

Replace tiny cyan squares with labeled markers (like Redfin price bubbles):

```
  +--------+
  | 285K sf|   <- buildable sqft label
  +---+----+
      |        <- pin/triangle pointing down
```

- Color by parcel type: green = vacant, orange = underbuilt, gray = existing
- On hover: show tooltip with address + key metric
- On click: left pane slides to property detail, map zooms
- Selected marker: larger, brand color border, pulsing

---

## Layout Toggle (Redfin-style)

Button in top-right of left pane header:

```
[Layout]
  - Split (default — cards left, map right)
  - Map (full screen map, glass cards overlay at bottom)
  - Grid (card grid, no map — like Zillow grid view)
  - Table (spreadsheet view — address, height, FAR, cost, risk)
```

---

## Mobile Layout

On screens < 768px, switch to single-column with bottom nav:

```
+---------------------------+
|  [Search bar]              |
|  [Filters]                 |
|                           |
|  (full-width content)      |
|  Cards or map or brief     |
|                           |
|  [Home] [Search] [Map]     |
|         [Brief]            |
+---------------------------+
```

- Home tab = Market Overview (4 districts)
- Search tab = Card list
- Map tab = Full screen map, swipeable cards at bottom
- Brief tab = Intelligence brief

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

### Glassmorphism (map overlays only)

```css
backdrop-filter: blur(16px) saturate(180%);
background: rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 16px;

/* Tailwind */
className="backdrop-blur-xl backdrop-saturate-150 bg-white/12 border border-white/20 rounded-2xl"
```

### Typography

```css
--f-display: 'Instrument Serif', serif
--f-body: 'Manrope', sans-serif
```

### Icons: Lucide React (ships with shadcn/ui)

### Components: shadcn/ui + Aceternity UI for glass effects

---

## Tech Stack

```
Next.js 14 (App Router)
Tailwind CSS
shadcn/ui + Aceternity UI
Lucide React (icons)
Framer Motion (transitions)
react-map-gl + deck.gl (map + 3D)
Recharts (charts)
Google Places Autocomplete (address search)
Google Street View Static API (building photos)
Mapbox Static API (satellite fallback)
```

---

## Implementation Steps

| Step | What | Time |
|------|------|------|
| 1 | Next.js scaffold + Tailwind + shadcn/ui + design system | 30 min |
| 2 | Page 1: Market overview with 4 district cards | 1 hr |
| 3 | Page 2: Split view layout (left pane 40% + map 60%) | 1 hr |
| 4 | Left pane Search tab: property card list | 1 hr |
| 5 | Property detail: slides in left pane on card click | 1.5 hr |
| 6 | Street View + Satellite hero with fallback | 30 min |
| 7 | Map: markers with buildable sqft labels | 45 min |
| 8 | Map: fly-to + highlight on card click | 30 min |
| 9 | Left pane Brief tab: area + site intelligence | 1 hr |
| 10 | Left pane Sites tab: save + compare | 1.5 hr |
| 11 | Search bar with Google Places Autocomplete | 45 min |
| 12 | Filters panel (height, FAR, type, risk) | 45 min |
| 13 | Layout toggle (Split/Map/Grid/Table) | 1 hr |
| 14 | 3D envelope on map (deck.gl wireframe) | 1 hr |
| 15 | Framer Motion transitions | 45 min |
| 16 | Mobile responsive layout with bottom nav | 1 hr |
| 17 | News feed in Brief tab (Google News RSS) | 30 min |

Total: ~14 hours. Steps 1-8 (~7 hours) give you a working Redfin-style split view.

---

## User Story Coverage

### Developer (primary user)

| Need | Feature | Status |
|------|---------|--------|
| Where should I look? | Page 1: 4 district grid | Covered |
| Show me parcels | Search tab: card list + map | Covered |
| What's allowed here? | Property detail: zoning card | Covered |
| Show me the building | Street View + Satellite hero | Covered |
| How big can I build? | 3D envelope + buildable sqft | Covered |
| What kills this deal? | Deal considerations section | Covered |
| Compare sites | Sites tab: save + compare view | Covered |
| Give me a report | Brief tab + Generate Report | Covered |
| What's happening? | Brief tab: news + alerts | Covered |
| Search any address | Search bar with autocomplete | Covered |
| Filter by criteria | Filters: height, FAR, type, risk | Covered |

### City Planner (secondary user, v2)

| Need | Feature | Status |
|------|---------|--------|
| Compliance check | Not in v1 | Planned v2 |
| Climate impact | Heat risk score shown | Partial |
| Displacement risk | Not in v1 | Planned v2 |
| Nearby permits | Shown in site brief | Partial |
| Community input | Not in v1 | Planned v2 |

---

## SESSION_ID
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
