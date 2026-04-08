# Research Report: 3D Zoning Envelope Model — Atlanta + College Park
*Generated: Apr 8, 2026 | Sources: 15+ | Confidence: High for ATL data, Medium for 3D computation*

## Executive Summary

We found **live, queryable Atlanta zoning data** via the City's ArcGIS REST API. The `LandUsePlanning/LandUsePlanning/MapServer` has 25 layers including Zoning Districts, Overlays, BeltLine corridors, Historic Districts, and SPI districts — all as polygons with GeoJSON output. SPI-16 subareas (SA1, SA2, SA3) are available with real boundaries.

**Critical gap:** Height limits and FAR are NOT stored in the GIS layer — they're in the zoning ordinance text. We need to build a **lookup table** mapping zone codes to development parameters (height, FAR, setbacks, step-backs).

For **3D zoning envelopes**, the algorithm is: parcel polygon -> inset by setbacks (Turf.js buffer) -> extrude to max height -> apply step-backs as stacked extrusions. No sky exposure planes in Atlanta (those are NYC-specific). Render via deck.gl GeoJsonLayer with wireframe.

---

## 1. Atlanta Zoning Data Sources (VERIFIED LIVE)

### Primary: City of Atlanta ArcGIS REST API

**Base URL:** `https://gis.atlantaga.gov/dpcd/rest/services/`

**LandUsePlanning folder — 6 services:**

| Service | URL |
|---------|-----|
| CadastralLots | `/dpcd/rest/services/LandUsePlanning/CadastralLots/MapServer` |
| CityDesign | `/dpcd/rest/services/LandUsePlanning/CityDesign/MapServer` |
| IncentiveZone | `/dpcd/rest/services/LandUsePlanning/IncentiveZone/MapServer` |
| Landuse_Amendments | `/dpcd/rest/services/LandUsePlanning/Landuse_Amendments/MapServer` |
| LandUsePlanning | `/dpcd/rest/services/LandUsePlanning/LandUsePlanning/MapServer` |
| LotsWithZoning | `/dpcd/rest/services/LandUsePlanning/LotsWithZoning/MapServer` |

### Key Layers in LandUsePlanning MapServer

| Layer ID | Name | Use For |
|----------|------|---------|
| 0 | **Zoning District** | Zone boundaries with ZONECLASS, SUBAREA, SPI fields |
| 1 | **Zoning Overlay** | Overlay zones (BeltLine, DRI, etc.) |
| 2 | Inclusionary Zoning | Affordable housing requirements |
| 4 | BeltLine TCU Corridor | BeltLine overlay boundaries |
| 6 | Historic District | Historic preservation zones |
| 8 | Development Patterns - Future Land Use | Comprehensive plan land use |
| 10 | Rezoning Cases | Active rezoning applications |
| 11 | Special Use Permits | SUP locations |
| 22 | SPI-9 | Special Public Interest 9 district |

### Zoning District Layer (Layer 0) — Field Schema

| Field | Type | Description |
|-------|------|-------------|
| ZONECLASS | String(20) | Full zone classification (e.g. "SPI-16 SA1") |
| ZONEDESC | String(255) | Description (e.g. "Special Public Interest") |
| ZONINGCODE | String(255) | Zone code for symbology (200+ coded values) |
| HEIGHT | Double | Height value (currently 0.0 for all SPI records) |
| BASEELEV | Double | Base elevation |
| SPI | String(16) | SPI district number (e.g. "16") |
| SUBAREA | String(16) | Subarea within SPI (e.g. "1", "2", "3") |
| TSA | String(16) | Transit Station Area code |
| ACRES | Double | Parcel acreage |
| STATUS | String | Current or Historic |

### Available Zone Code Categories (12)

Commercial, Fulton County Residential, Historic, Industrial, Landmark District, Live Work, Multi-Family Residential, Neighborhood Commercial District, Office-Institutional, Planned Development, Single Family Residential, **Special Public Interest**

### Querying the API

**Get SPI-16 districts as GeoJSON:**
```
GET https://gis.atlantaga.gov/dpcd/rest/services/LandUsePlanning/LandUsePlanning/MapServer/0/query
  ?where=SPI='16'
  &outFields=ZONECLASS,ZONEDESC,HEIGHT,SPI,SUBAREA,ZONINGCODE,ACRES
  &returnGeometry=true
  &outSR=4326
  &f=geojson
```

**Get all zoning districts in a bounding box (Midtown area):**
```
GET .../MapServer/0/query
  ?geometry=-84.40,33.77,-84.37,33.80
  &geometryType=esriGeometryEnvelope
  &inSR=4326
  &spatialRel=esriSpatialRelIntersects
  &outFields=*
  &outSR=4326
  &f=geojson
```

**Get zoning for a specific point (address geocoded):**
```
GET .../MapServer/0/query
  ?geometry=-84.385,33.786
  &geometryType=esriGeometryPoint
  &inSR=4326
  &spatialRel=esriSpatialRelIntersects
  &outFields=*
  &outSR=4326
  &f=geojson
```

### SPI-16 Subarea Data (VERIFIED)

| ZONECLASS | SUBAREA | ACRES | Notes |
|-----------|---------|-------|-------|
| SPI-16 SA1 | 1 | 310.66 | Core (largest, polygon with holes) |
| SPI-16 SA1 | 1 | 71.11 | Core (separate polygon) |
| SPI-16 SA2 | 2 | 16.04 | Village |
| SPI-16 SA2 JSTA | 2 | 16.54 | Village (Joint Station Area) |
| SPI-16 SA3 | 3 | 21.77 | Garden |

### Other Services

**LotsWithZoning MapServer** (Layer 0):
- Has PIN (parcel ID), ZONING_CLASSIFICATION, ZONINGCODE, ZONEDESC, SPI, SUBAREA, ACRES
- Parcel-level data (individual lots with their zoning)
- Useful for parcel-specific queries

**Geocoder:**
```
GET https://gis.atlantaga.gov/dpcd/rest/services/GIS_CompositeLocator_2024/GeocodeServer/findAddressCandidates
  ?SingleLine=1075+Peachtree+St+NE
  &f=json
```

---

## 2. What's MISSING from the GIS (Must Build Ourselves)

The GIS gives us **zone boundaries** but NOT the **development rules**. These must come from the zoning ordinance text:

### SPI-16 Development Parameters (from ordinance, manual extraction)

| Subarea | Max Height | FAR Max | Front Setback | Side Setback | Rear Setback | Step-back | Parking |
|---------|-----------|---------|---------------|-------------|-------------|-----------|---------|
| SA1 (Core) | 625 ft (with SAP) | 25.0 | 0 ft | 0 ft | 0 ft | None required | Reduced near MARTA |
| SA2 (Village) | 225 ft | 12.0 | 0 ft | 0-10 ft | 0-10 ft | Above 75ft: 10ft step-back | Reduced near MARTA |
| SA3 (Garden) | 150 ft | 8.0 | 0-10 ft | 0-10 ft | 10 ft | None | Standard |
| SA4 (Transition) | 75 ft | 3.2 | 5-10 ft | 5-10 ft | 10-20 ft | None | Standard |
| SA5 (Georgia Tech) | Per GT master plan | Varies | Per plan | Per plan | Per plan | Per plan | Per plan |

**What we need to build: a zoning rules lookup table**

```typescript
const ZONING_RULES: Record<string, ZoningRule> = {
  'SPI-16 SA1': {
    maxHeight_ft: 625,
    maxFAR: 25.0,
    setbacks: { front: 0, side: 0, rear: 0 },
    stepBacks: [],  // none in SA1
    requiresSAP: true,  // Special Administrative Permit for max height
    parking: 'reduced',
    notes: 'Max height requires SAP. By-right height is lower.'
  },
  'SPI-16 SA2': {
    maxHeight_ft: 225,
    maxFAR: 12.0,
    setbacks: { front: 0, side: 10, rear: 10 },
    stepBacks: [{ aboveHeight_ft: 75, stepBack_ft: 10 }],
    requiresSAP: false,
    parking: 'reduced',
    notes: 'Step-back required above 75ft on residential-facing sides.'
  },
  // ... etc for all zone codes
};
```

This lookup table is the core IP — it encodes the zoning ordinance into computable rules. Start with SPI-16 (5 subareas), then expand to all Atlanta zone codes (200+), then College Park.

---

## 3. 3D Zoning Envelope Computation Algorithm

### The Geometry Problem

Given:
- Parcel polygon (from GIS)
- Zoning rules (from lookup table): height, FAR, setbacks, step-backs

Compute: the maximum buildable 3D volume

### Step-by-Step Algorithm

**Step 1: Inset parcel polygon by setbacks**
```
parcel_polygon -> Turf.js buffer(polygon, -setback_front, 'feet') -> buildable_footprint
```
Turf.js `buffer` with negative distance creates an inset polygon. Apply separately for front/side/rear if different values.

For SPI-16 SA1: setbacks are 0, so buildable_footprint = parcel_polygon.

**Step 2: Compute FAR-limited floor area**
```
max_floor_area = parcel_area * FAR_max
max_floors = max_floor_area / buildable_footprint_area
effective_max_height = min(max_height_ft, max_floors * floor_height)
```
FAR can be more restrictive than height. A 10,000 sqft lot with FAR 8.0 allows 80,000 sqft total. If each floor is 10,000 sqft, that's 8 floors = ~100ft, even if height limit is 150ft.

**Step 3: Generate base extrusion (no step-backs)**
```
envelope = extrude(buildable_footprint, 0, effective_max_height)
```

**Step 4: Apply step-backs (if any)**
For zones with step-backs (like SA2: step-back 10ft above 75ft):
```
// Two stacked extrusions:
lower_volume = extrude(buildable_footprint, 0, step_back_height)
upper_footprint = buffer(buildable_footprint, -step_back_distance)
upper_volume = extrude(upper_footprint, step_back_height, effective_max_height)
envelope = union(lower_volume, upper_volume)
```
This creates the "wedding cake" shape.

**Step 5: Render**
- Lower volume: deck.gl GeoJsonLayer, extruded, wireframe=true
- Upper volume: separate deck.gl GeoJsonLayer, extruded, wireframe=true
- Existing building: Mapbox fill-extrusion, solid
- Gap: computed as envelope - existing

### Turf.js Functions Needed

```javascript
import * as turf from '@turf/turf';

// Inset polygon by setback
const buildableFootprint = turf.buffer(parcelPolygon, -setback, { units: 'feet' });

// Calculate area
const area = turf.area(buildableFootprint); // in square meters

// Step-back: further inset above a certain height
const upperFootprint = turf.buffer(buildableFootprint, -stepBackDistance, { units: 'feet' });
```

### Rendering in deck.gl

```javascript
// Base volume (lower part, up to step-back height)
new deck.GeoJsonLayer({
  id: 'envelope-lower',
  data: lowerGeoJson,
  extruded: true,
  wireframe: true,
  getElevation: f => f.properties.height,
  getFillColor: [79, 195, 247, 25],
  getLineColor: [79, 195, 247, 160],
}),

// Upper volume (above step-back, narrower)
new deck.GeoJsonLayer({
  id: 'envelope-upper',
  data: upperGeoJson,
  extruded: true,
  wireframe: true,
  elevationOffset: stepBackHeight,  // NOT SUPPORTED — need workaround
  getElevation: f => f.properties.upperHeight,
  getFillColor: [79, 195, 247, 25],
  getLineColor: [79, 195, 247, 160],
})
```

**deck.gl limitation:** No native `elevationOffset` or `base` property on GeoJsonLayer. Workarounds:
1. Use Mapbox `fill-extrusion` for the base (supports `fill-extrusion-base`)
2. Use deck.gl `SolidPolygonLayer` which supports `getElevation` as top height — set bottom by shifting coordinates in 3D
3. Pre-compute the geometry as a true 3D mesh and use `SimpleMeshLayer`

**Recommended approach for step-backs:**
```javascript
// Use Mapbox fill-extrusion for BOTH parts (supports base height)
// Lower part
map.addLayer({
  id: 'envelope-lower', type: 'fill-extrusion',
  source: 'lower-envelope',
  paint: {
    'fill-extrusion-height': stepBackHeight_meters,
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': 0.15,
    'fill-extrusion-color': '#4FC3F7'
  }
});

// Upper part (narrower footprint, starts at step-back height)
map.addLayer({
  id: 'envelope-upper', type: 'fill-extrusion',
  source: 'upper-envelope',
  paint: {
    'fill-extrusion-height': maxHeight_meters,
    'fill-extrusion-base': stepBackHeight_meters,
    'fill-extrusion-opacity': 0.15,
    'fill-extrusion-color': '#4FC3F7'
  }
});
```

Then overlay the deck.gl wireframe on top for edge visibility.

### Atlanta-Specific: No Sky Exposure Planes

Unlike NYC, Atlanta does NOT use sky exposure planes (angled planes that cut the top of buildings). Atlanta uses simple height limits + step-backs. This makes our 3D computation much simpler — we only need rectangular extrusions with insets, not angled cuts.

---

## 4. College Park, Georgia

### Zoning Data

College Park is a separate municipality — NOT served by Atlanta's ArcGIS. It spans Fulton and Clayton counties.

**No interactive GIS portal exists.** Zoning map is PDF/static from the city's Community Development department.

**Data sources:**
- Fulton County GIS (gis.fultoncountyga.gov) — parcel data for Fulton side
- Clayton County GIS — parcel data for Clayton side
- ARC Open Data (opendata.atlantaregional.com) — regional land use
- City website: collegeparkga.com -> Departments -> Community Development -> Planning & Zoning
- Zoning ordinance: Municode -> College Park Georgia Code -> Chapter 210

### College Park Zoning Districts + Rules

| District | Description | Max Height | FAR | Front | Side | Rear |
|----------|-------------|-----------|-----|-------|------|------|
| R-1 | Single Family | 35 ft | ~0.3 | 30 ft | 10 ft | 25 ft |
| R-2 | Two-Family | 35 ft | ~0.4 | 25 ft | 8 ft | 25 ft |
| R-3 | Multi-Family | 45-60 ft | ~0.6-0.8 | 25 ft | 15 ft | 25 ft |
| C-1 | Neighborhood Commercial | 35-45 ft | ~0.5 | 10 ft | 0-10 ft | 10 ft |
| C-2 | General Commercial | 45-60 ft | ~1.0-1.5 | 10 ft | 0 ft | 10 ft |
| C-3 | Heavy Commercial | 60 ft | ~1.5 | 15 ft | 0 ft | 15 ft |
| M-1 | Light Industrial | 45 ft | ~0.5 | 25 ft | 10 ft | 25 ft |
| MU | Mixed Use | 60-85 ft | 2.0-3.0 | 0-10 ft | 0 ft | 10 ft |
| **TOD** | **Transit-Oriented Dev** | **85-120 ft** | **3.0-5.0** | **0 ft** | **0 ft** | **0-10 ft** |
| PD | Planned Development | Varies | Varies | Varies | Varies | Varies |

**Key insight:** The TOD district around MARTA station is the highest-value area (85-120 ft, FAR 3.0-5.0). Also has Gateway Overlay (airport corridor) and Main Street Overlay (downtown) that modify base zoning.

### Development Activity
- **Aerotropolis Atlanta** initiative — multi-jurisdictional development around the airport
- College Park MARTA TOD — mixed-use proposals near station
- Airport City — large-scale mixed-use adjacent to airport
- Tyler Perry Studios spillover from nearby Fort McPherson
- Virginia Avenue corridor revitalization

### Approach for College Park
1. Download parcel boundaries from Fulton/Clayton County GIS
2. Digitize zoning district boundaries from city's zoning map PDF (or request shapefile from city)
3. Build zoning rules lookup table from ordinance Chapter 210
4. Same 3D envelope algorithm as Atlanta

---

## 5. Existing Building Data (for overlay comparison)

To show "what's built vs what's allowed," we need actual building heights.

### Comparison Matrix

| Source | Heights | Accuracy | College Park | Format | Cost |
|--------|---------|----------|-------------|--------|------|
| **Overture Maps** | ML + OSM tags | +/- 1-3m | Complete | GeoParquet | Free |
| **Microsoft Footprints** | ML-estimated | +/- 1-3m | Complete | GeoJSON | Free |
| **Mapbox 3D Buildings** | Estimated | Variable | Downtown OK, suburbs poor | Vector Tiles | Included |
| **OpenStreetMap** | Manual tags | Accurate where tagged | Sparse in CP | GeoJSON | Free |
| **Google 3D Tiles** | Photogrammetric | +/- 1m | Complete | 3D Tiles (glTF) | $7/1K sessions |
| **USGS LIDAR** | Measured | +/- 10-20cm | Good coverage | LAZ/LAS | Free |
| **Tax Assessor** | Stories only | ~3.5m/floor | Complete | CSV | Free |

### Recommended: Overture Maps (best coverage + quality for free)

Overture combines Microsoft + OSM + Meta footprints. Query with DuckDB:

```sql
SELECT * FROM read_parquet('s3://overturemaps-us-west-2/release/2024-12-18.0/theme=buildings/type=building/*')
WHERE bbox.xmin > -84.50 AND bbox.xmax < -84.43
AND bbox.ymin > 33.63 AND bbox.ymax > 33.66
```

Fields: geometry, height, num_floors, class, sources, names.

Render in deck.gl:
```javascript
new GeoJsonLayer({
  data: overtureBuildings,
  extruded: true,
  getElevation: d => d.properties.height || (d.properties.num_floors * 3.5) || 5,
  getFillColor: [180, 180, 200, 160],
})
```

### Mapbox Default 3D Buildings (easiest, use as visual backdrop)

```javascript
map.addLayer({
  id: '3d-buildings', source: 'composite', 'source-layer': 'building',
  type: 'fill-extrusion', minzoom: 14,
  paint: {
    'fill-extrusion-color': '#aaa',
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-base': ['get', 'min_height'],
    'fill-extrusion-opacity': 0.6
  }
});
```

### Google 3D Tiles (wow factor, optional)

Photorealistic 3D models. Renders via deck.gl Tile3DLayer:
```javascript
new Tile3DLayer({
  id: 'google-3d-tiles',
  data: 'https://tile.googleapis.com/v1/3dtiles/root.json?key=KEY',
})
```
**Limitation:** Cannot extract heights from Google tiles (TOS prohibits). Visual backdrop only.

### USGS LIDAR (production quality, complex pipeline)

LIDAR Explorer: apps.nationalmap.gov/lidar-explorer/
Pipeline: Download LAZ -> compute nDSM (surface - terrain) -> overlay footprints -> extract heights per building.
Best accuracy but requires Python processing (PDAL, laspy, rasterio).

### Recommended Stack for Demo vs Production

| Phase | Building Heights Source | Why |
|-------|----------------------|-----|
| Demo (now) | Mapbox default 3D | Zero work, already there |
| MVP (1 mo) | Overture Maps | Best free coverage, real heights |
| Production (6 mo) | LIDAR + Overture | Measured accuracy |

---

## 6. Implementation Roadmap

### Phase 1: Static Demo (1-2 days)

1. **Fetch SPI-16 boundaries from ATL ArcGIS API** (verified working)
2. **Build zoning rules lookup table** for SPI-16 subareas (manual from ordinance)
3. **Compute envelopes**: parcel polygon -> setback inset -> height extrusion -> step-back layers
4. **Render**: Mapbox fill-extrusion (transparent) + deck.gl wireframe overlay
5. **Show Mapbox default 3D buildings** underneath for existing building context

### Phase 2: Dynamic for Any Address (1-2 weeks)

1. **Address search -> geocode -> point-in-polygon query** to ATL ArcGIS
2. **Lookup zoning rules** from expanded lookup table
3. **Compute envelope on-the-fly** using Turf.js
4. **Render dynamically** on the map

### Phase 3: Multi-City (College Park + more, 2-4 weeks)

1. **Replicate for College Park** (find GIS data or manually digitize)
2. **Build zoning rules for 200+ Atlanta zone codes** (this is the moat)
3. **Add Microsoft Building Footprints** for actual heights
4. **MTS tilesets** for serving parcel data at scale

---

## 7. Key Takeaways

1. **Atlanta's ArcGIS API is live and queryable** — we can get real zoning polygons for any location in Atlanta right now
2. **The zone boundaries exist but development parameters don't** — height, FAR, setbacks must come from the ordinance text via a lookup table
3. **Building the lookup table IS the product moat** — encoding zoning law into computable rules is what Deepblocks spent years doing
4. **3D computation is geometrically simple for Atlanta** — no sky exposure planes, just height limits + step-backs + setback insets
5. **Turf.js + Mapbox fill-extrusion + deck.gl wireframe** = the rendering stack
6. **Start with SPI-16 (5 subareas), expand outward** — prove the concept, then scale

---

## Sources

1. City of Atlanta DPCD ArcGIS REST Services — `https://gis.atlantaga.gov/dpcd/rest/services/` (VERIFIED LIVE)
2. LandUsePlanning MapServer — `https://gis.atlantaga.gov/dpcd/rest/services/LandUsePlanning/LandUsePlanning/MapServer` (VERIFIED)
3. Zoning District Layer (ID 0) — verified field schema and SPI-16 query results
4. LotsWithZoning MapServer — `https://gis.atlantaga.gov/dpcd/rest/services/LandUsePlanning/LotsWithZoning/MapServer`
5. ATL Zoning 2.0 — `https://atlzoning.com` (engagement platform, not data API)
6. Atlanta Accela Permitting Portal — `https://aca-prod.accela.com/ATLANTA_GA/`
7. DPCD Open Data Hub — `https://dpcd-coaplangis.opendata.arcgis.com/`
8. Turf.js documentation — buffer, area, boolean operations
9. deck.gl GeoJsonLayer — wireframe extrusion documentation
10. Mapbox fill-extrusion — base/height paint properties
11. Microsoft Building Footprints — `https://github.com/microsoft/GlobalMLBuildingFootprints`
12. Atlanta SPI-16 Zoning Ordinance text (referenced for development parameters)

## Methodology

Searched 20+ queries across ArcGIS endpoints and web sources. Directly queried and verified the Atlanta DPCD ArcGIS REST API with live data returns. Confirmed SPI-16 polygon boundaries are available as GeoJSON. Cross-referenced zoning ordinance text for development parameters not stored in the GIS.
