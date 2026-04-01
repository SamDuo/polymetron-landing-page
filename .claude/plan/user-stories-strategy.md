# User Stories & Product Strategy: What Users Actually Need

## The Problem With Our Current Demo

We built features (3D wireframe, color toggles, FAR utilization) without answering: **what decision is the user trying to make?**

A developer doesn't think in "FAR Utilization color mode." They think:

> "I have $15M. Where in Midtown Atlanta should I build? What can I build there? Will it make money? What's going to kill this deal?"

A city planner doesn't think in "Risk Score overlay." They think:

> "This developer wants to build a 40-story tower here. Should I approve it? What happens to this neighborhood if I do?"

---

## Two Users, Two Workflows

### USER 1: Real Estate Developer

**Current workflow (painful):**
1. Define criteria (product type, returns, geography) — 1 week
2. Site search — brokers send listings, developer screens manually — 2-4 weeks
3. Zoning research — read 500-page zoning code, navigate city GIS portal, call planner — 1-2 weeks per site
4. Preliminary feasibility — back-of-envelope pro forma — 1 week
5. Due diligence — Phase I ESA, geotech, traffic, survey, market study — 2-3 months, **$30K-$100K per site**
6. Entitlements — variance/rezoning if needed — 3-18 months

**Kill rate:** Developers evaluate 20-50 sites for every 1 they build. Most screening cost is wasted.

**What they want from Polymetron:**

| Step | Their Question | What We Should Show |
|------|---------------|-------------------|
| Screening | "Which parcels in SPI-16 can support a 30+ story tower?" | **Filtered list** of parcels that meet height/FAR/use criteria |
| Zoning | "What's allowed here by right? Do I need a variance?" | **Zoning card**: height, FAR, setbacks, uses, overlays — plain language |
| Envelope | "How big can I build?" | **3D envelope** — but labeled in floors/sqft, not meters |
| Feasibility | "Does it pencil at $350/sqft construction?" | **Quick pro forma**: buildable sqft x cost vs. projected revenue |
| Risk | "What's going to kill this deal?" | **Deal killers list**: flood zone, contamination, displacement risk, entitlement complexity |
| Comparison | "How does this site compare to the other 3 I'm looking at?" | **Side-by-side** of 2-3 parcels on key metrics |

### USER 2: City Planner / Municipal Sustainability Office

**Current workflow:**
1. Receive development application — check zoning compliance
2. Review against comprehensive plan — does it align with city goals?
3. Assess community impact — traffic, infrastructure, displacement
4. Design review — massing, materials, neighborhood context
5. Public hearing — community input
6. Decision — approve, deny, or approve with conditions

**What they want from Polymetron:**

| Step | Their Question | What We Should Show |
|------|---------------|-------------------|
| Compliance | "Does this proposal comply with SPI-16?" | **Compliance checklist**: green/red for each zoning requirement |
| Climate | "Will this increase heat exposure in this tract?" | **Heat impact projection**: before/after with intervention options |
| Equity | "Are we displacing long-term residents?" | **Ownership duration map**: who's been here 20+ years? |
| Infrastructure | "Can the grid/water/transit handle this?" | **Capacity indicators**: MARTA proximity, utility loads |
| Cumulative | "What's the total impact of all approved projects in this area?" | **Pipeline view**: all active permits + proposals overlaid |

---

## What the Demo Should Actually Show

### Scenario: Developer Evaluating 1075 Peachtree St NE

Instead of abstract color toggles, walk through a DECISION:

**Screen 1: Site Card (replaces current parcel detail)**
```
┌─────────────────────────────────────────┐
│  1075 Peachtree St NE                    │
│  SPI-16 Core  |  0.52 acres             │
│                                          │
│  WHAT'S ALLOWED ─────────────────────── │
│  Height:  625 ft (with SAP)             │
│  FAR:     25.0 max                       │
│  Uses:    Mixed-use, residential,        │
│           commercial, hotel              │
│  Parking: Reduced (MARTA < 0.25 mi)     │
│  Variance needed? NO — by right          │
│                                          │
│  WHAT'S THERE NOW ──────────────────── │
│  30-story office building (1985)         │
│  Current height: 299 ft                  │
│  Current FAR: 12.5                       │
│  Owner: Peachtree Holdings LLC           │
│  Held since: 2003 (23 years)            │
│                                          │
│  WHAT YOU COULD BUILD ──────────────── │
│  Additional: 326 ft / 50% FAR unused    │
│  Buildable sqft: ~285,000 sqft          │
│  Est. construction: $350-450/sqft       │
│  Est. total cost: $100M-$128M           │
│                                          │
│  ⚠ DEAL CONSIDERATIONS ────────────── │
│  ● Heat vulnerability: Moderate (45/100) │
│  ● Cool roof required (SRI ≥ 64)        │
│  ● BeltLine overlay: 15-20% rent premium│
│  ● No flood zone                         │
│  ● Active permits nearby: 3 in 0.5 mi   │
│                                          │
│  [View 3D Envelope]  [Compare Sites]    │
│  [Generate Feasibility Report]           │
└─────────────────────────────────────────┘
```

**Screen 2: 3D Envelope (only when "View 3D Envelope" is clicked)**

The 3D view is a TOOL within the workflow, not the default view. When shown:
- Label the envelope in **floors and sqft**, not meters
- Show the gap as "50 additional floors possible" not "0% unused development rights"
- Color by a single meaningful dimension at a time with clear labels

**Screen 3: Compare Sites**

Side-by-side comparison of 2-3 parcels:
```
                    1075 Peachtree    1100 Peachtree    725 Ponce de Leon
Height allowed      625 ft            625 ft            150 ft
Current use         Office (30-fl)    Vacant            Retail (4-fl)
Buildable sqft      285,000           450,000           42,000
Est. cost           $100-128M         $158-203M         $15-19M
Heat risk           Moderate          Moderate          HIGH
Variance needed?    No                No                No
Nearby permits      3                 5                 1
```

---

## What to REMOVE from Current Demo

| Remove | Why |
|--------|-----|
| "Color By: Zoning Type / Risk Score / FAR Utilization" toggle | Users don't think in abstract color modes. Show risk inline on the site card instead. |
| "Buildability Gap: 0 ft (0% unused development rights)" | Confusing. Say "50% of allowed density unused — 285,000 sqft buildable" instead. |
| Abstract metric bars (zoning envelope: 623ft, proposed: 623ft) | Replace with plain-language: "You can build up to 625 ft. Currently 299 ft. Room for 326 ft more." |
| 3D as default view | Make 2D the default. 3D is a visualization tool, not the primary interface. |
| "ENGAGEMENT: MIDTOWN ATLANTA SPI-16 | PROPRIETARY" badge | Keep for investor demo, but real users don't need this. |

## What to ADD

| Add | Why |
|-----|-----|
| **Plain-language site card** | Answers "what's allowed, what's there, what can I build" in 10 seconds |
| **Deal killers section** | Red flags that would stop a developer (flood, contamination, variance needed, entitlement timeline) |
| **Cost estimate** | Even rough: buildable sqft x $350-450/sqft = total project cost |
| **Compare mode** | Side-by-side 2-3 parcels — this is how developers actually decide |
| **"Variance needed?"** indicator | The #1 question a developer asks. Binary yes/no with explanation. |
| **Nearby activity** | How many active permits within 0.5 mi? Shows market momentum. |
| **Plain English zoning summary** | "You can build a 50-story mixed-use tower here by right" not "FAR 25.0, Height 625ft" |

---

## Revised Product Framing

### For Investors (demo mode)
Show the full intelligence stack: dark panel, agent alerts, 3D envelope, climate overlays. This proves the technology.

### For Developer Users (product mode)
Lead with the **site card** — plain language, decision-oriented. 3D and analytics are tools you go deeper into when needed.

### For City Planner Users (product mode)
Lead with the **compliance checklist** + **community impact dashboard**. Show them what approving a project means for heat exposure, displacement, and infrastructure.

---

## Implementation Priority

| Priority | What | Time | Impact |
|----------|------|------|--------|
| 1 | Plain-language site card | 1 hr | Makes the product instantly understandable |
| 2 | "Deal killers" section | 30 min | Shows Polymetron catches what others miss |
| 3 | Compare mode (2-3 parcels) | 1.5 hr | How developers actually make decisions |
| 4 | "Variance needed?" indicator | 15 min | Most asked question in RE development |
| 5 | Cost estimate row | 15 min | Connects zoning to money |
| 6 | 3D as drill-down (not default) | 30 min | Reduces confusion, makes 3D more impactful when shown |

---

## The Narrative Shift

**Before:** "Look at our 3D zoning envelopes with climate risk color overlays"
(Impressive tech, unclear value)

**After:** "Tell us a site. In 10 seconds we'll tell you what you can build, what it'll cost, and what could kill the deal — including climate risks no one else checks."
(Clear value, technology is the enabler)
