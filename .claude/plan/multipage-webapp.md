# Implementation Plan: Multi-Page Web App with Smooth Transitions

## Design Philosophy

**Robinhood simplicity + McKinsey authority + Zillow familiarity**

- Clean, white-space-heavy pages (not cramped dashboards)
- Smooth page transitions (Next.js App Router + Framer Motion)
- Each page does ONE thing well
- Consulting framing: you're receiving intelligence, not using a tool

---

## Page Architecture (6 pages)

```
/                     → Landing / Market Overview (the "big number")
/search               → Search + News Feed
/site/[address]       → Property Card (Zillow-style detail)
/site/[address]/3d    → 3D Envelope View (drill-down)
/compare              → Side-by-side comparison (2-3 sites)
/brief                → Intelligence Brief (consulting deliverable)
```

### Bottom Navigation (4 tabs, always visible)

Use Lucide React icons (ships with shadcn/ui):

```
  Home        Search      MapPin      FileText
  (home)      (search)    (map-pin)   (file-text)
  Overview    Search      Map         Brief
```

---

## Page 1: `/` — Market Overview

The "Robinhood home screen" for real estate.

```
┌──────────────────────────────────────────┐
│                                          │
│  POLYMETRON                              │
│  Midtown Atlanta · SPI-16                │
│                                          │
│  $385 /sqft                              │
│  ▲ $12 (3.2%) this quarter               │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │    (construction cost trend      │    │
│  │     line chart, green fill)      │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│  1M    3M    6M    1Y    ALL             │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  47 active permits              ›        │
│  1,777 vacant parcels           ›        │
│  Sale/FMV ratio: 1.03          ›        │
│  Avg buildable gap: 42%        ›        │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  AGENT ALERTS                            │
│                                          │
│  [!] SPI-16 Amendment Package approved   │
│      Mar 28 — affects setback...  >      │
│                                          │
│  [~] Cool Roof Ordinance now             │
│      enforceable — $30-60K impact  >     │
│                                          │
│  [+] BeltLine Eastside permits           │
│      up 23% QoQ  >                       │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  TOP OPPORTUNITIES                       │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │[St View] │ │[St View] │ │[StView]│  │
│  │1100      │ │725 Ponce │ │550     │  │
│  │Peachtree │ │de Leon   │ │Somerset│  │
│  │Vacant    │ │Underbuilt│ │Vacant  │  │
│  │450K sqft │ │42K sqft  │ │38K sqft│  │
│  └──────────┘ └──────────┘ └────────┘  │
│  ← scroll →                             │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
│ Overview  Search    Map      Brief       │
└──────────────────────────────────────────┘
```

**Transition:** Tapping a property card → slides right into `/site/[address]` with shared element animation (the Street View photo expands from card to hero).

---

## Page 2: `/search` — Search + News

```
┌──────────────────────────────────────────┐
│                                          │
│  [Search icon] Search any address...      │
│                                          │
│  RECENT                                  │
│  1075 Peachtree St NE             ›      │
│  725 Ponce de Leon Ave            ›      │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  MARKET NEWS                             │
│                                          │
│  Bisnow · 2h                             │
│  Midtown Atlanta Sees Record             │
│  Mixed-Use Permits in Q1 2026            │
│  ┌──────────────────────────────────┐    │
│  │       (article hero image)       │    │
│  └──────────────────────────────────┘    │
│                                          │
│  AJC · 5h                                │
│  Cool Roof Ordinance Takes Effect —      │
│  What Developers Need to Know            │
│                                          │
│  CoStar · 1d                             │
│  BeltLine Eastside Corridor: Rents       │
│  Up 18% YoY                              │
│  SPI-16 ▲18%                             │
│                                          │
│  City of Atlanta · 2d                    │
│  Planning Commission Approves            │
│  SPI-16 Amendment Package                │
│                                          │
│  GlobeSt · 3d                            │
│  Fulton County Assessments Lag           │
│  Market by 15%                           │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
└──────────────────────────────────────────┘
```

**Interaction:** Typing in search bar → autocomplete addresses (Google Places API). Selecting an address → slide transition to `/site/[address]`.

**Transition:** The search bar stays at top and morphs into the back button + address title on the detail page.

---

## Page 3: `/site/[address]` — Property Card

The star of the app. This is where the consulting intelligence lives.

```
┌──────────────────────────────────────────┐
│  ←  1075 Peachtree St NE                 │
│                                          │
│  [Street View]  [Satellite]              │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │      (auto-generated photo)      │    │
│  │      from Google Street View     │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  1075 Peachtree St NE                    │
│  SPI-16 Core · 0.52 acres · Underbuilt   │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ 625 ft │ │  25.0  │ │ 285K   │       │
│  │Max Ht  │ │Max FAR │ │Bld SF  │       │
│  └────────┘ └────────┘ └────────┘       │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  WHAT YOU CAN BUILD                      │
│                                          │
│  A 50-story mixed-use tower by right.    │
│  Currently a 30-story office (1985).     │
│  50% of allowed density unused —         │
│  285,000 additional sqft.                │
│                                          │
│  Estimated cost: $100M – $128M           │
│  at $350–450/sqft                        │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  DEAL CONSIDERATIONS                     │
│                                          │
│  [check] No variance needed — by right   │
│  [check] MARTA < 0.25 mi — reduced park  │
│  [check] No flood zone                    │
│  [warn]  Cool roof required (+$30-60K)   │
│  [warn]  Heat vulnerability: Moderate    │
│  [warn]  3 active permits within 0.5 mi  │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  PROPERTY FACTS                          │
│  Owner       Peachtree Holdings LLC      │
│  Held since  2003 (23 years)             │
│  Current     Class A Office              │
│  Year built  1985                        │
│  Lot size    0.52 acres                  │
│  Assessed    $12.4M (2024)               │
│  Zoning      SPI-16-SA1 (Core)           │
│  Overlays    BeltLine, Midtown DRI       │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  AREA NEWS                               │
│  Bisnow 2h — SPI-16 record permits...   │
│  AJC 5h — Cool Roof Ordinance...        │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │       View 3D Envelope    ›      │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │       Compare Sites       ›      │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │    ██ GENERATE REPORT ██         │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
└──────────────────────────────────────────┘
```

**Transition:** "View 3D Envelope" → the page zooms into a full-screen 3D map view (`/site/[address]/3d`). The property card slides down and the map fills the screen with a camera fly-in animation.

---

## Page 4: `/site/[address]/3d` — 3D Envelope

Full-screen immersive 3D view. The "wow" moment.

```
┌──────────────────────────────────────────┐
│  ←  1075 Peachtree    [2D] [3D]          │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │                                  │    │
│  │      (full-screen Mapbox map     │    │
│  │       with 3D extruded           │    │
│  │       buildings, pitch: 55,      │    │
│  │       deck.gl wireframe          │    │
│  │       envelope)                  │    │
│  │                                  │    │
│  │                                  │    │
│  │                                  │    │
│  │  LAYERS                          │    │
│  │  [ ] Envelope [ ] Existing [ ] Prop│   │
│  └──────────────────────────────────┘    │
│                                          │
│  ← swipe up for details                 │
│  ┌──────────────────────────────────┐    │
│  │ Zoning Envelope    623 ft        │    │
│  │ ████████████████████████  100%   │    │
│  │ Proposed Building  623 ft        │    │
│  │ ██████████████████████░░   100%  │    │
│  │ Existing Structure 299 ft        │    │
│  │ ████████████░░░░░░░░░░░    48%   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
└──────────────────────────────────────────┘
```

**Transition:** Back button → slides back to property card. The map animates from 3D (pitch 55) to 2D (pitch 0) during transition.

---

## Page 5: `/compare` — Side-by-Side

```
┌──────────────────────────────────────────┐
│  ←  Compare Sites                        │
│                                          │
│        1075          1100      725       │
│        Peachtree     Peachtree Ponce     │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐     │
│  │[photo] │  │[photo] │  │[photo] │     │
│  └────────┘  └────────┘  └────────┘     │
│                                          │
│  Height   625 ft    625 ft    150 ft     │
│  FAR      25.0      25.0      8.0       │
│  Build SF 285K      450K      42K       │
│  Cost     $100-128M $158-203M $15-19M   │
│  Variance No        No        No        │
│  Heat     Moderate  Moderate  HIGH      │
│  Permits  3 nearby  5 nearby  1 nearby  │
│  Type     Underbuilt Vacant   Underbuilt│
│                                          │
│  BEST FOR                                │
│  Mixed-use  High-rise  Boutique          │
│  tower      residential adaptive         │
│             + retail   reuse             │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │    ██ GENERATE COMPARISON ██     │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
└──────────────────────────────────────────┘
```

---

## Page 6: `/brief` — Intelligence Brief (Consulting Deliverable)

This is the **consulting-as-a-service** page. What a McKinsey analyst would deliver.

```
┌──────────────────────────────────────────┐
│                                          │
│  INTELLIGENCE BRIEF                      │
│  Midtown Atlanta SPI-16                  │
│  Generated Apr 1, 2026                   │
│  Polymetron Zoning Analyst               │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  EXECUTIVE SUMMARY                       │
│                                          │
│  Midtown SPI-16 is at a development      │
│  inflection point. The Mar 28 amendment  │
│  package reduced Core setbacks from      │
│  10ft to 5ft, compressed SAP timeline    │
│  from 12 to 8 weeks, and raised cool     │
│  roof SRI threshold to 72 for buildings  │
│  above 200ft.                            │
│                                          │
│  Combined with 47 active permits and     │
│  a stable Sale/FMV ratio of 1.03,        │
│  the district signals execution-phase    │
│  opportunity rather than speculation.    │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  3 ACTIVE ALERTS                         │
│                                          │
│  [!] SPI-16 Amendment — setbacks  >      │
│  [~] Cool Roof compliance  >             │
│  [+] BeltLine permits +23% QoQ  >       │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  RECOMMENDED ACTIONS                     │
│                                          │
│  1. Review setback changes before        │
│     Q2 submittals                        │
│  2. Model cool roof compliance for       │
│     pipeline projects                    │
│  3. Evaluate BeltLine Eastside           │
│     parcels — window closing             │
│                                          │
│  ─────────────────────────────────────── │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │    ██ EXPORT PDF REPORT ██       │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │    Ask agent a question...  ›    │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Home]   [Search]  [Map]    [Brief]    │
└──────────────────────────────────────────┘
```

---

## Transition System (Framer Motion)

### Page-Level Transitions

| From | To | Animation |
|------|-----|-----------|
| Overview → Property Card | Card expands, Street View photo scales up as shared element | 
| Search → Property Card | Slide from right, search bar morphs to back + title |
| Property Card → 3D View | Page slides down, map fills screen with camera fly-in |
| Property Card → Compare | Slide from right |
| Any → Brief tab | Bottom sheet slides up |
| Back (any) | Reverse of entry animation |

### Micro-Interactions

| Element | Animation |
|---------|-----------|
| Metric cards (625ft, 25.0 FAR) | Count-up on enter |
| Deal considerations | Stagger in one-by-one (100ms delay each) |
| Chart | Draw line left-to-right on enter |
| Alert cards | Slide in from left with slight bounce |
| Property card in scroll | Parallax on Street View photo |
| 3D buildings | Grow from ground up when entering 3D view |

### Tech Stack for Transitions

```
Next.js 14 App Router
  + Framer Motion (page transitions, shared layout animations)
  + next-view-transitions (native View Transitions API where supported)
  + CSS scroll-snap (for horizontal card scrolling)
```

```bash
npm install framer-motion next-view-transitions
```

Layout wrapper:
```tsx
// app/layout.tsx
import { AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
```

Page transition wrapper:
```tsx
// components/PageTransition.tsx
import { motion } from 'framer-motion';

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
```

Shared element (Street View photo expanding from card to hero):
```tsx
// Uses Framer Motion layoutId
<motion.div layoutId={`photo-${address}`}>
  <img src={streetViewUrl} />
</motion.div>
```

---

## Design System (Robinhood-inspired + Polymetron brand)

### Colors
```css
--bg: #ffffff             /* clean white (Robinhood) */
--bg-secondary: #f6f4f0  /* warm cream for sections */
--ink: #1a1714            /* near-black text */
--muted: #7a7267          /* secondary text */
--brand: #1b3a2d          /* dark green (brief page, agent) */
--accent: #c0532c         /* burnt orange CTAs */
--green: #00c853          /* positive / check marks */
--amber: #ff9100          /* warnings */
--red: #ff1744            /* critical alerts */
--line: #f0f0f0           /* very subtle dividers (Robinhood-light) */
```

### Typography
```css
--f-display: 'Instrument Serif', serif  /* big numbers, page titles */
--f-body: 'Manrope', sans-serif        /* everything else */

/* Sizes (Robinhood scale) */
--big-number: 2.5rem / font-weight: 400 / Instrument Serif
--page-title: 1.5rem / font-weight: 400 / Instrument Serif  
--section-header: 0.75rem / font-weight: 700 / Manrope / letter-spacing: 0.1em / uppercase
--body: 0.95rem / font-weight: 400 / Manrope
--caption: 0.78rem / font-weight: 500 / Manrope / color: muted
```

### Spacing
```css
/* Robinhood uses generous padding */
--page-padding: 20px
--section-gap: 32px
--card-gap: 12px
--item-padding: 16px 0  /* list items */
```

### Glassmorphism (applied to floating panels over map)

```css
/* Glass panel */
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
background: rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

/* Tailwind shorthand */
className="backdrop-blur-xl backdrop-saturate-150 bg-white/12 border border-white/20 rounded-2xl shadow-lg"
```

Use glass for:
- Property cards floating over map
- Bottom nav bar
- Map control overlays
- Search bar on map view

Do NOT use glass for:
- Full-page backgrounds (defeats the purpose)
- Text-heavy content pages (readability)
- Dark panel (brief page) — keep solid dark

### Icons (Lucide React — ships with shadcn/ui)

```bash
npm install lucide-react
```

Key icons needed:
- Navigation: Home, Search, MapPin, FileText
- Alerts: AlertTriangle (warn), CheckCircle (check), AlertCircle (critical)
- Property: Building2, Ruler, Layers, ArrowUpDown
- Actions: Download, Share2, ExternalLink, ChevronRight
- Status: Activity (pulse), Eye, Clock

### Component Libraries

```bash
npx shadcn@latest init     # base components (buttons, cards, inputs, dialogs)
```

Then copy-paste from Aceternity UI for glass-specific components:
- Floating Dock (bottom nav)
- Glare Card (property cards)
- Background Gradient (page backgrounds)

### Components
- **Bottom Nav**: glass bar, 4 Lucide icons, fixed, active tab highlighted with brand color
- **Metric Card**: rounded corners, subtle shadow, count-up animation
- **Alert Card**: left color bar (red/amber/green), Lucide icon (AlertTriangle/CheckCircle)
- **Property Card (mini)**: Street View photo + 3 key stats, rounded, shadow
- **Section Divider**: 1px #f0f0f0, full-width, generous margin
- **CTA Button**: full-width, rounded, brand color, centered text
- **Glass Panel**: glassmorphism card for map overlays

---

## Page Flow Diagram

```
                    ┌─────────┐
                    │ Overview │ ← Home tab
                    │ (big #)  │
                    └────┬─────┘
                         │ tap card
                         ▼
┌────────┐    ┌──────────────────┐    ┌─────────┐
│ Search │───>│  Property Card   │───>│ 3D View │
│ + News │    │  /site/[address] │    │ (drill) │
└────────┘    └────────┬─────────┘    └─────────┘
                       │ 
                       │ add to compare
                       ▼
                 ┌───────────┐
                 │  Compare  │
                 │ (2-3 sites)│
                 └───────────┘

┌──────────────────────────┐
│  Intelligence Brief      │ ← Brief tab (always accessible)
│  (consulting deliverable)│
└──────────────────────────┘
```

---

## Consulting-as-a-Service Integration

The app is NOT a self-serve tool. The framing throughout:

| Element | SaaS Framing (avoid) | Consulting Framing (use) |
|---------|---------------------|-------------------------|
| Home page | "Dashboard" | "Market Overview" — your analyst's summary |
| Data | "Explore data" | Alerts are pushed TO you |
| Property detail | "Property details" | "Site Intelligence" — pre-analyzed |
| Report | "Download PDF" | "Generate Client Report" |
| Chat | "Ask AI" | Agent has already analyzed, you ask follow-ups |
| Pricing | "$99/mo" | "Schedule engagement" |

The Brief tab is the consulting anchor — it's what a $75K engagement delivers, visible for free as a demo.

---

## Implementation Priority for Codespaces

| Step | What | Time |
|------|------|------|
| 1 | Next.js scaffold + Tailwind + design system | 30 min |
| 2 | Bottom nav + page routing (4 tabs) | 30 min |
| 3 | Overview page (big number + chart + alert cards) | 1 hr |
| 4 | Property Card page with Street View + Satellite | 1.5 hr |
| 5 | Search page with news feed | 1 hr |
| 6 | Framer Motion page transitions | 45 min |
| 7 | Map page with swipeable cards | 1.5 hr |
| 8 | 3D envelope drill-down | 1 hr |
| 9 | Compare page | 1 hr |
| 10 | Brief page (consulting deliverable) | 45 min |
| 11 | PWA config (installable on phone) | 15 min |

Total: ~10 hours. Steps 1-6 (~5 hours) give you a working multi-page app with smooth transitions.

---

## SESSION_ID
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
