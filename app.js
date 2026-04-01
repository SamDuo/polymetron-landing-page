/* ============================================
   POLYMETRON DEMO — App Logic
   Mapbox + Zones + Tabs + AI Chat + Charts
   ============================================ */

// ── DATA ─────────────────────────────────────
const ZONES = [
  { id:"spi16-core", name:"SPI-16 Core", lat:33.7845, lon:-84.3834, sub:"Core", maxHeight:"625 ft (with SAP)", far:"12.0 – 25.0", zoning:"SPI-16 Core Subdistrict", hazards:["Urban Heat Island"], climate:"LEED Silver minimum, Tree recompense ordinance, Cool Roof SRI ≥ 64", amendments:"Midtown DRI, Form-based code overlay, Mixed-use requirements, SAP required for all exterior work", color:"#3498db", buildScore:85, cost:"$350–450/sq ft", absorption:"18–24 mo", complexity:"High", complexityClass:"complexity-high", insight:"SAP adds 8-12 weeks. LEED Silver adds 3-5% cost but unlocks TAD incentives. Cool Roof: $2-4/sq ft premium, 3-5 year payback." },
  { id:"spi16-village", name:"Midtown Village", lat:33.7810, lon:-84.3860, sub:"Village", maxHeight:"225 ft", far:"6.0 – 12.0", zoning:"SPI-16 Village Subdistrict", hazards:["Urban Heat Island"], climate:"LEED Silver, Pedestrian-scale design standards, Active ground floor required", amendments:"Facade transparency minimum 60%, Building stepbacks above 4 stories", color:"#2980b9", buildScore:78, cost:"$300–400/sq ft", absorption:"16–20 mo", complexity:"Moderate", complexityClass:"complexity-mod", insight:"Facade transparency 60% minimum increases glass costs. Stepback requirements above 4 stories reduce leasable area by ~5%." },
  { id:"spi16-garden", name:"Midtown Garden", lat:33.7880, lon:-84.3850, sub:"Garden", maxHeight:"150 ft", far:"3.2 – 8.0", zoning:"SPI-16 Garden Subdistrict", hazards:["Urban Heat Island"], climate:"Enhanced tree canopy requirements, Residential-scale transitions", amendments:"Residential compatibility standards, Reduced parking minimums near MARTA", color:"#1abc9c", buildScore:72, cost:"$250–350/sq ft", absorption:"12–16 mo", complexity:"Moderate", complexityClass:"complexity-mod", insight:"Residential-scale transitions limit height near existing neighborhoods. Enhanced tree canopy may restrict site coverage." },
  { id:"spi16-trans", name:"Transition Zone", lat:33.7790, lon:-84.3810, sub:"Transition", maxHeight:"75 ft", far:"1.5 – 3.2", zoning:"SPI-16 Transition Subdistrict", hazards:["Urban Heat Island"], climate:"Neighborhood compatibility, Infill design standards", amendments:"Adaptive reuse incentives, Accessory dwelling unit provisions", color:"#27ae60", buildScore:58, cost:"$180–250/sq ft", absorption:"8–12 mo", complexity:"Low", complexityClass:"complexity-low", insight:"Lowest barriers to entry. Adaptive reuse incentives reduce soft costs. ADU provisions create infill opportunity." },
  { id:"gt-campus", name:"Georgia Tech / Civic", lat:33.7756, lon:-84.3963, sub:"Civic/Institutional", maxHeight:"100 ft", far:"2.0 – 4.0", zoning:"SPI-16 Civic/Institutional", hazards:["Urban Heat Island","Stormwater"], climate:"Campus sustainability plan, Green building standards, Stormwater management", amendments:"Institutional overlay, Campus master plan compliance required", color:"#8e44ad", buildScore:62, cost:"$200–300/sq ft", absorption:"12–18 mo", complexity:"Moderate", complexityClass:"complexity-mod", insight:"Campus master plan compliance required. Institutional overlay limits commercial uses." },
  { id:"beltline-east", name:"BeltLine Eastside", lat:33.7845, lon:-84.3720, sub:"BeltLine Overlay", maxHeight:"150 ft (+bonuses)", far:"3.2 + 20% bonus", zoning:"MRC-3 + BeltLine Overlay", hazards:["Urban Heat Island","Flood (Clear Creek)"], climate:"BeltLine green space connectivity, Green building incentives, Flood mitigation", amendments:"15% inclusionary housing required, Active ground floor, No surface parking facing trail", color:"#e67e22", buildScore:68, cost:"$250–350/sq ft", absorption:"14–18 mo", complexity:"Moderate", complexityClass:"complexity-mod", insight:"15% inclusionary housing required — bake into pro forma from day one. 20% FAR bonus offsets affordable unit costs. Trail adjacency = 15-20% rent premium." },
];

// ── PRE-CACHED AI RESPONSES ──────────────────
const RESPONSES = [
  {
    keywords: ["fire","high-rise","sprinkler","nfpa","20-story"],
    q: "What fire protection is required for a 20-story building in Midtown?",
    a: `<strong>High-Rise Fire Protection — SPI-16 (20-story / ~240 ft):</strong><br><br>Under the 2024 IBC with Georgia Amendments:<br><br><strong>1. Automatic Sprinkler System (IBC Section 903)</strong><br>• NFPA 13 system required throughout<br>• High-rise provisions triggered at 75 ft (IBC Section 403)<br>• Secondary water supply required<br><br><strong>2. Fire Alarm & Detection (IBC Section 907)</strong><br>• Addressable fire alarm with voice evacuation<br>• Smoke detectors in all common areas and elevator lobbies<br><br><strong>3. Standpipe System (IBC Section 905)</strong><br>• Class I standpipe in all stairwells<br>• Fire department connection at grade<br><br><strong>4. Structural Fire Resistance</strong><br>• Type I-A or I-B construction<br>• Floor assemblies: 2-hour rating<br>• Structural frame: 3-hour rating<br><br><strong>5. Emergency Systems</strong><br>• Fire service access elevator (buildings >120 ft)<br>• Stairwell pressurization<br>• Fire command center on ground floor<br><br><strong>Cost estimate:</strong> ~$15-25/sq ft for fire protection systems.`,
    sources: "IBC Section 403, IBC Section 903, GA DCA 2024 Amendments, NFPA 13"
  },
  {
    keywords: ["cool roof","roof","sri","reflectance"],
    q: "What are the cool roof requirements and cost impact?",
    a: `<strong>Atlanta Cool Roof Ordinance (25-O-1310):</strong><br><br><strong>Requirements (Effective 2025):</strong><br>• Low-slope roofs: SRI ≥ 64, solar reflectance ≥ 0.55<br>• Steep-slope roofs: SRI ≥ 25, reflectance ≥ 0.20<br>• Applies to new construction AND major reroofing (>50% of roof)<br>• Green/vegetated roofs covering ≥ 50% qualify as compliant<br>• Roofs with ≥ 75% solar panels are exempt<br><br><table><tr><th>Item</th><th>Standard</th><th>Cool Roof</th><th>Delta</th></tr><tr><td>Materials</td><td>$12-18/sqft</td><td>$14-22/sqft</td><td>+$2-4/sqft</td></tr><tr><td>Total (15K sqft roof)</td><td>$180-270K</td><td>$210-330K</td><td>+$30-60K</td></tr><tr><td>Annual HVAC savings</td><td>—</td><td>10-15% reduction</td><td>-$8-15K/yr</td></tr><tr><td><strong>Payback</strong></td><td>—</td><td>—</td><td><strong>3-5 years</strong></td></tr></table><br>Atlanta is the only city in our dataset with a mandatory cool roof ordinance.`,
    sources: "Cool Roof Ordinance 25-O-1310, LEED v4.1 Heat Island Credit"
  },
  {
    keywords: ["zoning","height","far","limit","spi-16","spi16","envelope"],
    q: "What are the SPI-16 zoning limits?",
    a: `<strong>SPI-16 Midtown — Development Envelope:</strong><br><br><table><tr><th>Subdistrict</th><th>Max Height</th><th>FAR</th><th>Key Requirement</th></tr><tr><td><strong>Core</strong></td><td>625 ft (with SAP)</td><td>12.0-25.0</td><td>SAP for all exterior work</td></tr><tr><td><strong>Village</strong></td><td>225 ft</td><td>6.0-12.0</td><td>60% facade transparency</td></tr><tr><td><strong>Garden</strong></td><td>150 ft</td><td>3.2-8.0</td><td>Residential-scale transitions</td></tr><tr><td><strong>Transition</strong></td><td>75 ft</td><td>1.5-3.2</td><td>Neighborhood compatibility</td></tr><tr><td><strong>Civic</strong></td><td>100 ft</td><td>2.0-4.0</td><td>Campus master plan compliance</td></tr></table><br><strong>Key Requirements:</strong><br>• SAP (Special Administrative Permit) required for all exterior work<br>• Active ground-floor uses mandatory<br>• Structured parking required above 100 spaces<br>• Density bonuses: up to 20% FAR increase for affordable housing<br>• Transit: MARTA Arts Center & Midtown stations reduce parking requirements`,
    sources: "SPI-16 Zoning Code, City of Atlanta Dept of City Planning"
  },
  {
    keywords: ["beltline","overlay","inclusionary","affordable"],
    q: "How does the BeltLine Overlay affect development?",
    a: `<strong>BeltLine Overlay District — Midtown Eastside:</strong><br><br><strong>Density Bonuses:</strong><br>• FAR increases up to 20% for affordable housing or public amenities<br>• Trail connectivity counts toward bonus<br><br><strong>Design Requirements:</strong><br>• Active ground-floor uses within 50 ft of trail<br>• No surface parking between building and trail<br>• 60% minimum facade transparency at ground level<br>• Building stepbacks above 4 stories<br><br><strong>Anti-Displacement (Inclusionary Zoning):</strong><br>• Developments >10 units: <strong>15% affordable units</strong> (at/below 80% AMI)<br>• OR pay in-lieu fees to BeltLine Affordable Housing Trust Fund<br>• 20-year affordability covenant recorded on property<br>• Affordable units must match market-rate in size and finish<br><br><strong>Connectivity:</strong><br>• Direct pedestrian access to BeltLine trail required<br>• Bicycle parking minimums increased 50%`,
    sources: "BeltLine Zoning Overlay, BeltLine Affordable Housing Trust Fund"
  },
  {
    keywords: ["climate","resilience","stormwater","energy","green"],
    q: "What climate resilience provisions apply?",
    a: `<strong>Atlanta Climate-Aligned Building Provisions (5 active):</strong><br><br>1. <strong>Cool Roof Ordinance (2025)</strong> — SRI ≥ 64, reflectance ≥ 0.55. Targets heat island.<br>2. <strong>Energy Benchmarking (2015)</strong> — Annual reporting for buildings >25K sq ft.<br>3. <strong>LEED Silver (SPI-16)</strong> — Mandatory for large Midtown projects.<br>4. <strong>Stormwater (2013)</strong> — First 1-inch retention via green infrastructure. Nation-leading.<br>5. <strong>Tree Protection</strong> — 75,000 new trees by 2030. Recompense for removals.<br><br><strong>Climate Resilience Plan (April 2025):</strong><br>• 59% GHG reduction by 2030<br>• 100% clean energy citywide by 2050<br>• Focus: extreme heat, drought, flooding<br><br>Atlanta has more active climate-aligned building provisions than any comparable Sun Belt city.`,
    sources: "Atlanta Climate Resilience Plan 2025, Cool Roof Ordinance, GA DCA 2024 IBC Amendments"
  },
  {
    keywords: ["value","opportunity","delta","gap","invest","market"],
    q: "Where are the development opportunities?",
    a: `<strong>Midtown Value Analysis (Fulton County, 2011-2022):</strong><br><br><strong>25,757 sales</strong> in the Midtown area. Key signals:<br><br><table><tr><th>Period</th><th>Sale/FMV Ratio</th><th>Signal</th></tr><tr><td>2012</td><td>0.79</td><td>Post-recession — 21% below assessed value</td></tr><tr><td>2017</td><td>1.35</td><td>Peak — 35% ABOVE assessed value</td></tr><tr><td>2022</td><td>1.03</td><td>Stabilized — fair market pricing</td></tr></table><br><strong>71% ratio swing</strong> from trough (0.79) to peak (1.35) in 5 years.<br><br><strong>Opportunity Zones:</strong><br>• <strong>Transition subdistrict:</strong> Lowest density, FAR 1.5-3.2. Adaptive reuse + ADU provisions.<br>• <strong>BeltLine Eastside:</strong> +20% FAR bonus offsets inclusionary. Trail = 15-20% rent premium.<br>• <strong>1,777 vacant parcels</strong> in broader Midtown — each is a buildability gap.`,
    sources: "Fulton County Tax Assessor via Georgia Tech HUP Lab"
  },
  {
    keywords: ["compare","phoenix","vs","other"],
    q: "How does Atlanta compare to Phoenix?",
    a: `<strong>Atlanta vs Phoenix — Mixed-Use Comparison:</strong><br><br><table><tr><th>Factor</th><th>Atlanta (SPI-16)</th><th>Phoenix</th></tr><tr><td>Base Code</td><td>2024 IBC + GA Amend.</td><td>IBC (2018)</td></tr><tr><td>Max Height</td><td>625 ft (with SAP)</td><td>150-250 ft</td></tr><tr><td>FAR</td><td>6.0 – 25.0</td><td>2.0 – 5.0</td></tr><tr><td>Cool Roof</td><td><strong>Yes</strong> — SRI ≥ 64</td><td>No mandate</td></tr><tr><td>Stormwater</td><td><strong>First 1" retention</strong></td><td>Basic IBC Ch. 33</td></tr><tr><td>EV Charging</td><td>No mandate</td><td><strong>2024 provisions</strong></td></tr><tr><td>LEED Mandate</td><td><strong>Silver (Midtown)</strong></td><td>None</td></tr></table><br><strong>Atlanta advantages:</strong> Higher density (FAR 25 vs 5), stronger climate code, transit (MARTA)<br><strong>Phoenix advantages:</strong> Lower regulation, newer base code, EV provisions, ~20% lower construction costs`,
    sources: "GA DCA 2024 IBC Amendments, Phoenix 2024 IBC Amendments"
  },
  {
    keywords: ["food","desert","grocery","agriculture"],
    q: "Where are the food deserts and what can be done?",
    a: `<strong>Food Desert Analysis — Atlanta:</strong><br><br><strong>Identified Tracts:</strong><br>• <strong>Tract 29</strong> (West End / NPU-T) — HVI 6.8, food desert, population 3,412. Zoned R-4A / MRC-3.<br>• <strong>Tract 89</strong> (Westside / Vine City) — HVI 7.0, food desert, population 2,062. Zoned R-5 / I-1.<br><br><strong>Applicable Zoning for Intervention:</strong><br>• <strong>Urban Agriculture Overlay</strong> — supports urban ag provisions in West End<br>• <strong>MRC-3</strong> allows ground-floor grocery with residential above (FAR 3.2, 150 ft)<br>• <strong>Westside TAD</strong> incentives available for food access development<br>• <strong>Proctor Creek Greenway</strong> environmental justice overlay in Vine City<br><br><strong>Key Takeaway:</strong> Two food desert tracts overlap with environmental justice zones. MRC-3 zoning permits mixed-use grocery development up to 150 ft — highest-impact intervention sites.`,
    sources: "atlanta-tracts.geojson, Atlanta Zoning Code — MRC-3, Westside TAD"
  },
  {
    keywords: ["stormwater","drainage","retention","green infrastructure"],
    q: "What are Atlanta's stormwater requirements?",
    a: `<strong>Atlanta Stormwater Management:</strong><br><br>Atlanta's Post-Development Stormwater Ordinance (2013) is <strong>nation-leading</strong> for a Sun Belt city:<br><br>• <strong>First 1-inch rule:</strong> All new development must manage the first 1 inch of rainfall through green infrastructure<br>• <strong>Applies to:</strong> All development disturbing ≥ 5,000 sq ft of impervious surface<br>• <strong>Methods:</strong> Bioretention, permeable pavement, green roofs, rain gardens<br><br><table><tr><th>City</th><th>Stormwater Standard</th><th>Green Infra. Mandate</th></tr><tr><td><strong>Atlanta</strong></td><td>First 1" retention</td><td><strong>Yes — mandatory</strong></td></tr><tr><td>Phoenix</td><td>Basic IBC Ch. 33</td><td>No</td></tr><tr><td>Los Angeles</td><td>LID (0.75" capture)</td><td>Yes — LID required</td></tr><tr><td>San Diego</td><td>Municipal permit</td><td>Yes — hydromod.</td></tr></table><br><strong>Key Takeaway:</strong> Atlanta's first-inch retention mandate exceeds most Sun Belt peers. Phoenix has no comparable requirement.`,
    sources: "Atlanta Post-Development Stormwater Ordinance, GA DCA 2024 IBC Amendments"
  },
];

const DEFAULT_RESPONSE = "I can analyze zoning requirements, building codes, fire protection, climate provisions, and development feasibility for any subdistrict in Midtown Atlanta. Try asking about fire codes, cool roof costs, SPI-16 zoning limits, or BeltLine overlay rules.";

// ── TIER DATA BY YEAR ────────────────────────
const TIER_BY_YEAR = {
  '2011': { fair:812, hot:201, surging:95, below:110, distressed:320 },
  '2012': { fair:650, hot:102, surging:42, below:185, distressed:412 },
  '2013': { fair:780, hot:190, surging:88, below:120, distressed:290 },
  '2014': { fair:890, hot:310, surging:180, below:85, distressed:180 },
  '2015': { fair:820, hot:280, surging:210, below:78, distressed:165 },
  '2016': { fair:760, hot:250, surging:195, below:90, distressed:170 },
  '2017': { fair:680, hot:420, surging:580, below:45, distressed:95 },
  '2018': { fair:810, hot:350, surging:410, below:62, distressed:110 },
  '2019': { fair:850, hot:310, surging:380, below:70, distressed:105 },
  '2020': { fair:780, hot:290, surging:350, below:55, distressed:90 },
  '2021': { fair:810, hot:305, surging:395, below:48, distressed:78 },
  '2022': { fair:805, hot:273, surging:300, below:51, distressed:82 },
};

// ── STATE ────────────────────────────────────
let selectedZone = null;
let markers = [];
let map;
let scoreTimer = null;

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initNav();
  initTabs();
  initChat();
  initPersona();
  initToast();
  animateCounters();

  // Map loading state
  document.getElementById('map').style.background = '#e8e6e1';
  document.getElementById('map').setAttribute('data-loading', 'true');
});

// ── MAP ──────────────────────────────────────
function initMap() {
  mapboxgl.accessToken = 'REPLACE_WITH_MAPBOX_TOKEN';
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-84.3834, 33.7845],
    zoom: 13.5,
    attributionControl: false,
  });

  map.on('load', () => {
    ZONES.forEach(z => {
      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.style.background = z.color;
      el.style.color = z.color;

      // Add hover label
      const label = document.createElement('div');
      label.className = 'zone-marker-label';
      label.textContent = z.name;
      el.appendChild(label);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([z.lon, z.lat])
        .addTo(map);

      el.addEventListener('click', () => selectZone(z));
      markers.push({ zone: z, marker, el });
    });
  });
}

// ── ZONE SELECTION ───────────────────────────
function selectZone(zone) {
  selectedZone = zone;

  // Fly to
  map.flyTo({ center: [zone.lon, zone.lat], zoom: 15, duration: 1200 });

  // Update markers
  markers.forEach(m => {
    m.el.classList.toggle('dimmed', m.zone.id !== zone.id);
    m.el.classList.toggle('selected', m.zone.id === zone.id);
  });

  // Show zone panel
  document.getElementById('panel-default').style.display = 'none';
  document.getElementById('panel-zone').style.display = 'block';

  document.getElementById('zone-name').textContent = zone.name;
  document.getElementById('zone-sub').textContent = zone.sub + ' — ' + zone.zoning;

  // Hazards
  const hc = document.getElementById('zone-hazards');
  hc.innerHTML = zone.hazards.map(h => {
    let cls = 'hazard-heat';
    if (h.toLowerCase().includes('flood')) cls = 'hazard-flood';
    if (h.toLowerCase().includes('food')) cls = 'hazard-food';
    if (h.toLowerCase().includes('storm')) cls = 'hazard-storm';
    if (h.toLowerCase().includes('noise')) cls = 'hazard-noise';
    return `<span class="hazard-chip ${cls}">${h}</span>`;
  }).join('');

  // Overview stats
  document.getElementById('zone-stats').innerHTML = `
    <div class="stat-box"><div class="ov-label">MAX HEIGHT</div><div class="stat-val">${zone.maxHeight}</div></div>
    <div class="stat-box"><div class="ov-label">FAR</div><div class="stat-val">${zone.far}</div></div>
    <div class="stat-box"><div class="ov-label">SETBACKS</div><div class="stat-val">0–10 ft</div></div>
    <div class="stat-box"><div class="ov-label">PARKING</div><div class="stat-val">Reduced (near MARTA)</div></div>
  `;
  document.getElementById('zone-amendments').textContent = zone.amendments;

  // Climate list
  document.getElementById('zone-climate').innerHTML = zone.climate.split(',').map(c =>
    `<li>${c.trim()}</li>`
  ).join('');

  // Feasibility
  document.getElementById('feas-height').textContent = zone.maxHeight;
  document.getElementById('feas-far').textContent = zone.far;
  document.getElementById('feas-cost').textContent = zone.cost;
  document.getElementById('feas-absorption').textContent = zone.absorption;
  const comp = document.getElementById('feas-complexity');
  comp.textContent = zone.complexity;
  comp.className = zone.complexityClass;
  document.getElementById('feas-insight').innerHTML = zone.insight;

  // Score animation
  animateScore(zone.buildScore);

  // Reset to overview tab
  switchTab('overview');
}

function deselectZone() {
  selectedZone = null;
  document.getElementById('panel-default').style.display = 'block';
  document.getElementById('panel-zone').style.display = 'none';
  markers.forEach(m => {
    m.el.classList.remove('dimmed', 'selected');
  });
  map.flyTo({ center: [-84.3834, 33.7845], zoom: 13.5, duration: 1000 });
}

// ── SCORE ANIMATION ──────────────────────────
function animateScore(score) {
  const arc = document.getElementById('score-arc');
  const numEl = document.getElementById('score-num');
  const circumference = 327;
  const offset = circumference - (score / 100) * circumference;

  let color = score >= 70 ? '#2c6b4f' : score >= 50 ? '#b8953a' : '#c0532c';
  arc.style.stroke = color;
  arc.style.transition = 'stroke-dashoffset 1s ease';
  setTimeout(() => { arc.style.strokeDashoffset = offset; }, 50);

  // Clear previous interval
  if (scoreTimer) clearInterval(scoreTimer);
  let current = 0;
  const step = score / 30;
  scoreTimer = setInterval(() => {
    current += step;
    if (current >= score) { current = score; clearInterval(scoreTimer); scoreTimer = null; }
    numEl.textContent = Math.round(current);
  }, 30);
}

// ── NAVIGATION ───────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');

      // Init charts when switching to value view
      if (view === 'value') initValueCharts();
      if (view === 'buildability') initBuildView();
    });
  });

  document.getElementById('btn-back').addEventListener('click', deselectZone);
}

// ── TABS ─────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

// ── AI CHAT ──────────────────────────────────
function initChat() {
  updatePresets(getActivePersona());

  document.getElementById('chat-send').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    if (input.value.trim()) { sendMessage(input.value.trim()); input.value = ''; }
  });

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('chat-send').click();
  });
}

function sendMessage(text) {
  const chat = document.getElementById('chat-messages');

  // User message
  chat.insertAdjacentHTML('beforeend', `<div class="msg msg-user">${escapeHtml(text)}</div>`);

  // Typing indicator
  chat.insertAdjacentHTML('beforeend', `<div class="typing-dots" id="typing"><span></span><span></span><span></span></div>`);
  chat.scrollTop = chat.scrollHeight;

  // Find response
  const lower = text.toLowerCase();
  let match = RESPONSES.find(r => r.keywords.some(k => lower.includes(k)));

  setTimeout(() => {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();

    const answer = match ? match.a : DEFAULT_RESPONSE;
    const sources = match ? match.sources : '';

    chat.insertAdjacentHTML('beforeend', `<div class="msg msg-ai">${answer}${sources ? `<div class="msg-sources">Sources: ${sources}</div>` : ''}</div>`);
    chat.scrollTop = chat.scrollHeight;
  }, 1500);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── PERSONA TOGGLE ───────────────────────────
const PERSONA_PRESETS = {
  developer: [
    "Fire code for high-rise",
    "Cool roof cost impact",
    "SPI-16 zoning limits",
    "Value & opportunities"
  ],
  planner: [
    "Climate resilience provisions",
    "BeltLine overlay rules",
    "Stormwater requirements",
    "Food desert intervention"
  ]
};

function initPersona() {
  document.querySelectorAll('.persona-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updatePresets(btn.dataset.persona);
    });
  });
}

function getActivePersona() {
  const active = document.querySelector('.persona-btn.active');
  return active ? active.dataset.persona : 'developer';
}

function updatePresets(persona) {
  const presets = PERSONA_PRESETS[persona] || PERSONA_PRESETS.developer;
  const container = document.getElementById('preset-btns');
  if (!container) return;
  container.innerHTML = presets.map(p =>
    `<button class="preset-btn">${p}</button>`
  ).join('');
  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.textContent));
  });
}

// ── COUNTER ANIMATION ────────────────────────
function animateCounters() {
  document.querySelectorAll('.sidebar [data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ── VALUE CHARTS ─────────────────────────────
let chartsInitialized = false;

function initValueCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  // Animate value view counters
  document.querySelectorAll('.view-value [data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const start = performance.now();
    function update(now) {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1-p,3))).toLocaleString();
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });

  const years = ['2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022'];
  const ratios = [1.00, 0.79, 1.00, 1.10, 1.07, 1.00, 1.35, 1.07, 1.02, 1.03, 1.02, 1.03];

  // Ratio line chart — premium gradient fill
  const ratioCtx = document.getElementById('ratioChart').getContext('2d');
  const gradient = ratioCtx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(44,107,79,0.15)');
  gradient.addColorStop(0.5, 'rgba(44,107,79,0.04)');
  gradient.addColorStop(1, 'rgba(44,107,79,0)');

  new Chart(ratioCtx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Sale/FMV Ratio',
        data: ratios,
        borderColor: '#1b3a2d',
        borderWidth: 2.5,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: ratios.map((r,i) => (i===1||i===6) ? 8 : 3),
        pointBackgroundColor: ratios.map((r,i) => i===1 ? '#c0532c' : i===6 ? '#2c6b4f' : '#1b3a2d'),
        pointBorderColor: ratios.map((r,i) => (i===1||i===6) ? '#fff' : '#1b3a2d'),
        pointBorderWidth: ratios.map((r,i) => (i===1||i===6) ? 3 : 0),
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1b3a2d', titleColor: '#fff', bodyColor: '#fff',
          cornerRadius: 8, padding: 10,
          titleFont: { family: 'Manrope', weight: '600' },
          bodyFont: { family: 'Manrope' },
          callbacks: {
            label: ctx => `Sale/FMV: ${ctx.parsed.y.toFixed(2)}`,
            afterLabel: ctx => {
              if (ctx.dataIndex === 1) return '↓ Post-recession trough';
              if (ctx.dataIndex === 6) return '↑ Peak — 35% above FMV';
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          min: 0.4, max: 1.6,
          grid: { color: 'rgba(226,221,212,0.5)', drawBorder: false },
          ticks: { font: { family: 'Manrope', size: 11 }, color: '#7a7267',
            callback: v => v.toFixed(1) }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Manrope', size: 11 }, color: '#7a7267' }
        }
      }
    },
    plugins: [{
      // Draw dashed reference line at y=1.0
      afterDraw(chart) {
        const yScale = chart.scales.y;
        const y = yScale.getPixelForValue(1.0);
        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(122,114,103,0.4)';
        ctx.lineWidth = 1;
        ctx.moveTo(chart.chartArea.left, y);
        ctx.lineTo(chart.chartArea.right, y);
        ctx.stroke();
        // Label
        ctx.fillStyle = '#7a7267';
        ctx.font = '10px Manrope';
        ctx.fillText('Fair Value', chart.chartArea.right - 52, y - 6);
        ctx.restore();
      }
    }]
  });

  // Delta distribution — premium horizontal bars with rounded corners and value labels
  new Chart(document.getElementById('deltaChart'), {
    type: 'bar',
    data: {
      labels: ['Fair Value (0.9-1.1)', 'Hot Market (1.1-1.3)', 'Surging (>1.3)', 'Below Market (0.7-0.9)', 'Distressed (<0.7)'],
      datasets: [{
        data: [8847, 3091, 3525, 939, 2017],
        backgroundColor: [
          'rgba(44,107,79,0.85)', 'rgba(184,149,58,0.85)', 'rgba(192,83,44,0.85)',
          'rgba(230,126,34,0.85)', 'rgba(231,76,60,0.85)'
        ],
        borderColor: ['#2c6b4f', '#b8953a', '#c0532c', '#e67e22', '#e74c3c'],
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1b3a2d', cornerRadius: 8, padding: 10,
          titleFont: { family: 'Manrope', weight: '600' },
          bodyFont: { family: 'Manrope' },
          callbacks: { label: ctx => `${ctx.parsed.x.toLocaleString()} sales` }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(226,221,212,0.4)', drawBorder: false },
          ticks: { font: { family: 'Manrope', size: 11 }, color: '#7a7267',
            callback: v => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: 'Manrope', size: 11, weight: '500' }, color: '#3d3830' }
        }
      }
    },
    plugins: [{
      // Draw value labels at end of bars
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        chart.data.datasets[0].data.forEach((val, i) => {
          const meta = chart.getDatasetMeta(0).data[i];
          ctx.fillStyle = '#1a1714';
          ctx.font = '600 11px Manrope';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toLocaleString(), meta.x + 8, meta.y);
        });
        ctx.restore();
      }
    }]
  });
}

// ── BUILDABILITY VIEW ────────────────────────
let buildInitialized = false;

function initBuildView() {
  if (buildInitialized) return;
  buildInitialized = true;

  const pills = document.getElementById('zone-pills');
  pills.innerHTML = ZONES.map((z, i) =>
    `<button class="zone-pill${i===0?' active':''}" data-zone="${z.id}" style="${i===0?'background:'+z.color+';border-color:'+z.color:''}">${z.name}</button>`
  ).join('');

  pills.querySelectorAll('.zone-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pills.querySelectorAll('.zone-pill').forEach(p => {
        p.classList.remove('active');
        p.style.background = '';
        p.style.borderColor = '';
      });
      pill.classList.add('active');
      const zone = ZONES.find(z => z.id === pill.dataset.zone);
      pill.style.background = zone.color;
      pill.style.borderColor = zone.color;
      renderBuildContent(zone);
    });
  });

  renderBuildContent(ZONES[0]);
}

function renderBuildContent(zone) {
  const el = document.getElementById('build-content');
  const scoreColor = zone.buildScore >= 70 ? '#2c6b4f' : zone.buildScore >= 50 ? '#b8953a' : '#c0532c';
  const scoreLabel = zone.buildScore >= 70 ? 'Strong' : zone.buildScore >= 50 ? 'Moderate' : 'Challenging';
  const circumference = 327;
  const offset = circumference - (zone.buildScore / 100) * circumference;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 200px;gap:16px;margin-bottom:24px;align-items:start">
      <div class="feas-card feas-permitted">
        <div class="feas-bar green"></div>
        <h4>Permitted Envelope</h4>
        <div class="feas-stat"><span>Max Height</span><strong>${zone.maxHeight}</strong></div>
        <div class="feas-stat"><span>FAR</span><strong>${zone.far}</strong></div>
        <div class="feas-stat"><span>Zoning</span><strong>${zone.sub}</strong></div>
        <div class="feas-stat"><span>Parking</span><strong>Reduced (MARTA)</strong></div>
        <div class="feas-stat"><span>Ground Floor</span><strong>Active uses</strong></div>
      </div>
      <div class="feas-card feas-practical">
        <div class="feas-bar amber"></div>
        <h4>Feasibility Assessment</h4>
        <div class="feas-stat"><span>Construction</span><strong>${zone.cost}</strong></div>
        <div class="feas-stat"><span>Absorption</span><strong>${zone.absorption}</strong></div>
        <div class="feas-stat"><span>Complexity</span><strong class="${zone.complexityClass}">${zone.complexity}</strong></div>
        <div class="feas-stat"><span>Timeline</span><strong>${zone.complexity==='High'?'8-12 wk + SAP':'4-6 weeks'}</strong></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;padding-top:12px">
        <div class="score-wrap" style="margin:0">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2ddd4" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 60 60)"
              style="transition: stroke-dashoffset 1s ease"/>
          </svg>
          <div class="score-num" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:2rem;font-weight:700;color:${scoreColor}">${zone.buildScore}</div>
        </div>
        <div style="font-size:0.78rem;color:#7a7267;margin-top:8px;text-align:center">Buildability Score</div>
        <div style="font-size:0.72rem;font-weight:600;color:${scoreColor};margin-top:2px">${scoreLabel}</div>
      </div>
    </div>
    <div class="insight-box">${zone.insight}</div>
    <div style="margin-top:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div class="insight-card border-green"><h4>Climate Impact</h4><p>Cool Roof + LEED Silver + stormwater retention. Atlanta leads Sun Belt cities in climate-aligned code.</p></div>
      <div class="insight-card border-amber"><h4>Market Signal</h4><p>Sale/FMV ratio stabilized at 1.03 (2022). Midtown at equilibrium — value creation requires development, not speculation.</p></div>
      <div class="insight-card border-red"><h4>Key Risk</h4><p>${zone.complexity === 'High' ? 'SAP review + LEED certification add 3-6 months. Factor into carry costs.' : zone.complexity === 'Low' ? 'Lower density limits upside. Best for adaptive reuse and infill.' : 'BeltLine inclusionary requirements (15%) must be in pro forma from day one.'}</p></div>
    </div>
  `;
}

// ── TOAST ─────────────────────────────────────
function initToast() {
  document.getElementById('btn-request-demo').addEventListener('click', () => {
    showToast('Demo access: samduong@polymetron.org — we\'ll set up a walkthrough within 24 hours.');
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── TIER DOUGHNUT CHART ──────────────────────
let tierChart = null;

function renderTierChart(year) {
  const d = TIER_BY_YEAR[year];
  const labels = ['Fair Value', 'Hot Market', 'Surging', 'Below Market', 'Distressed'];
  const values = [d.fair, d.hot, d.surging, d.below, d.distressed];
  const colors = [
    'rgba(44,107,79,0.85)', 'rgba(184,149,58,0.85)', 'rgba(192,83,44,0.85)',
    'rgba(230,126,34,0.85)', 'rgba(231,76,60,0.85)'
  ];

  if (tierChart) tierChart.destroy();

  tierChart = new Chart(document.getElementById('tierChart'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { family: 'Manrope', size: 11, weight: '500' },
            color: '#3d3830', padding: 14,
            usePointStyle: true, pointStyleWidth: 10,
          }
        },
        tooltip: {
          backgroundColor: '#1b3a2d', cornerRadius: 8, padding: 12,
          titleFont: { family: 'Manrope', weight: '600' },
          bodyFont: { family: 'Manrope' },
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [{
      beforeDraw(chart) {
        const { ctx } = chart;
        const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
        const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 1.6rem Manrope';
        ctx.fillStyle = '#1a1714';
        ctx.fillText(year, centerX, centerY - 10);
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        ctx.font = '500 0.72rem Manrope';
        ctx.fillStyle = '#7a7267';
        ctx.fillText(total.toLocaleString() + ' sales', centerX, centerY + 14);
        ctx.restore();
      }
    }]
  });
}

// Wire up year selector in initValueCharts
const origInitValueCharts = initValueCharts;
initValueCharts = function() {
  origInitValueCharts();

  // Populate year dropdown & init tier chart
  const yearSelect = document.getElementById('yearSelect');
  if (yearSelect && !yearSelect.children.length) {
    Object.keys(TIER_BY_YEAR).forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      if (y === '2017') opt.selected = true;
      yearSelect.appendChild(opt);
    });
    renderTierChart('2017');
    yearSelect.addEventListener('change', () => renderTierChart(yearSelect.value));
  }
};

// ── NEWS PANEL ───────────────────────────────
const NEWS = [
  { source: "Bisnow", date: "Mar 31", title: "Midtown Atlanta Sees Record Mixed-Use Permits in Q1 2026" },
  { source: "AJC", date: "Mar 30", title: "Atlanta Cool Roof Ordinance Takes Effect \u2014 What Developers Need to Know" },
  { source: "CoStar", date: "Mar 29", title: "BeltLine Eastside Trail Corridor: Rents Up 18% YoY" },
  { source: "City of Atlanta", date: "Mar 28", title: "Planning Commission Approves SPI-16 Amendment Package" },
  { source: "GlobeSt", date: "Mar 27", title: "Fulton County Assessments Lag Market by 15% \u2014 Opportunity or Risk?" },
  { source: "Urban Land", date: "Mar 26", title: "Georgia DCA Finalizes 2024 IBC Amendments \u2014 Effective Jan 2026" },
  { source: "Bisnow", date: "Mar 25", title: "Westside TAD Investment Reaches $400M \u2014 Vine City Leads Growth" },
  { source: "AJC", date: "Mar 24", title: "MARTA BRT Expansion Could Reshape Midtown Zoning Dynamics" },
];

function initNews() {
  const panel = document.getElementById('news-panel');
  const overlay = document.getElementById('news-overlay');
  const list = document.getElementById('news-list');

  list.innerHTML = NEWS.map(n => `
    <div class="news-item">
      <div class="news-source">${n.source}</div>
      <div class="news-title">${n.title}</div>
      <div class="news-date">${n.date}, 2026</div>
    </div>
  `).join('');

  document.getElementById('btn-news').addEventListener('click', () => {
    panel.classList.add('open');
    overlay.classList.add('open');
  });
  document.getElementById('news-close').addEventListener('click', closeNews);
  overlay.addEventListener('click', closeNews);

  function closeNews() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// ── MAP LEGEND ───────────────────────────────
function initMapLegend() {
  const container = document.getElementById('legend-items');
  container.innerHTML = ZONES.map(z => `
    <div class="legend-item" data-zone="${z.id}">
      <span class="legend-dot" style="background:${z.color}"></span>
      ${z.name}
    </div>
  `).join('');

  container.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const zone = ZONES.find(z => z.id === item.dataset.zone);
      if (zone) selectZone(zone);
    });
  });
}

// ── SATELLITE IMAGE ──────────────────────────
const MAPBOX_TOKEN = 'REPLACE_WITH_MAPBOX_TOKEN';

function updateSatelliteImage(zone) {
  const container = document.getElementById('satellite-img');
  const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${zone.lon},${zone.lat},15.5,0/600x280@2x?access_token=${MAPBOX_TOKEN}`;
  container.innerHTML = `
    <img src="${url}" alt="${zone.name} satellite view" loading="lazy">
    <span class="satellite-label">Satellite \u2014 ${zone.name}</span>
  `;
}

// ── PATCH: Wire new features into existing init ──
const origDOMInit = document.addEventListener;
(function patchInit() {
  const origSelectZone = selectZone;
  selectZone = function(zone) {
    origSelectZone(zone);
    updateSatelliteImage(zone);
  };
})();

// Init new features after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewFeatures);
} else {
  initNewFeatures();
}

function initNewFeatures() {
  initNews();
  initMapLegend();
}
