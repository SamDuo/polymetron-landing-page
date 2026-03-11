/* =========================================================
   POLYMETRON — Main JS
   Mapbox + AI Chat + Scoring + Animations
   ========================================================= */

// ============================================================
// CONFIGURATION — Token is loaded from config.css CSS variable
// Set --mapbox-token in config.css (add that file to .gitignore)
// ============================================================
const MAPBOX_TOKEN = getComputedStyle(document.documentElement)
  .getPropertyValue('--mapbox-token')
  .trim()
  .replace(/^['"]|['"]$/g, '');

const ATL_CENTER = [-84.388, 33.749]; // Atlanta, GA
const HAS_TOKEN = MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.');

if (HAS_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

/* =========================================================
   1. SCROLL ANIMATIONS
   ========================================================= */
const animEls = document.querySelectorAll('[data-anim]');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
animEls.forEach(el => obs.observe(el));

/* =========================================================
   2. NAV SCROLL SHADOW
   ========================================================= */
const topbar = document.getElementById('topbar');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(() => { topbar.classList.toggle('scrolled', window.scrollY > 10); ticking = false; }); ticking = true; }
}, { passive: true });

/* =========================================================
   3. SMOOTH ANCHOR SCROLLING
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); const top = t.getBoundingClientRect().top + window.scrollY - topbar.offsetHeight - 16; window.scrollTo({ top, behavior: 'smooth' }); }
  });
});

/* =========================================================
   4. MODAL
   ========================================================= */
const modal = document.getElementById('demo-modal');
function openModal() { modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMobile(); } });

/* =========================================================
   5. MOBILE NAV
   ========================================================= */
const mobileNav = document.getElementById('mobile-nav');
function openMobile() { mobileNav.classList.add('is-open'); mobileNav.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeMobile() { mobileNav.classList.remove('is-open'); mobileNav.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.querySelectorAll('[data-toggle-mobile]').forEach(b => b.addEventListener('click', () => mobileNav.classList.contains('is-open') ? closeMobile() : openMobile()));
document.querySelectorAll('[data-close-mobile]').forEach(b => b.addEventListener('click', closeMobile));

/* =========================================================
   6. FORM
   ========================================================= */
const demoForm = document.getElementById('demo-form');
const statusNode = document.getElementById('demo-form-status');
function setStatus(msg, err) { if (statusNode) { statusNode.textContent = msg; statusNode.classList.toggle('error', !!err); } }

demoForm.addEventListener('submit', async function(e) {
  e.preventDefault(); setStatus('', false);
  const fd = new FormData(demoForm);
  const endpoint = demoForm.getAttribute('data-formspree-endpoint') || '';
  if (endpoint && !endpoint.includes('REPLACE_WITH_YOUR_FORM_ID')) {
    const btn = demoForm.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await fetch(endpoint, { method:'POST', body:fd, headers:{ Accept:'application/json' } });
      if (!r.ok) throw new Error();
      setStatus('Request sent! We\'ll be in touch.', false); demoForm.reset();
    } catch { setStatus('Submission failed. Try email fallback.', true); }
    finally { btn.disabled = false; btn.textContent = 'Send Request'; }
    return;
  }
  const s = encodeURIComponent('Demo Request — Polymetron');
  const b = encodeURIComponent(`Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\nCompany: ${fd.get('company')}\n\nMessage:\n${fd.get('message')}`);
  setStatus('Opening your email app…', false);
  window.location.href = `mailto:samduong@polymetron.org?subject=${s}&body=${b}`;
  setTimeout(() => { demoForm.reset(); closeModal(); }, 400);
});

/* =========================================================
   7. MAPBOX — HERO 3D FLY-OVER
   ========================================================= */
function initHeroMap() {
  if (!HAS_TOKEN) {
    // Fallback: styled div with animated gradient
    const el = document.getElementById('hero-map');
    el.style.background = 'linear-gradient(135deg, #0a1a12 0%, #1a3828 30%, #0f2018 60%, #162720 100%)';
    el.innerHTML = '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:40px 40px;animation:gridPan 20s linear infinite"></div>';
    const style = document.createElement('style');
    style.textContent = '@keyframes gridPan{0%{background-position:0 0}100%{background-position:40px 40px}}';
    document.head.appendChild(style);
    return;
  }
  const map = new mapboxgl.Map({
    container: 'hero-map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: ATL_CENTER,
    zoom: 11,
    pitch: 60,
    bearing: -20,
    interactive: false,
    attributionControl: false
  });
  map.on('load', () => {
    // Slow rotation
    function rotate() {
      map.rotateTo(map.getBearing() + 0.03, { duration: 0 });
      requestAnimationFrame(rotate);
    }
    rotate();
    // Add 3D terrain if available
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
  });
}

/* =========================================================
   8. MAPBOX — ISOCHRONE DEMO (Pillar 1)
   ========================================================= */
let isoMap, isoMarker;

function initIsoMap() {
  if (!HAS_TOKEN) {
    const el = document.getElementById('iso-map');
    el.style.background = 'linear-gradient(135deg, #e8e4dc 0%, #d4ddd0 100%)';
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.9rem;text-align:center;padding:24px">
      <div><p style="margin-bottom:8px;font-weight:600">Interactive map coming soon</p></div>
    </div>`;
    return;
  }

  isoMap = new mapboxgl.Map({
    container: 'iso-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: ATL_CENTER,
    zoom: 12,
    attributionControl: false
  });

  isoMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

  isoMarker = new mapboxgl.Marker({ color: '#1b3a2d', draggable: true })
    .setLngLat(ATL_CENTER)
    .addTo(isoMap);

  isoMarker.on('dragend', () => fetchIsochrone(isoMarker.getLngLat()));
  isoMap.on('click', (e) => { isoMarker.setLngLat(e.lngLat); fetchIsochrone(e.lngLat); });

  isoMap.on('load', () => {
    // 3 concentric drive-time zones: 30 min first (largest, rendered below smaller)
    [30, 20, 10].forEach(mins => {
      isoMap.addSource(`iso-${mins}`, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    });
    isoMap.addLayer({ id:'iso-30', type:'fill', source:'iso-30', paint:{ 'fill-color':'rgba(192,83,44,0.15)', 'fill-outline-color':'rgba(192,83,44,0.5)' } });
    isoMap.addLayer({ id:'iso-20', type:'fill', source:'iso-20', paint:{ 'fill-color':'rgba(138,122,60,0.2)', 'fill-outline-color':'rgba(138,122,60,0.6)' } });
    isoMap.addLayer({ id:'iso-10', type:'fill', source:'iso-10', paint:{ 'fill-color':'rgba(44,107,79,0.2)', 'fill-outline-color':'rgba(44,107,79,0.6)' } });

    fetchIsochrone({ lng: ATL_CENTER[0], lat: ATL_CENTER[1] });
  });
}

async function fetchIsochrone(lngLat) {
  if (!HAS_TOKEN) return;
  const durations = [10, 20, 30];
  for (const mins of durations) {
    try {
      const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lngLat.lng},${lngLat.lat}?contours_minutes=${mins}&polygons=true&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (isoMap.getSource(`iso-${mins}`)) isoMap.getSource(`iso-${mins}`).setData(data);
    } catch (err) { console.log(`Drive-time ${mins}min error:`, err); }
  }
}

/* =========================================================
   9. AI CHAT ANIMATION (Pillar 2)
   ========================================================= */
function initChat() {
  const chatEl = document.getElementById('chat-messages');
  const resultsEl = document.getElementById('chat-results');

  const conversation = [
    { type: 'user', text: 'Find parcels within 5 miles of a substation, zoned industrial, outside the 100-year floodplain.' },
    { type: 'ai', text: 'Searching Atlanta metro area. Querying parcel geometries against utility network layer...' },
    { type: 'ai', text: 'Found <code>847 parcels</code> near substations. Filtering by IND zoning and FEMA Zone X...' },
    { type: 'ai', text: 'Result: <code>23 parcels</code> match all criteria. Top 3 ranked by composite score:' },
    { type: 'results', cards: [
      { title: 'ATL-2847 · Industrial · 12.4 ac', detail: 'Score: 92 · 0.2 mi from substation · Zone X' },
      { title: 'ATL-1293 · Mixed Industrial · 8.1 ac', detail: 'Score: 78 · 0.8 mi from substation · Zone X' },
      { title: 'ATL-0584 · Light Industrial · 5.7 ac', detail: 'Score: 61 · 1.2 mi from substation · Zone X' },
    ]},
    { type: 'user', text: 'Show me the flood risk assessment for ATL-2847.' },
    { type: 'ai', text: 'ATL-2847 sits in <code>FEMA Zone X</code> (minimal flood risk). Nearest 100-year floodplain boundary is <code>0.4 miles</code> east. No historical flood events recorded. Climate projection: low vulnerability through 2050.' },
  ];

  let chatStarted = false;

  // Start chat when section is visible
  const chatObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !chatStarted) {
      chatStarted = true;
      playChat(conversation, chatEl, resultsEl);
      chatObs.disconnect();
    }
  }, { threshold: 0.3 });
  chatObs.observe(document.getElementById('analyst'));
}

async function playChat(msgs, chatEl, resultsEl) {
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    await sleep(i === 0 ? 600 : 900);

    if (msg.type === 'user') {
      const div = document.createElement('div');
      div.className = 'msg msg-user';
      div.textContent = msg.text;
      chatEl.appendChild(div);
      chatEl.scrollTop = chatEl.scrollHeight;
    } else if (msg.type === 'ai') {
      // Show typing first
      const typing = document.createElement('div');
      typing.className = 'msg msg-ai';
      typing.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
      chatEl.appendChild(typing);
      chatEl.scrollTop = chatEl.scrollHeight;
      await sleep(1200);
      typing.innerHTML = msg.text;
      chatEl.scrollTop = chatEl.scrollHeight;
    } else if (msg.type === 'results') {
      resultsEl.innerHTML = '';
      for (const card of msg.cards) {
        await sleep(300);
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `<strong>${card.title}</strong>${card.detail}`;
        resultsEl.appendChild(div);
      }
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* =========================================================
   10. CHAT MAP (Pillar 2)
   ========================================================= */
function initChatMap() {
  if (!HAS_TOKEN) {
    const el = document.getElementById('chat-map');
    el.style.background = 'linear-gradient(135deg, #0a1a12 0%, #162720 100%)';
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:240px;color:rgba(255,255,255,.3);font-size:.8rem;text-align:center;padding:16px"><p>Map loads with Mapbox token</p></div>`;
    return;
  }

  const map = new mapboxgl.Map({
    container: 'chat-map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: ATL_CENTER,
    zoom: 11.5,
    attributionControl: false
  });

  map.on('load', () => {
    // Add sample parcel markers
    const parcels = [
      { lng: -84.42, lat: 33.77, score: 92, color: '#2c6b4f' },
      { lng: -84.35, lat: 33.74, score: 78, color: '#8a7a3c' },
      { lng: -84.37, lat: 33.71, score: 61, color: '#c0532c' },
    ];
    parcels.forEach(p => {
      const el = document.createElement('div');
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${p.color};border:2px solid #fff;box-shadow:0 0 8px ${p.color}80;`;
      new mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).addTo(map);
    });
  });
}

/* =========================================================
   11. VALUATION MAP (Pillar 3)
   ========================================================= */
function initValMap() {
  if (!HAS_TOKEN) {
    const el = document.getElementById('val-map');
    el.style.background = 'linear-gradient(135deg, #e8e4dc 0%, #d4ddd0 100%)';
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:400px;color:var(--muted);font-size:.9rem;text-align:center;padding:24px">
      <div><p style="margin-bottom:8px;font-weight:600">Interactive map coming soon</p></div>
    </div>`;
    return;
  }

  const map = new mapboxgl.Map({
    container: 'val-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-84.38, 33.75],
    zoom: 12,
    attributionControl: false
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  map.on('load', () => {
    // Simulated scored parcels as GeoJSON polygons
    const parcels = {
      type: 'FeatureCollection',
      features: generateScoredParcels()
    };

    map.addSource('parcels', { type: 'geojson', data: parcels });

    map.addLayer({
      id: 'parcels-fill',
      type: 'fill',
      source: 'parcels',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['get', 'score'],
          0, '#c0532c',
          50, '#d4704e',
          65, '#8a7a3c',
          80, '#5a8a50',
          100, '#2c6b4f'
        ],
        'fill-opacity': 0.5
      }
    });

    map.addLayer({
      id: 'parcels-outline',
      type: 'line',
      source: 'parcels',
      paint: {
        'line-color': ['interpolate', ['linear'], ['get', 'score'],
          0, '#c0532c',
          50, '#d4704e',
          65, '#8a7a3c',
          80, '#5a8a50',
          100, '#2c6b4f'
        ],
        'line-width': 1.5,
        'line-opacity': 0.8
      }
    });

    // Popup on click
    map.on('click', 'parcels-fill', (e) => {
      const props = e.features[0].properties;
      new mapboxgl.Popup({ closeButton: false, className: 'score-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${props.id}</strong><br>Score: ${props.score}/100<br>Zoning: ${props.zoning}`)
        .addTo(map);
    });
    map.on('mouseenter', 'parcels-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'parcels-fill', () => { map.getCanvas().style.cursor = ''; });
  });
}

function generateScoredParcels() {
  const features = [];
  const zonings = ['Industrial', 'Commercial', 'Mixed-Use', 'Residential', 'Light Industrial'];
  const baseCoords = [-84.42, 33.73];
  for (let i = 0; i < 30; i++) {
    const lng = baseCoords[0] + (Math.random() * 0.12);
    const lat = baseCoords[1] + (Math.random() * 0.08);
    const size = 0.003 + Math.random() * 0.004;
    const score = Math.floor(30 + Math.random() * 70);
    features.push({
      type: 'Feature',
      properties: { id: `ATL-${String(1000 + i).padStart(4, '0')}`, score, zoning: zonings[Math.floor(Math.random() * zonings.length)] },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat], [lng + size, lat], [lng + size, lat + size * 0.7],
          [lng, lat + size * 0.7], [lng, lat]
        ]]
      }
    });
  }
  return features;
}

/* =========================================================
   12. SCORE ARC ANIMATION
   ========================================================= */
function initScoreArcs() {
  const arcObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.arc').forEach(arc => {
          // Trigger CSS animation by resetting
          arc.style.transition = 'none';
          arc.style.strokeDashoffset = `${2 * Math.PI * 42}`;
          requestAnimationFrame(() => {
            arc.style.transition = 'stroke-dashoffset 1.5s ease-out';
            const pct = parseFloat(arc.style.getPropertyValue('--pct'));
            arc.style.strokeDashoffset = `${2 * Math.PI * 42 * (1 - pct / 100)}`;
          });
        });
        arcObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.val-demo').forEach(el => arcObs.observe(el));
}

/* =========================================================
   13. INITIALIZE
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initHeroMap();
  initIsoMap();
  initChat();
  initChatMap();
  initValMap();
  initScoreArcs();
});
