// ══════════════════════════════════════════
// THE FLOOR — London Tech Ecosystem Map
// ══════════════════════════════════════════

const VIEW = {
  center: [51.510, -0.115],
  zoom: 12,
  minZoom: 11.5,
  maxZoom: 16,
  maxBounds: [[51.43, -0.40], [51.58, 0.10]]
};

const GEOJSON_URLS = [
  "https://raw.githubusercontent.com/radoi90/housequest-data/master/london_boroughs.geojson",
  "https://skgrange.github.io/data/london_boroughs.json"
];

let map;
let markers = [];
let eventMarkers = [];
let boroughLayers = {};
let selectedBorough = null;
let activeFilters = {};
let zoomLevel = VIEW.zoom;
let rsvps = {};
let currentUser = null;

CATEGORIES.forEach(c => { activeFilters[c.id] = true; });

document.addEventListener("DOMContentLoaded", init);

function init() {
  generateQR();
  renderLegend();
  initMap();
  bindUI();
  initSearch();
  checkJoinHash();
}

// ── QR code generator (uses external API for real QR) ──
function generateQR() {
  const joinUrl = window.location.origin + window.location.pathname + "#join";
  const svg = document.getElementById("qr-svg");
  const img = document.createElement("img");
  img.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(joinUrl) + "&format=svg&margin=0";
  img.alt = "Scan to join The Floor";
  img.style.cssText = "width:100%;height:100%;";
  svg.replaceWith(img);
  img.id = "qr-svg";
  img.className = "qr-svg";
}

// ── Handle #join hash ──
function checkJoinHash() {
  if (window.location.hash === "#join") {
    document.getElementById("apply-overlay").classList.remove("hidden");
  }
}
window.addEventListener("hashchange", checkJoinHash);

// ── SVG symbol for legend ──
const CAT_COLORS = {
  institution: "#2b4c7e",
  community:   "#c2592a",
  investor:    "#1a7a5c",
  company:     "#a63d5a",
  person:      "#6e5494"
};

function symbolSVG(kind, size, catId) {
  size = size || 11;
  const fill = (catId && CAT_COLORS[catId]) || "#0a0a0a";
  const half = size / 2;
  if (kind === "filledCircle") return `<circle cx="8" cy="8" r="${half}" fill="${fill}"/>`;
  if (kind === "openCircle")   return `<circle cx="8" cy="8" r="${half - 0.7}" fill="#fafaf7" stroke="${fill}" stroke-width="1.4"/>`;
  if (kind === "filledSquare") return `<rect x="${8-half}" y="${8-half}" width="${size}" height="${size}" fill="${fill}"/>`;
  if (kind === "openSquare")   return `<rect x="${8-half+0.7}" y="${8-half+0.7}" width="${size-1.4}" height="${size-1.4}" fill="#fafaf7" stroke="${fill}" stroke-width="1.4"/>`;
  if (kind === "diamond")      return `<rect x="${8-half}" y="${8-half}" width="${size}" height="${size}" fill="${fill}" transform="rotate(45 8 8)"/>`;
  return "";
}

// ── Legend symbols (SVG) ──
const CAT_SYMBOLS = {
  institution: `<svg width="18" height="12" viewBox="0 0 18 12"><circle cx="3" cy="6" r="2.2" fill="currentColor"/><circle cx="9" cy="6" r="2.2" fill="currentColor"/><circle cx="15" cy="6" r="2.2" fill="currentColor"/></svg>`,
  community: `<svg width="18" height="12" viewBox="0 0 18 12"><line x1="0" y1="6" x2="4" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="6" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  investor: `<svg width="18" height="14" viewBox="0 0 18 14"><polygon points="9,1 16,13 2,13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  company: `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  person: `<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`
};

let isolatedCategory = null;

function renderLegend() {
  const legend = document.getElementById("legend");
  let html = `<div class="lh"><span>Key</span><small>click to isolate</small></div>`;
  CATEGORIES.forEach(c => {
    const col = CAT_COLORS[c.id] || "#1a1a2e";
    const active = isolatedCategory === null || isolatedCategory === c.id;
    html += `<div class="row${active ? "" : " off"}" data-cat="${c.id}">
      <span class="dot" style="background:${col}"></span>
      <span class="label">${c.label}</span>
    </div>`;
  });
  legend.innerHTML = html;
  legend.querySelectorAll(".row").forEach(row => {
    row.addEventListener("click", () => {
      const cat = row.dataset.cat;
      if (isolatedCategory === cat) {
        isolatedCategory = null;
        CATEGORIES.forEach(c => { activeFilters[c.id] = true; });
      } else {
        isolatedCategory = cat;
        CATEGORIES.forEach(c => { activeFilters[c.id] = (c.id === cat); });
      }
      legend.querySelectorAll(".row").forEach(r => {
        const isActive = isolatedCategory === null || r.dataset.cat === isolatedCategory;
        r.classList.toggle("off", !isActive);
      });
      renderMarkers();
    });
  });
}

// ── Map init ──
function initMap() {
  map = L.map("map", {
    center: VIEW.center,
    zoom: VIEW.zoom,
    minZoom: VIEW.minZoom,
    maxZoom: VIEW.maxZoom,
    maxBounds: VIEW.maxBounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
    zoomSnap: 0.25,
    preferCanvas: false
  });
  map.attributionControl.setPrefix("");
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap &middot; &copy; CARTO"
  }).addTo(map);
  map.on("zoomend", () => {
    zoomLevel = map.getZoom();
    document.getElementById("zlevel").textContent = "Z " + (Math.round(zoomLevel * 10) / 10);
  });
  map.on("click", () => {
    selectBorough(null);
    closePanel();
    map.flyTo(VIEW.center, VIEW.zoom, { duration: 0.5 });
  });
  loadBoroughs();
}

// ── Borough GeoJSON ──
async function loadBoroughs() {
  let geo = null;
  for (const url of GEOJSON_URLS) {
    try {
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) continue;
      const j = await r.json();
      if (j && (j.features || j.type === "FeatureCollection")) { geo = j; break; }
    } catch (e) { /* try next */ }
  }
  const loader = document.getElementById("loader");
  if (!geo) {
    loader.querySelector(".loader-inner").classList.add("err");
    loader.querySelector(".loader-text").textContent = "COULD NOT LOAD BOROUGH DATA — REFRESH";
    return;
  }
  const sample = (geo.features || [])[0];
  const props = sample ? sample.properties || {} : {};
  const nameKey = ["name","NAME","Name","LAD13NM","LAD20NM","borough","BOROUGH","lad11nm"]
    .find(k => k in props) || "name";

  L.geoJSON(geo, {
    interactive: false,
    style: () => ({ color: "#1a1a1a", weight: 0.5, opacity: 0.55, fillOpacity: 0, dashArray: "2 3", lineJoin: "round" })
  }).addTo(map);

  L.geoJSON(geo, {
    style: () => ({ color: "#0a0a0a", weight: 1.6, opacity: 0.92, fillColor: "#0a0a0a", fillOpacity: 0, lineJoin: "round" }),
    onEachFeature: (feature, lyr) => {
      const name = (feature.properties && feature.properties[nameKey]) || "";
      boroughLayers[name] = lyr;
      const blurb = BOROUGH_BLURBS[name] || GENERIC_OUTER_BLURB;
      lyr.on("mouseover", (e) => {
        lyr.setStyle({ fillOpacity: 0.06, weight: 2.2, opacity: 1 });
        lyr.bindTooltip(`
          <div class="tip-kind">Borough</div>
          <div class="tip-title">${name || "Unknown"}</div>
          <div style="font-size:11px;line-height:1.45;">${blurb}</div>
          <div class="tip-meta"><span>London</span><span>Click to zoom</span></div>`,
          { direction: "top", offset: [0, -10], className: "borough-tip", sticky: true }
        ).openTooltip(e.latlng);
      });
      lyr.on("mousemove", (e) => { const tt = lyr.getTooltip(); if (tt) tt.setLatLng(e.latlng); });
      lyr.on("mouseout", () => { lyr.setStyle({ fillOpacity: 0, weight: 1.6, opacity: 0.92 }); lyr.unbindTooltip(); });
      lyr.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        selectBorough(name);
        map.flyToBounds(lyr.getBounds(), { padding: [60, 60], duration: 0.5 });
      });
    }
  }).addTo(map);

  loader.classList.add("hidden");
  setTimeout(() => loader.style.display = "none", 500);
  renderMarkers();
  renderEventMarkers();
}

// ── Borough selection ──
function selectBorough(name) {
  selectedBorough = name;
  const pill = document.getElementById("selected-pill");
  if (name) {
    document.getElementById("sp-name").textContent = name;
    pill.classList.add("visible");
  } else {
    pill.classList.remove("visible");
  }
  renderMarkers();
}

// ── Marker rendering ──
const CAT_PIN_ICONS = {
  institution: ``,
  community: ``,
  investor: ``,
  company: ``,
  person: ``
};

function markerIconFor(p, dim, revealed) {
  const hasEvent = FLOOR_EVENTS.some(e => e.locationId === p.id && e.isLive);
  const cls = "m-marker"
    + (p.host ? " host" : "")
    + (p.category ? " cat-" + p.category : "")
    + (dim ? " dim" : "")
    + (revealed ? " revealed" : "")
    + (hasEvent ? " live" : "");

  const eventBadge = hasEvent ? `<span class="m-event-badge"></span>` : "";
  const col = (p.category && CAT_COLORS[p.category]) || "#1a1a2e";
  const icon = (p.category && CAT_PIN_ICONS[p.category]) || "";

  const pin = `<svg class="m-pin" width="18" height="24" viewBox="0 0 24 32">
    <path d="M12 1C6.5 1 2 5.3 2 10.5c0 7.2 9 19.5 9.4 20a.8.8 0 001.2 0c.4-.5 9.4-12.8 9.4-20C22 5.3 17.5 1 12 1z" fill="white" stroke="${col}" stroke-width="2.2"/>
    <circle cx="12" cy="10" r="3" fill="${col}"/>
  </svg>`;

  const html = `
    <div class="${cls}">
      <div class="m-pin-wrap">
        ${pin}
        ${eventBadge}
      </div>
      <div class="m-line"></div>
      <div class="m-box">
        <span class="m-name">${p.name}</span>
        <span class="m-inst">${p.inst}</span>
      </div>
    </div>`;

  return L.divIcon({
    className: "m-icon-wrap",
    html: html,
    iconSize: [220, 80],
    iconAnchor: [110, 36]
  });
}

function renderMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  const tip = document.getElementById("tooltip");

  PROJECTS.forEach(p => {
    const dim = !p.host && p.category && !activeFilters[p.category];
    const revealed = !!p.host || (selectedBorough && p.borough === selectedBorough);

    const marker = L.marker(p.latlng, {
      icon: markerIconFor(p, dim, revealed),
      riseOnHover: true,
      interactive: !dim,
      zIndexOffset: p.host ? 1000 : 0
    });

    marker.on("mouseover", (e) => {
      const cat = CATEGORIES.find(c => c.id === p.category);
      const oe = e.originalEvent;
      document.getElementById("tip-kind").textContent = p.host ? "Host venue" : (cat ? cat.label : "Project");
      document.getElementById("tip-title").textContent = p.name;
      document.getElementById("tip-body").textContent = p.blurb;
      document.getElementById("tip-meta-l").textContent = p.inst;
      document.getElementById("tip-meta-r").textContent = p.borough || "";
      positionTooltip(oe.clientX, oe.clientY);
      tip.classList.add("visible");
    });
    marker.on("mousemove", (e) => positionTooltip(e.originalEvent.clientX, e.originalEvent.clientY));
    marker.on("mouseout", () => tip.classList.remove("visible"));
    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      tip.classList.remove("visible");
      // Fill the clicked pin
      document.querySelectorAll(".m-pin-wrap.active").forEach(el => el.classList.remove("active"));
      const el = e.target.getElement ? e.target.getElement() : e.target._icon;
      if (el) {
        const wrap = el.querySelector(".m-pin-wrap");
        if (wrap) wrap.classList.add("active");
      }
      showProjectDetail(p);
    });
    marker.addTo(map);
    markers.push(marker);
  });
}

function renderEventMarkers() {
  eventMarkers.forEach(m => map.removeLayer(m));
  eventMarkers = [];

  FLOOR_EVENTS.forEach(evt => {
    if (!evt.latlng || evt.isDrop) return;
    if (evt.locationId && PROJECTS.find(p => p.id === evt.locationId)) return;

    const evtCol = evt.isLive ? "#10b981" : "#1a1a2e";
    const icon = L.divIcon({
      className: "m-icon-wrap",
      html: `<div class="m-marker${evt.isLive ? ' live' : ''} revealed">
        <div class="m-pin-wrap">
          <svg class="m-pin" width="28" height="36" viewBox="0 0 16 20">
            <path d="M8 0C3.6 0 0 3.4 0 7.6c0 5.4 7.2 12 7.5 12.3.3.2.7.2 1 0C8.8 19.6 16 13 16 7.6 16 3.4 12.4 0 8 0z" fill="${evtCol}"/>
            <circle cx="8" cy="7" r="3" fill="none" stroke="white" stroke-width="1.3"/>
          </svg>
        </div>
        <div class="m-line"></div>
        <div class="m-box">
          <span class="m-name">${evt.title}</span>
          <span class="m-inst">${formatDate(evt.date)}</span>
        </div>
      </div>`,
      iconSize: [220, 80],
      iconAnchor: [110, 0]
    });
    const marker = L.marker(evt.latlng, { icon, riseOnHover: true });
    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      showEventDetail(evt);
    });
    marker.addTo(map);
    eventMarkers.push(marker);
  });
}

function positionTooltip(x, y) {
  const tip = document.getElementById("tooltip");
  tip.style.left = Math.min(x + 14, window.innerWidth - 276) + "px";
  tip.style.top = Math.min(y + 14, window.innerHeight - 160) + "px";
}

// ── Detail panel ──
function showPanel(html) {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    document.getElementById("sheet-body").innerHTML = html;
    document.getElementById("bottom-sheet").classList.add("open");
  } else {
    document.getElementById("panel-content").innerHTML = html;
    document.getElementById("detail-panel").classList.add("open");
  }
}

function closePanel() {
  document.getElementById("detail-panel").classList.remove("open");
  document.getElementById("bottom-sheet").classList.remove("open");
}

function showProjectDetail(p) {
  const cat = CATEGORIES.find(c => c.id === p.category);
  const kindLabel = p.host ? "Host Venue" : (cat ? cat.label : "Project");

  const relatedEvents = FLOOR_EVENTS.filter(e => e.locationId === p.id);
  const nearby = PROJECTS.filter(n => n.borough === p.borough && n.id !== p.id).slice(0, 5);

  let eventsHtml = "";
  if (relatedEvents.length > 0) {
    eventsHtml = `<div class="p-section">
      <div class="p-section-title">Events</div>
      ${relatedEvents.map(e => `
        <div class="p-event" data-event-id="${e.id}">
          ${e.isLive ? '<span class="p-event-live">&#9679; LIVE</span>' : ''}
          ${e.isDrop ? '<span class="p-event-drop">&#x1F512; DROP</span>' : ''}
          <div class="p-event-title">${e.title}</div>
          <div class="p-event-meta">${e.host} · ${formatDate(e.date)}</div>
          <div class="p-event-meta">${e.attendees.length} members going${e.room ? ' · Floor room' : ''}</div>
        </div>
      `).join("")}
    </div>`;
  }

  let nearbyHtml = "";
  if (nearby.length > 0) {
    nearbyHtml = `<div class="p-section">
      <div class="p-section-title">Nearby</div>
      ${nearby.map(n => `
        <div class="p-nearby" data-project-id="${n.id}">
          <div class="p-nearby-dot"></div>
          <div>
            <div class="p-nearby-name">${n.name}</div>
            <div class="p-nearby-inst">${n.inst}</div>
          </div>
        </div>
      `).join("")}
    </div>`;
  }

  const tagsHtml = p.tags ? `<div class="p-tags">${p.tags.map(t => `<span class="p-tag">${t}</span>`).join("")}</div>` : "";

  const html = `
    <div class="p-header">
      <div class="p-kind">${kindLabel}</div>
      <div class="p-title">${p.name}</div>
      <div class="p-inst">${p.inst}</div>
      <div class="p-blurb">${p.blurb}</div>
      ${tagsHtml}
    </div>
    <div class="p-section">
      <div class="p-section-title">Location</div>
      <div style="font-size:13px;font-weight:600;">${p.borough || "London"}</div>
      <div style="font-size:11px;color:var(--mute);margin-top:2px;">${BOROUGH_BLURBS[p.borough] ? BOROUGH_BLURBS[p.borough].split('.')[0] + '.' : ''}</div>
    </div>
    ${eventsHtml}
    ${nearbyHtml}
  `;

  showPanel(html);
  map.flyTo(p.latlng, 14, { duration: 0.5 });

  setTimeout(() => {
    document.querySelectorAll(".p-event[data-event-id]").forEach(el => {
      el.addEventListener("click", () => {
        const evt = FLOOR_EVENTS.find(e => e.id === el.dataset.eventId);
        if (evt) showEventDetail(evt);
      });
    });
    document.querySelectorAll(".p-nearby[data-project-id]").forEach(el => {
      el.addEventListener("click", () => {
        const proj = PROJECTS.find(p => p.id === el.dataset.projectId);
        if (proj) showProjectDetail(proj);
      });
    });
  }, 50);
}

function showEventDetail(evt) {
  const isGoing = rsvps[evt.id];
  const attendees = evt.attendees.map(id => MEMBERS.find(m => m.id === id)).filter(Boolean);

  let roomHtml = "";
  if (evt.room) {
    const isMember = currentUser && currentUser.isMember;
    if (isMember) {
      roomHtml = `<div class="p-section">
        <div class="p-section-title">Floor Room</div>
        <div class="room-card" data-event-id="${evt.id}">
          <div class="room-emblem">F</div>
          <div class="room-name">${evt.room.name}</div>
          <div class="room-status">&#x2713; Member access unlocked</div>
        </div>
      </div>`;
    } else {
      roomHtml = `<div class="p-section">
        <div class="p-section-title">Floor Room</div>
        <div class="room-card" style="cursor:default;">
          <div class="room-emblem" style="opacity:0.3;">F</div>
          <div class="room-name">${evt.room.name}</div>
          <div class="room-status room-locked">&#x1F512; Members only</div>
          <div style="font-size:11px;color:var(--mute);margin-top:8px;">Join The Floor to unlock access</div>
        </div>
      </div>`;
    }
  }

  let dropHtml = "";
  if (evt.isDrop) {
    dropHtml = `<div class="p-section" style="text-align:center;padding:24px;">
      <div style="font-size:32px;margin-bottom:12px;">&#x1F512;</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;">Event dropping soon</div>
      <div style="font-size:12px;color:var(--mute);">Location revealed 48 hours before. Members get first access.</div>
    </div>`;
  }

  const html = `
    <div class="p-header">
      <div class="p-kind">${evt.isLive ? '<span style="color:#1a7a3a;">&#9679; LIVE NOW</span>' : (evt.isDrop ? 'Upcoming Drop' : 'Event')}</div>
      <div class="p-title">${evt.title}</div>
      <div class="p-inst">${evt.host}</div>
      <div class="p-blurb">${evt.description}</div>
      <div style="margin-top:10px;">
        <div style="font-family:var(--mono);font-size:9px;letter-spacing:0.1em;color:var(--mute);">
          ${formatDate(evt.date)} · ${formatTime(evt.date)} — ${formatTime(evt.endDate)}
        </div>
        <div style="font-size:12px;margin-top:4px;">${evt.venue}</div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--mute);margin-top:4px;">
          ${evt.access === 'members' ? '&#x1F512; FLOOR MEMBERS' : '&#x1F310; PUBLIC'} · ${evt.relationship.toUpperCase()}
        </div>
      </div>
    </div>
    ${dropHtml}
    ${!evt.isDrop ? `<div class="p-section">
      <button class="rsvp-btn${isGoing ? ' going' : ''}" data-event-id="${evt.id}">
        ${isGoing ? '&#x2713; GOING' : "I'M GOING"}
      </button>
    </div>` : ''}
    ${roomHtml}
    ${attendees.length > 0 ? `<div class="p-section">
      <div class="p-section-title">Attending (${attendees.length})</div>
      ${attendees.map(a => `
        <div class="p-attendee">
          <div class="p-avatar">${a.avatar}</div>
          <div class="p-attendee-info">
            <div class="a-name">${a.name}</div>
            <div class="a-role">${a.role} · ${a.org}</div>
          </div>
        </div>
      `).join("")}
    </div>` : ''}
  `;

  showPanel(html);
  if (evt.latlng) map.flyTo(evt.latlng, 14, { duration: 0.5 });

  setTimeout(() => {
    document.querySelectorAll(".rsvp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const eid = btn.dataset.eventId;
        rsvps[eid] = !rsvps[eid];
        btn.classList.toggle("going");
        btn.innerHTML = rsvps[eid] ? "&#x2713; GOING" : "I'M GOING";
      });
    });
    document.querySelectorAll(".room-card[data-event-id]").forEach(card => {
      card.addEventListener("click", () => {
        const e = FLOOR_EVENTS.find(ev => ev.id === card.dataset.eventId);
        if (e && e.room) showRoomPass(e);
      });
    });
  }, 50);
}

function showEventsPanel() {
  let html = `<div class="p-header">
    <div class="p-kind">Schedule</div>
    <div class="p-title">Floor Events</div>
    <div class="p-blurb">Upcoming gatherings across London's tech ecosystem.</div>
  </div>`;

  FLOOR_EVENTS.forEach(evt => {
    html += `<div class="p-section">
      <div class="p-event" data-event-id="${evt.id}">
        ${evt.isLive ? '<span class="p-event-live">&#9679; LIVE NOW</span>' : ''}
        ${evt.isDrop ? '<span class="p-event-drop">&#x1F512; DROP</span>' : ''}
        <div class="p-event-title">${evt.title}</div>
        <div class="p-event-meta">${evt.host} · ${evt.venue}</div>
        <div class="p-event-meta">${formatDate(evt.date)} · ${formatTime(evt.date)} — ${formatTime(evt.endDate)}</div>
        <div class="p-event-meta">${evt.attendees.length} members going${evt.room ? ' · &#x1F513; Floor room' : ''}${evt.access === 'members' ? ' · Members only' : ''}</div>
      </div>
    </div>`;
  });

  showPanel(html);

  setTimeout(() => {
    document.querySelectorAll(".p-event[data-event-id]").forEach(el => {
      el.addEventListener("click", () => {
        const evt = FLOOR_EVENTS.find(e => e.id === el.dataset.eventId);
        if (evt) showEventDetail(evt);
      });
    });
  }, 50);
}

function showRoomPass(evt) {
  const r = evt.room;
  document.getElementById("room-content").innerHTML = `
    <div class="room-pass-emblem">F</div>
    <div class="room-pass-title">${r.name}</div>
    <div class="room-pass-venue">${evt.venue}</div>
    <div class="room-pass-code">${r.code}</div>
    <div class="room-pass-instructions">${r.instructions}</div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--mute);letter-spacing:0.1em;margin-bottom:12px;">
      Opens ${formatTime(r.opens)} · Capacity ${r.capacity}
    </div>
    <div class="room-pass-status">&#x2713; Member Access Unlocked</div>
  `;
  document.getElementById("room-overlay").classList.remove("hidden");
}

// ── Search ──
function initSearch() {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove("visible"); return; }

    const projResults = PROJECTS.filter(p =>
      p.name.toLowerCase().includes(q) || p.inst.toLowerCase().includes(q) ||
      p.blurb.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.includes(q)))
    ).slice(0, 5);

    const evtResults = FLOOR_EVENTS.filter(e =>
      e.title.toLowerCase().includes(q) || e.host.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
    ).slice(0, 3);

    if (projResults.length === 0 && evtResults.length === 0) { results.classList.remove("visible"); return; }

    let html = "";
    projResults.forEach(p => {
      const cat = CATEGORIES.find(c => c.id === p.category);
      html += `<div class="sr-item" data-project-id="${p.id}">
        <div class="sr-icon">${p.host ? 'F' : (cat ? cat.label[0] : '?')}</div>
        <div class="sr-info">
          <div class="sr-name">${p.name}</div>
          <div class="sr-meta">${p.host ? 'Host' : (cat ? cat.label : '')} · ${p.borough || ''}</div>
        </div>
      </div>`;
    });
    evtResults.forEach(e => {
      html += `<div class="sr-item" data-event-id="${e.id}">
        <div class="sr-icon event">${e.isLive ? '&#9679;' : '&#x25CB;'}</div>
        <div class="sr-info">
          <div class="sr-name">${e.title}</div>
          <div class="sr-meta">Event · ${formatDate(e.date)}</div>
        </div>
      </div>`;
    });
    results.innerHTML = html;
    results.classList.add("visible");

    results.querySelectorAll(".sr-item").forEach(item => {
      item.addEventListener("click", () => {
        results.classList.remove("visible");
        input.value = "";
        input.blur();
        if (item.dataset.projectId) {
          const p = PROJECTS.find(x => x.id === item.dataset.projectId);
          if (p) showProjectDetail(p);
        } else if (item.dataset.eventId) {
          const e = FLOOR_EVENTS.find(x => x.id === item.dataset.eventId);
          if (e) showEventDetail(e);
        }
      });
    });
  });

  input.addEventListener("blur", () => {
    setTimeout(() => results.classList.remove("visible"), 200);
  });
}

// ── Date helpers ──
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

// ── UI bindings ──
function bindUI() {
  document.getElementById("zoom-in").addEventListener("click", () => map.zoomIn());
  document.getElementById("zoom-out").addEventListener("click", () => map.zoomOut());
  document.getElementById("zoom-reset").addEventListener("click", () => {
    selectBorough(null);
    closePanel();
    map.flyTo(VIEW.center, VIEW.zoom, { duration: 0.5 });
  });
  document.getElementById("selected-pill").addEventListener("click", () => {
    selectBorough(null);
    map.flyTo(VIEW.center, VIEW.zoom, { duration: 0.5 });
  });
  document.getElementById("panel-close").addEventListener("click", closePanel);
  document.getElementById("sheet-handle").addEventListener("click", closePanel);

  // Touch swipe to dismiss bottom sheet
  let touchY = 0;
  const handle = document.getElementById("sheet-handle");
  handle.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; });
  handle.addEventListener("touchmove", e => {
    if (e.touches[0].clientY - touchY > 50) closePanel();
  });

  // Events button
  document.getElementById("events-btn").addEventListener("click", showEventsPanel);

  // Join button
  document.getElementById("join-btn").addEventListener("click", () => {
    document.getElementById("apply-overlay").classList.remove("hidden");
  });
  document.getElementById("apply-close").addEventListener("click", () => {
    document.getElementById("apply-overlay").classList.add("hidden");
  });
  document.getElementById("apply-overlay").addEventListener("click", (e) => {
    if (e.target.id === "apply-overlay") document.getElementById("apply-overlay").classList.add("hidden");
  });
  document.getElementById("apply-form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("apply-form").classList.add("hidden");
    document.getElementById("apply-success").classList.remove("hidden");
    currentUser = { isMember: true, name: "New Member" };
    renderMarkers();
  });

  // Room modal close
  document.getElementById("room-close").addEventListener("click", () => {
    document.getElementById("room-overlay").classList.add("hidden");
  });
  document.getElementById("room-overlay").addEventListener("click", (e) => {
    if (e.target.id === "room-overlay") document.getElementById("room-overlay").classList.add("hidden");
  });

  // Mobile tabs
  document.querySelectorAll(".mtab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mtab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const view = tab.dataset.view;
      if (view === "map") { closePanel(); selectBorough(null); map.flyTo(VIEW.center, VIEW.zoom, { duration: 0.5 }); }
      else if (view === "events") showEventsPanel();
      else if (view === "search") document.getElementById("search-input").focus();
      else if (view === "join") document.getElementById("apply-overlay").classList.remove("hidden");
    });
  });
}
