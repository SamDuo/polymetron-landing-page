# Session Handoff — Polymetron Demo → Next.js Migration

## Context

This session (2026-03-31 to 2026-04-01) built a working Polymetron demo in vanilla HTML/CSS/JS and established all architectural decisions for the Next.js rebuild.

**User:** Sam Duong, CTO, Georgia Tech dual MS (Urban Analytics + CS). Building Polymetron with Dr. Ingeborg Rocker (CEO, former VP Dassault Systemes, led Virtual Singapore $73M digital twin).

**Stage:** Pre-seed, targeting a16z American Dynamism Speedrun + Menlo Ventures.

---

## What Exists (Vanilla JS Demo)

Location: `C:\Users\qduong7\Downloads\polymetron-demo\`

### Working Features
1. **Mapbox GL JS map** with 6 zone markers (SPI-16 subdistricts), satellite imagery on zone click
2. **Dark agent panel** (#1b3a2d) matching landing page Pillar 02 design — "Polymetron AI" header with green pulse dot
3. **Intelligence brief** (default state) — red alert card (heat vulnerability), follow-up pill buttons, agent response, key metrics, recommended actions
4. **Zone detail tabs** — Overview, Code & Climate, Feasibility (buildability score ring), Agent Analysis (RAG chat)
5. **AI chat** with simulated RAG responses (preset questions, sources with confidence scores)
6. **Value Analysis page** — ratio chart, delta distribution, tier breakdown by year (Chart.js)
7. **Buildability page** — zone pills, feasibility cards, buildability score gauge
8. **News panel** — slide-out with 8 curated RE/zoning headlines
9. **Map legend** — clickable zone list
10. **Metric ribbon** — compact stat bar above map
11. **Agent Status sidebar** — pulse dots with ACTIVE/MONITORING states
12. **Engagement badge** — "ENGAGEMENT: Midtown Atlanta SPI-16 | PROPRIETARY"
13. **Consulting language** throughout — Situation Brief, Site Report, Market Intelligence

### Key Files
- `index.html` — full markup (~280 lines)
- `styles.css` — complete design system (~700 lines)
- `app.js` — all interactivity (~800 lines)
- `atlanta-tracts.geojson` — census tract boundaries with HVI data

### Mapbox Token
Set via environment variable `NEXT_PUBLIC_MAPBOX_TOKEN`. The token is in Sam's Mapbox account (username: sduong).

---

## What Needs to Be Built (Next.js)

### Priority 1: 3D Zoning Envelope (the "wow" feature)

Three layers on ONE map view per parcel:
1. **Zoning Envelope** — deck.gl GeoJsonLayer with `wireframe: true`, cyan, transparent
2. **Existing Building** — Mapbox fill-extrusion, solid gray
3. **Proposed Massing** — Mapbox fill-extrusion, semi-transparent accent color

Technical approach:
- deck.gl MapboxOverlay for wireframe (Mapbox can't do native wireframe)
- Mapbox fill-extrusion for solid buildings
- 3D view: pitch 55, bearing -25, antialias true
- Toggle between 2D and 3D
- Climate risk coloring on 3D buildings (color by heat vulnerability score)

See plan: `.claude/plan/3d-zoning-envelope.md`

### Priority 2: Port All Existing Features

Port from vanilla JS to React components:
- MapView (react-map-gl + deck.gl overlay)
- AgentPanel (dark panel with brief/alerts/chat)
- ZoneDetail (tabs: overview, code, feasibility, agent analysis)
- Charts (ratio, delta, tier — Chart.js or Recharts)
- Sidebar (agent status, navigation)
- NewsPanel (slide-out)

### Priority 3: Data Integration

Phase 1 (free):
- Atlanta ArcGIS Open Data — real zoning polygons
- Atlanta Building Permits — recent permit feed
- RSS feeds — live news

Phase 2 ($95-200/mo):
- ATTOM API — property records, sales, valuations
- Regrid API — parcel boundaries
- Mapbox Tiling Service — vector tilesets for scale

---

## Design Decisions Made

1. **Dark agent panel** (#1b3a2d) for the detail/right panel — matches landing page Pillar 02
2. **Agent speaks first** — intelligence brief auto-loads, user asks follow-ups
3. **Consulting language** — "Situation Brief" not "Dashboard", "Site Report" not "Buildability"
4. **Agent Status** instead of Platform Stats — pulse dots signal agentic, not database
5. **Engagement framing** — "ENGAGEMENT" badge, "PROPRIETARY" classification
6. **Thesis narrative** on Market Intelligence page — McKinsey-style data framing
7. **Instrument Serif** for headings, **Manrope** for body — warm editorial feel
8. **Accent color** #c0532c for CTAs, alert cards, follow-up pills

---

## Competitive Research Summary

### SmartBricks (a16z, $5M pre-seed)
- AI property investing platform, Dubai-based
- "Smart Bricks Score" property cards, GenAI Advisor
- Gap: NO zoning, NO climate, NO food security, NO intervention simulation
- Uses Next.js, similar card-based UI

### Deepblocks (competitor for 3D massing)
- DEV product: draw parcel → 3D massing + financial pro forma ($55/mo)
- Uses Mapbox Tiling Service for millions of parcels
- 300+ US cities with digitized zoning
- Gap: NO climate risk, NO food security, NO displacement risk
- Shows what you CAN build; Polymetron shows what you SHOULD build

### First Street ($46M)
- Climate risk scores only
- No zoning, no food, no intervention simulation

---

## Deck Alignment

From Speedrun deck (11 slides):
- **Tagline:** "Urban intelligence for resilient cities"
- **Solution:** Climate Intelligence + Community Resilience Mapping + Intervention Simulation
- **What's built:** 5 items (heat ML, pedestrian sim, food waste dashboard, intervention engine, agentic AI platform)
- **Business model:** SaaS $75K-200K/yr + Project $25K-75K + Data Licensing $50K-150K/yr + Grants $100K-2.5M
- **Market:** $500M immediate → $4B SAM → $105B TAM
- **Go-to-market:** Atlanta (0-6mo) → Sun Belt (6-24mo) → National (24-48mo)

---

## Plans (in `.claude/plan/`)

1. `smartbricks-upgrade.md` — original 8-step UI upgrade (partially implemented)
2. `geoai-consulting-pivot.md` — repositioning from SaaS to consulting delivery
3. `3d-zoning-envelope.md` — 3D massing with deck.gl + Mapbox (NOT YET IMPLEMENTED)
