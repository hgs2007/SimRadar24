const IS_HTTP_CONTEXT =
  typeof window !== "undefined" && /^https?:$/i.test(window.location.protocol);
const USE_LOCAL_BACKEND =
  IS_HTTP_CONTEXT &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const VATSIM_DATA_URL = USE_LOCAL_BACKEND
  ? "/api/vatsim-data"
  : "https://data.vatsim.net/v3/vatsim-data.json";
const VATSIM_EVENTS_URL = USE_LOCAL_BACKEND ? "/api/events" : "";
const AIRPORTS_DATA_URL =
  "https://cdn.jsdelivr.net/gh/jpatokal/openflights@master/data/airports.dat";
const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const REFRESH_INTERVAL_MS = 10000;
const MAX_PHOTO_AGE_YEARS = 5;
const AIRCRAFT_MEDIA_WIDTH = 820;
const AIRLINE_LOGO_WIDTH = 640;
const AIRPORT_MEDIA_WIDTH = 900;
const MARKER_INTERPOLATION_MS = 22000;
const FOLLOW_PAN_INTERVAL_MS = 90;

const bundledAirlineNames =
  typeof window !== "undefined" && window.AIRLINE_NAMES_DATA && typeof window.AIRLINE_NAMES_DATA === "object"
    ? window.AIRLINE_NAMES_DATA
    : null;

const exactAircraftPhotoFiles = {
  "UAE|B77W": "File:Emirates Boeing 777-300ER.JPG",
  "SWA|B738": "File:N8702L Southwest Boeing 737-800.jpg",
  "DAL|A359": "File:Delta Air Lines Airbus A350-900 N512DN.jpg",
};

const localDefaultAircraftPhotos = {
  "AAL|A320": "./defaults/AAL_A320.jpg",
  "ACA|A320": "./defaults/ACA_A320.png",
  "BAW|A380": "./defaults/BAW_A380.png",
  "DAL|A359": "./defaults/DAL_A350.png",
  "DLH|A333": "./defaults/DLH_A333.png",
  "DLH|A343": "./defaults/DLH_A343.jpg",
  "DLH|A350": "./defaults/DLH_A350.png",
  "QFA|A350": "./defaults/QFA_A350.png",
  "QFA|A380": "./defaults/QFA_A380.png",
  "SHT|A320": "./defaults/SHT_A320.png",
  "UAE|A359": "./defaults/UAE_A359.png",
  "UAE|A388": "./defaults/UAE_A380.png",
  "UAE|B77W": "./defaults/UAE_B77W.png",
};

const relatedAircraftFallbacks = {
  A20N: ["A320", "A319", "A321", "A21N", "B738", "B739"],
  A21N: ["A321", "A320", "A20N", "A319"],
  A318: ["A319", "A320", "A321"],
  A319: ["A320", "A318", "A321", "A20N"],
  A320: ["A319", "A321", "A20N", "A21N"],
  A321: ["A320", "A21N", "A319", "A20N"],
  A343: ["A346", "A333", "A332", "A359"],
  A346: ["A343", "A333", "A332", "A359"],
  A332: ["A333", "A339", "A359"],
  A333: ["A332", "A339", "A359"],
  A339: ["A333", "A332", "A359"],
  A359: ["A333", "A332", "A339", "A35K", "B789"],
  A35K: ["A359", "A333", "A332", "B77W"],
  A388: ["B77W", "A359", "A35K"],
  B38M: ["B738", "B739", "B737", "A320"],
  B39M: ["B739", "B738", "B737", "A321"],
  B737: ["B738", "B739", "B38M"],
  B738: ["B737", "B739", "B38M", "A320"],
  B739: ["B738", "B737", "B39M", "A321"],
  B744: ["B748", "B77W", "A388"],
  B748: ["B744", "B77W", "A388"],
  B752: ["B738", "A321", "B739"],
  B763: ["B788", "A333", "B772"],
  B772: ["B77W", "B789", "A333", "A359"],
  B77L: ["B772", "B77W", "B789"],
  B77W: ["B772", "B789", "A359", "A333"],
  B788: ["B789", "B78X", "A333", "A359"],
  B789: ["B788", "B78X", "A359", "A333"],
  B78X: ["B789", "B788", "A359"],
  MD11: ["B763", "B772", "A333"],
  CRJ2: ["CRJ7", "CRJ9", "E170"],
  CRJ7: ["CRJ9", "CRJ2", "E175"],
  CRJ9: ["CRJ7", "CRJ2", "E190"],
  DH8D: ["AT72", "E175"],
  E170: ["E175", "CRJ9", "E190"],
  E175: ["E170", "E190", "CRJ9"],
  E75L: ["E175", "E170", "E190", "CRJ9"],
  E190: ["E195", "E175", "CRJ9"],
  E195: ["E190", "E175", "CRJ9"],
};

const fallbackAirlineNames = {
  AAL: "American Airlines",
  ACA: "Air Canada",
  AIC: "Air India",
  AFR: "Air France",
  ASA: "Alaska Airlines",
  BAW: "British Airways",
  DAL: "Delta Air Lines",
  DLH: "Lufthansa",
  EIN: "Aer Lingus",
  ETH: "Ethiopian Airlines",
  EZY: "easyJet",
  FFT: "Frontier Airlines",
  IBE: "Iberia",
  JBU: "JetBlue",
  JZA: "Jazz Aviation",
  KLM: "KLM",
  NKS: "Spirit Airlines",
  QFA: "Qantas",
  QTR: "Qatar Airways",
  RYR: "Ryanair",
  SAS: "Scandinavian Airlines",
  SIA: "Singapore Airlines",
  SWA: "Southwest Airlines",
  SWR: "Swiss",
  THY: "Turkish Airlines",
  UAL: "United Airlines",
  UAE: "Emirates",
  UPS: "UPS Airlines",
  WJA: "WestJet",
};

const airlineNameOverrides = {
  CFG: "Condor",
  MSR: "Egyptair",
  TUI: "TUI Airways",
};

const airlineDisplayNameOverrides = {
  AAL: "American Airlines",
  ACA: "Air Canada",
  AEE: "Aegean Airlines",
  AFR: "Air France",
  ANA: "ANA",
  AIC: "Air India",
  BAW: "British Airways",
  CFG: "Condor",
  DAL: "Delta Air Lines",
  DLH: "Lufthansa",
  EIN: "Aer Lingus",
  FFT: "Frontier Airlines",
  JAL: "Japan Airlines",
  JBU: "JetBlue",
  KLM: "KLM",
  MSR: "Egyptair",
  NKS: "Spirit Airlines",
  QFA: "Qantas",
  QTR: "Qatar Airways",
  RYR: "Ryanair",
  SIA: "Singapore Airlines",
  SWA: "Southwest Airlines",
  SWR: "SWISS",
  THY: "Turkish Airlines",
  TUI: "TUI Airways",
  UAE: "Emirates",
  UAL: "United Airlines",
  VIR: "Virgin Atlantic",
};

const airlineBrandColors = {
  AAL: "#c8102e",
  AIC: "#d71920",
  AFR: "#1f4fa3",
  BAW: "#2e5aac",
  DAL: "#c8102e",
  DLH: "#f6b40e",
  MSR: "#1f6fb4",
  KLM: "#00a1de",
  QFA: "#d71920",
  QTR: "#5c1635",
  SIA: "#f2c14d",
  SWA: "#304cb2",
  SWR: "#d52b1e",
  THY: "#d71920",
  UAL: "#005daa",
  UAE: "#d71920",
};

const aircraftNames = {
  A20N: "Airbus A320neo",
  A21N: "Airbus A321neo",
  A318: "Airbus A318",
  A319: "Airbus A319",
  A320: "Airbus A320",
  A321: "Airbus A321",
  A343: "Airbus A340-300",
  A346: "Airbus A340-600",
  A332: "Airbus A330-200",
  A333: "Airbus A330-300",
  A339: "Airbus A330-900neo",
  A359: "Airbus A350-900",
  A35K: "Airbus A350-1000",
  A388: "Airbus A380-800",
  AT72: "ATR 72",
  B38M: "Boeing 737 MAX 8",
  B39M: "Boeing 737 MAX 9",
  B712: "Boeing 717-200",
  B722: "Boeing 727-200",
  B737: "Boeing 737",
  B738: "Boeing 737-800",
  B739: "Boeing 737-900",
  B744: "Boeing 747-400",
  B748: "Boeing 747-8",
  B752: "Boeing 757-200",
  B763: "Boeing 767-300",
  B772: "Boeing 777-200",
  B77L: "Boeing 777-200LR",
  B77W: "Boeing 777-300ER",
  B788: "Boeing 787-8",
  B789: "Boeing 787-9",
  B78X: "Boeing 787-10",
  MD11: "McDonnell Douglas MD-11",
  C25B: "Cessna Citation CJ3",
  C56X: "Cessna Citation Excel",
  C68A: "Cessna 680 Citation Sovereign",
  CONC: "Concorde",
  CRJ2: "Bombardier CRJ-200",
  CRJ7: "Bombardier CRJ-700",
  CRJ9: "Bombardier CRJ-900",
  DH8D: "De Havilland Dash 8 Q400",
  E170: "Embraer 170",
  E175: "Embraer 175",
  E75L: "Embraer 175",
  E190: "Embraer 190",
  E195: "Embraer 195",
};

const state = {
  flights: [],
  filteredFlights: [],
  selectedId: null,
  selectedAirport: null,
  selectedAirportBoard: null,
  airportSearchResults: [],
  airportSearchIndex: [],
  map: null,
  baseLayers: {},
  markers: new Map(),
  markerVisualSignatures: new Map(),
  markerAnimations: new Map(),
  refreshTimer: null,
  lastSyncAt: null,
  routeLayers: [],
  routeOverlay: null,
  airportLookup: null,
  airportLookupPromise: null,
  airportAtis: new Map(),
  controllers: [],
  prefiles: [],
  mediaCache: new Map(),
  mediaPromiseCache: new Map(),
  imageLoadCache: new Map(),
  commonsApiCache: new Map(),
  commonsApiPromiseCache: new Map(),
  flightPhaseMemory: new Map(),
  movedFlightKeys: new Set(),
  photoRequestId: 0,
  searchRequestId: 0,
  followSelectedFlight: false,
  lastFollowPanAt: 0,
  searchPanelMinimized: false,
  recommendedDepartureAirportCode: "",
  backendEventSource: null,
  backendEventFallbackTimer: null,
  airlineNames: bundledAirlineNames
    ? {
        ...fallbackAirlineNames,
        ...bundledAirlineNames,
        ...airlineNameOverrides,
      }
    : {
        ...fallbackAirlineNames,
        ...airlineNameOverrides,
      },
};

const MOVED_FLIGHTS_STORAGE_KEY = "vatsim_tracker_moved_flights_v1";

const elements = {
  totalFlights: document.getElementById("totalFlights"),
  activeDepartures: document.getElementById("activeDepartures"),
  averageAltitude: document.getElementById("averageAltitude"),
  recommendedAirportCard: document.getElementById("recommendedAirportCard"),
  flightList: document.getElementById("flightList"),
  searchInput: document.getElementById("searchInput"),
  refreshButton: document.getElementById("refreshButton"),
  followButton: document.getElementById("followButton"),
  searchPanelHandle: document.getElementById("searchPanelHandle"),
  searchOverlayField: document.getElementById("searchOverlayField"),
  lastUpdated: document.getElementById("lastUpdated"),
  mapFloatingSearch: document.getElementById("mapFloatingSearch"),
  mapSearchMeta: document.getElementById("mapSearchMeta"),
  mapSearchExtras: document.getElementById("mapSearchExtras"),
  legend: document.querySelector(".legend"),
  detailModeLabel: document.getElementById("detailModeLabel"),
  detailCallsign: document.getElementById("detailCallsign"),
  detailBackButton: document.getElementById("detailBackButton"),
  detailStatus: document.getElementById("detailStatus"),
  detailAirlineBadge: document.getElementById("detailAirlineBadge"),
  detailFlightState: document.getElementById("detailFlightState"),
  detailFlightEta: document.getElementById("detailFlightEta"),
  aircraftPhoto: document.getElementById("aircraftPhoto"),
  detailRouteChip: document.getElementById("detailRouteChip"),
  detailGrid: document.getElementById("detailGrid"),
  routeSummary: document.getElementById("routeSummary"),
  detailPhoto: document.querySelector(".detail-photo"),
};

const detailFields = [
  "Pilot",
  "Aircraft",
  "Registration",
  "Route",
  "Scheduled Departure",
  "Ground Speed",
  "Altitude",
  "Transponder",
  "Heading",
];

const airportDetailFields = [
  "Security Check",
  "Location",
  "Departures",
  "Arrivals",
  "Weather",
  "ATIS",
  "Coordinates",
  "Search",
];

document.addEventListener("DOMContentLoaded", () => {
  loadMovedFlightKeys();
  initializeMap();
  wireEvents();
  renderFollowButton();
  renderLegend();
  startDataSync();
});

function startDataSync() {
  refreshFlights();

  if (
    typeof window !== "undefined" &&
    /^https?:$/i.test(window.location.protocol) &&
    typeof window.EventSource === "function" &&
    VATSIM_EVENTS_URL
  ) {
    connectBackendEventStream();
    return;
  }

  state.refreshTimer = window.setInterval(refreshFlights, REFRESH_INTERVAL_MS);
}

function scheduleFallbackRefreshPolling() {
  if (state.refreshTimer) {
    return;
  }

  state.refreshTimer = window.setInterval(refreshFlights, REFRESH_INTERVAL_MS);
}

function clearFallbackRefreshPolling() {
  if (!state.refreshTimer) {
    return;
  }

  window.clearInterval(state.refreshTimer);
  state.refreshTimer = null;
}

function connectBackendEventStream() {
  try {
    state.backendEventSource?.close?.();
  } catch {
    // Ignore close failures.
  }

  const eventSource = new EventSource(VATSIM_EVENTS_URL);
  state.backendEventSource = eventSource;

  eventSource.addEventListener("vatsim-update", () => {
    clearFallbackRefreshPolling();
    refreshFlights();
  });

  eventSource.addEventListener("vatsim-error", () => {
    scheduleFallbackRefreshPolling();
  });

  eventSource.onerror = () => {
    scheduleFallbackRefreshPolling();
  };
}

function initializeMap() {
  state.map = L.map("map", {
    zoomControl: false,
    preferCanvas: true,
    worldCopyJump: true,
    inertia: true,
    inertiaDeceleration: 2600,
    inertiaMaxSpeed: 1800,
    easeLinearity: 0.2,
    zoomAnimation: true,
    fadeAnimation: true,
    markerZoomAnimation: true,
    minZoom: 2,
    maxZoom: 18,
  }).setView([30, 0], 2);

  L.control.zoom({ position: "topright" }).addTo(state.map);

  state.baseLayers.satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      minZoom: 2,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    }
  );

  state.baseLayers.satellite.addTo(state.map);
}

function wireEvents() {
  let searchPanelHandleStartY = null;

  const disableFollowForManualMapInteraction = (event) => {
    if (!state.followSelectedFlight || !state.map) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;

    if (
      target?.closest(".leaflet-marker-icon") ||
      target?.closest(".leaflet-control") ||
      target?.closest(".map-toolbar") ||
      target?.closest(".map-floating-search")
    ) {
      return;
    }

    state.followSelectedFlight = false;
    renderFollowButton();
  };

  elements.searchInput.addEventListener("input", () => {
    handleSearchInput(elements.searchInput.value);
  });

  elements.refreshButton.addEventListener("click", () => {
    refreshFlights();
  });

  elements.recommendedAirportCard?.addEventListener("click", async () => {
    if (!state.recommendedDepartureAirportCode) {
      return;
    }

    const airport = await getAirportByCode(state.recommendedDepartureAirportCode);
    if (!airport) {
      return;
    }

    selectAirport(airport);
  });

  elements.followButton.addEventListener("click", () => {
    state.followSelectedFlight = !state.followSelectedFlight;
    renderFollowButton();

    const selected = state.filteredFlights.find((flight) => flight.id === state.selectedId) ||
      state.flights.find((flight) => flight.id === state.selectedId);

    if (state.followSelectedFlight && selected && Number.isFinite(selected.latitude) && Number.isFinite(selected.longitude)) {
      state.map.panTo([selected.latitude, selected.longitude], {
        animate: true,
        duration: 0.6,
      });
    }
  });

  elements.searchPanelHandle?.addEventListener("pointerdown", (event) => {
    searchPanelHandleStartY = event.clientY;
    elements.searchPanelHandle.setPointerCapture?.(event.pointerId);
  });

  elements.searchPanelHandle?.addEventListener("pointerup", (event) => {
    const startY = searchPanelHandleStartY;
    searchPanelHandleStartY = null;
    elements.searchPanelHandle.releasePointerCapture?.(event.pointerId);

    if (!Number.isFinite(startY)) {
      return;
    }

    const deltaY = event.clientY - startY;

    if (deltaY <= -16) {
      state.searchPanelMinimized = true;
    } else if (deltaY >= 16) {
      state.searchPanelMinimized = false;
    } else {
      state.searchPanelMinimized = !state.searchPanelMinimized;
    }

    updateSearchOverlayVisibility();
  });

  elements.searchPanelHandle?.addEventListener("pointercancel", () => {
    searchPanelHandleStartY = null;
  });

  elements.detailBackButton.addEventListener("click", () => {
    if (!state.selectedAirport) {
      return;
    }

    if (state.selectedAirportBoard && state.selectedId) {
      state.selectedId = null;
      renderFlightList();
      renderMarkers();
      renderAirportBoard(state.selectedAirport, state.selectedAirportBoard);
      return;
    }

    state.selectedAirportBoard = null;
    renderAirportDetail(state.selectedAirport);
  });

  const mapContainer = state.map?.getContainer?.();
  mapContainer?.addEventListener("pointerdown", disableFollowForManualMapInteraction, { passive: true });
  mapContainer?.addEventListener("wheel", disableFollowForManualMapInteraction, { passive: true });
}

  async function handleSearchInput(query, preserveAirportSelection = false) {
  const trimmed = query.trim();
  const requestId = ++state.searchRequestId;

  if (
    !preserveAirportSelection ||
    !state.selectedAirport ||
    !doesQueryMatchAirport(trimmed, state.selectedAirport)
  ) {
    state.selectedAirport = null;
    state.selectedAirportBoard = null;
  }

  if (trimmed.length >= 2) {
    state.airportSearchResults = await searchAirports(trimmed);
  } else {
    state.airportSearchResults = [];
  }

  if (requestId !== state.searchRequestId) {
    return;
  }

  applyFilter(trimmed);
}

function renderFollowButton() {
  if (!elements.followButton) {
    return;
  }

  elements.followButton.classList.toggle("is-active", state.followSelectedFlight);
  elements.followButton.setAttribute("aria-pressed", state.followSelectedFlight ? "true" : "false");
}

async function fetchJsonWithRetry(url, options = {}, retries = 1) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        cache: "no-store",
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

function describeFeedError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  if (window.location.protocol === "file:") {
    return "The browser blocked the VATSIM feed from file://. Open this project through http://localhost:8080 with serve.ps1.";
  }

  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return "The browser could not reach the VATSIM feed. Check your network, VPN, proxy, or browser privacy extensions.";
  }

  if (message.includes("abort")) {
    return "The VATSIM feed timed out before it finished loading. Try refreshing again.";
  }

  return "The VATSIM feed could not be loaded. Check network access or open the page through a local web server if your browser blocks remote fetches from file://.";
}

function loadMovedFlightKeys() {
  try {
    const raw = window.localStorage.getItem(MOVED_FLIGHTS_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const values = JSON.parse(raw);
    if (Array.isArray(values)) {
      state.movedFlightKeys = new Set(values.filter((value) => typeof value === "string" && value));
    }
  } catch {
    state.movedFlightKeys = new Set();
  }
}

function persistMovedFlightKeys() {
  try {
    window.localStorage.setItem(
      MOVED_FLIGHTS_STORAGE_KEY,
      JSON.stringify(Array.from(state.movedFlightKeys))
    );
  } catch {
    // Ignore storage failures.
  }
}

function getFlightMovementKey(callsign, departure, arrival, scheduledDepartureTime) {
  const scheduleKey =
    scheduledDepartureTime instanceof Date ? scheduledDepartureTime.toISOString() : "nofile";
  return [
    String(callsign || "").toUpperCase().trim(),
    String(departure || "").toUpperCase().trim(),
    String(arrival || "").toUpperCase().trim(),
    scheduleKey,
  ].join("|");
}

async function refreshFlights() {
  elements.lastUpdated.textContent = "Syncing VATSIM feed...";

  let flights = [];

  try {
    const data = await fetchJsonWithRetry(VATSIM_DATA_URL, {}, 1);
    await getAirportLookup();
    const pilots = Array.isArray(data.pilots) ? data.pilots : [];
    state.controllers = Array.isArray(data.controllers) ? data.controllers : [];
    state.prefiles = Array.isArray(data.prefiles) ? data.prefiles : [];
    state.airportAtis = buildAirportAtisLookup(Array.isArray(data.atis) ? data.atis : []);
    flights = pilots
      .filter((pilot) => typeof pilot.latitude === "number" && typeof pilot.longitude === "number")
      .map(normalizePilot)
      .sort((left, right) => right.groundspeed - left.groundspeed);
  } catch (error) {
    console.error(error);
      state.flights = [];
      state.filteredFlights = [];
      state.controllers = [];
      state.prefiles = [];
    state.selectedId = null;
    clearRouteLayers();
    clearMarkers();
    renderSelectedFlight();
    updateSummary([]);
    elements.lastUpdated.textContent = "Could not load VATSIM data";
    renderEmptyState(describeFeedError(error));
    return;
  }

  try {
    state.flights = flights;
    syncFlightPhaseMemory(flights);
    state.lastSyncAt = new Date();

    if (!state.selectedAirport && !state.selectedId && flights.length > 0) {
      state.selectedId = flights[0].id;
    }

    if (!state.selectedAirport && state.selectedId && !flights.some((flight) => flight.id === state.selectedId)) {
      state.selectedId = flights[0]?.id ?? null;
    }

    await handleSearchInput(elements.searchInput.value, true);
    updateSummary(flights);
    elements.lastUpdated.textContent = `Updated ${formatTime(state.lastSyncAt)}`;
  } catch (error) {
    console.error("Rendered VATSIM data but failed to update the UI", error);
    elements.lastUpdated.textContent = "Loaded VATSIM data, but the page failed to render it";
    renderEmptyState(
      "The VATSIM feed loaded, but a UI error stopped the tracker from rendering. Refresh once after clearing cache."
    );
  }
}

function normalizePilot(pilot) {
  const flightPlan = pilot.flight_plan ?? {};
  const rawAircraftCode = (
    flightPlan.aircraft_faa ||
    flightPlan.aircraft_short ||
    flightPlan.aircraft ||
    "Unknown"
  )
    .toUpperCase()
    .trim();
  const aircraftCode = extractAircraftCode(rawAircraftCode);
  const callsignPrefix = String(pilot.callsign || "").slice(0, 3).toUpperCase();
  const resolvedAirlineName = state.airlineNames[callsignPrefix] || callsignPrefix || "Unknown airline";
  const airlineName = airlineDisplayNameOverrides[callsignPrefix] || resolvedAirlineName;
  const aircraftName = aircraftNames[aircraftCode] || aircraftCode;
  const altitude = Number.isFinite(pilot.altitude) ? pilot.altitude : 0;
  const groundspeed = Number.isFinite(pilot.groundspeed) ? pilot.groundspeed : 0;
  const heading = Number.isFinite(pilot.heading) ? pilot.heading : 0;
  const departure = flightPlan.departure || "---";
  const arrival = flightPlan.arrival || "---";
  const route = `${departure} to ${arrival}`;
  const pilotName = `${pilot.name || "Unknown"}${pilot.cid ? ` (${pilot.cid})` : ""}`;
  const registration = extractRegistration(flightPlan.remarks || "");
  const flightId = String(pilot.cid || `${pilot.callsign}-${pilot.latitude}-${pilot.longitude}`);
  const departureAirport = state.airportLookup?.get(departure) || null;
  const arrivalAirport = state.airportLookup?.get(arrival) || null;
  const scheduledDepartureTime = parseFlightPlanDepartureTime(flightPlan.deptime);
  const movementKey = getFlightMovementKey(
    pilot.callsign,
    departure,
    arrival,
    scheduledDepartureTime
  );
  if (groundspeed > 0 && movementKey) {
    if (!state.movedFlightKeys.has(movementKey)) {
      state.movedFlightKeys.add(movementKey);
      persistMovedFlightKeys();
    }
  }
  const hasEverMoved = movementKey ? state.movedFlightKeys.has(movementKey) : groundspeed > 0;
  const scheduledDepartureDisplay = formatAirportLocalDepartureTime(
    scheduledDepartureTime,
    departureAirport
  );
  const scheduledArrivalTime = getScheduledArrivalTime(
    scheduledDepartureTime,
    flightPlan.enroute_time
  );
  const scheduledArrivalDisplay = formatAirportLocalDepartureTime(
    scheduledArrivalTime,
    arrivalAirport
  );
    const flightStatus = deriveFlightStatus({
      id: movementKey || flightId,
      altitude,
      groundspeed,
      departure,
      arrival,
    scheduledDepartureTime,
    scheduledArrivalTime,
    hasEverMoved,
    latitude: pilot.latitude,
    longitude: pilot.longitude,
    departureAirport,
    arrivalAirport,
  });

  return {
    id: flightId,
    callsign: pilot.callsign || "Unknown",
    pilotName,
    airlineCode: callsignPrefix,
    airlineName,
    rawAircraftCode,
    aircraftCode,
    aircraftName,
    route,
    departure,
    arrival,
    altitude,
    groundspeed,
    heading,
    latitude: pilot.latitude,
    longitude: pilot.longitude,
    transponder: pilot.transponder || "---",
    remarks: flightPlan.remarks || "No remarks filed",
    filedRoute: flightPlan.route || "No route filed",
    scheduledDepartureTime,
    scheduledDepartureDisplay,
    scheduledArrivalTime,
    scheduledArrivalDisplay,
    movementKey,
    registration,
    server: pilot.server || "---",
    status: flightStatus.key,
    statusLabel: flightStatus.label,
    statusGroup: flightStatus.group,
  };
}

function deriveFlightStatus({
  id,
  altitude,
  groundspeed,
  departure,
  arrival,
  scheduledDepartureTime,
  scheduledArrivalTime,
  hasEverMoved,
  latitude,
  longitude,
  departureAirport,
  arrivalAirport,
}) {
  const previous = state.flightPhaseMemory.get(id) || {
    hasBeenAirborne: false,
  };

  const departureDeltaMinutes = getDepartureDeltaMinutes(scheduledDepartureTime);
  const distanceToDeparture = getAirportDistanceNm(latitude, longitude, departureAirport);
  const distanceToArrival = getAirportDistanceNm(latitude, longitude, arrivalAirport);
  const isNearDeparture = Number.isFinite(distanceToDeparture) && distanceToDeparture <= 20;
  const isNearArrival = Number.isFinite(distanceToArrival) && distanceToArrival <= 20;
  const altitudeAboveDeparture = getAltitudeAboveAirportFt(altitude, departureAirport, isNearDeparture);
  const altitudeAboveArrival = getAltitudeAboveAirportFt(altitude, arrivalAirport, isNearArrival);
  const effectiveAltitude =
    Number.isFinite(altitudeAboveDeparture) ? altitudeAboveDeparture
      : Number.isFinite(altitudeAboveArrival) ? altitudeAboveArrival
        : altitude;
  const isArrivalSide =
    isNearArrival &&
    (!isNearDeparture || distanceToArrival + 5 < distanceToDeparture);
  const isAirborneNow =
    effectiveAltitude > 1500 ||
    (effectiveAltitude > 600 && groundspeed > 140) ||
    (previous.hasBeenAirborne && effectiveAltitude > 250);
  const looksLandedNearArrival =
    isArrivalSide &&
    (!Number.isFinite(altitudeAboveArrival) || altitudeAboveArrival <= 1200) &&
    groundspeed <= 80;
  const isArrivalPastSchedule =
    scheduledArrivalTime instanceof Date &&
    Date.now() > scheduledArrivalTime.getTime() + 30 * 60 * 1000;

  let nextStatus = {
    key: "boarding",
    label: "Boarding",
    group: "ground",
  };

  if (looksLandedNearArrival) {
    nextStatus = isArrivalPastSchedule
      ? {
        key: "delayed",
        label: "Delayed",
        group: "ground",
      }
      : {
        key: "arrived",
        label: "Arrived",
        group: "ground",
      };
    previous.hasBeenAirborne = true;
  } else if (isAirborneNow) {
    nextStatus = {
      key: "en-route",
      label: "En-Route",
      group: "airborne",
    };
    previous.hasBeenAirborne = true;
  } else if (previous.hasBeenAirborne || isArrivalSide) {
    nextStatus = isArrivalPastSchedule
      ? {
        key: "delayed",
        label: "Delayed",
        group: "ground",
      }
      : {
        key: "arrived",
        label: "Arrived",
        group: "ground",
      };
  } else if (departure !== "---" || arrival !== "---") {
    nextStatus = getBoardingStatus(departureDeltaMinutes, hasEverMoved);
  }

  previous.lastStatus = nextStatus.key;
  state.flightPhaseMemory.set(id, previous);
  return nextStatus;
}

function getDepartureDeltaMinutes(scheduledDepartureTime) {
  if (!(scheduledDepartureTime instanceof Date)) {
    return null;
  }

  return Math.round((scheduledDepartureTime.getTime() - Date.now()) / 60000);
}

function getBoardingStatus(departureDeltaMinutes, hasEverMoved) {
  if (!Number.isFinite(departureDeltaMinutes)) {
    return {
      key: hasEverMoved ? "pre-departure" : "boarding",
      label: hasEverMoved ? "Gate Closed" : "Boarding",
      group: "ground",
    };
  }

  if (departureDeltaMinutes <= 0) {
    return {
      key: "pre-departure",
      label: "Gate Closed",
      group: "ground",
    };
  }

  if (hasEverMoved) {
    return {
      key: "pre-departure",
      label: "Gate Closed",
      group: "ground",
    };
  }

  return {
    key: "departing-soon",
    label: `Departing in ${formatDepartureCountdown(departureDeltaMinutes)}`,
    group: "ground",
  };
}

function getAirportDistanceNm(latitude, longitude, airport) {
  if (
    !airport ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(airport.latitude) ||
    !Number.isFinite(airport.longitude)
  ) {
    return null;
  }

  const earthRadiusNm = 3440.065;
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(airport.latitude);
  const deltaLat = toRadians(airport.latitude - latitude);
  const deltaLon = toRadians(airport.longitude - longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusNm * c;
}

function getAltitudeAboveAirportFt(altitude, airport, isNearAirport) {
  if (
    !isNearAirport ||
    !airport ||
    !Number.isFinite(altitude) ||
    !Number.isFinite(airport.elevationFt)
  ) {
    return null;
  }

  return Math.max(0, altitude - airport.elevationFt);
}

function formatDepartureCountdown(totalMinutes) {
  if (totalMinutes <= 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${hours}h ${minutes}m`;
}

function parseFlightPlanDepartureTime(value) {
  const raw = String(value || "").trim();

  if (!/^\d{4}$/.test(raw)) {
    return null;
  }

  const hours = Number(raw.slice(0, 2));
  const minutes = Number(raw.slice(2, 4));

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const now = new Date();
  const candidate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hours,
    minutes,
    0,
    0
  ));

  const twelveHours = 12 * 60 * 60 * 1000;

  if (candidate.getTime() - now.getTime() > twelveHours) {
    candidate.setUTCDate(candidate.getUTCDate() - 1);
  } else if (now.getTime() - candidate.getTime() > twelveHours) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }

  return candidate;
}

function formatAirportLocalDepartureTime(date, airport) {
  if (!(date instanceof Date) || !airport?.timeZone || airport.timeZone === "\\N") {
    return "";
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: airport.timeZone,
      hour: "numeric",
      minute: "2-digit",
    });
    return `${formatter.format(date)} local`;
  } catch {
    return "";
  }
}

function parseFlightPlanDuration(value) {
  const raw = String(value || "").trim();

  if (!/^\d{4}$/.test(raw)) {
    return null;
  }

  const hours = Number(raw.slice(0, 2));
  const minutes = Number(raw.slice(2, 4));

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return (hours * 60 + minutes) * 60 * 1000;
}

function getScheduledArrivalTime(scheduledDepartureTime, enrouteTime) {
  if (!(scheduledDepartureTime instanceof Date)) {
    return null;
  }

  const durationMs = parseFlightPlanDuration(enrouteTime);

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return null;
  }

  return new Date(scheduledDepartureTime.getTime() + durationMs);
}

function getFlightDetailLabels(flight) {
  const labels = [...detailFields];

  if (!flight.registration) {
    labels.splice(2, 1);
  }

  if (shouldUseArrivalSchedule(flight)) {
    labels[flight.registration ? 4 : 3] = "Scheduled Arrival";
  }

  return labels;
}

function getFlightDetailValues(flight) {
  const values = [
    flight.pilotName,
    `${flight.aircraftName} (${flight.aircraftCode})`,
    flight.registration || "---",
    flight.route,
    getScheduledDepartureTileValue(flight),
    `${formatNumber(flight.groundspeed)} kt`,
    `${formatNumber(flight.altitude)} ft`,
    flight.transponder,
    `${formatNumber(flight.heading)} deg`,
  ];

  if (!flight.registration) {
    values.splice(2, 1);
  }

  return values;
}

function getScheduledDepartureTileValue(flight) {
  if (shouldUseArrivalSchedule(flight)) {
    return flight.scheduledArrivalDisplay || "Not filed";
  }

  return flight.scheduledDepartureDisplay || "Not filed";
}

  function syncFlightPhaseMemory(flights) {
    const activeIds = new Set(flights.map((flight) => flight.movementKey || flight.id));
    Array.from(state.flightPhaseMemory.keys()).forEach((flightId) => {
      if (!activeIds.has(flightId)) {
        state.flightPhaseMemory.delete(flightId);
      }
  });
}

function applyFilter(query) {
  const trimmed = query.trim().toLowerCase();
  const airportCode = state.selectedAirport?.icao || "";

  if (airportCode) {
    state.filteredFlights = state.flights.filter(
      (flight) => flight.departure === airportCode || flight.arrival === airportCode
    );
  } else {
    state.filteredFlights = trimmed
      ? state.flights.filter((flight) => {
        const haystack = [
          flight.callsign,
          flight.pilotName,
          flight.route,
          flight.aircraftCode,
          flight.aircraftName,
          flight.airlineName,
          flight.departure,
          flight.arrival,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(trimmed);
      })
      : [...state.flights];
  }

    renderFlightList();
    renderMarkers();
    renderSelectedFlight();
    renderLegend();
    updateSearchOverlayVisibility();
  }

function updateSummary(flights) {
  elements.totalFlights.textContent = formatNumber(flights.length);
  elements.activeDepartures.textContent = formatNumber(
    flights.filter((flight) => flight.departure !== "---" || flight.arrival !== "---").length
  );
  const busiestAirportCode = getBusiestAirportCode(flights);
  state.recommendedDepartureAirportCode = busiestAirportCode || "";
  elements.averageAltitude.textContent = busiestAirportCode || "--";
  elements.recommendedAirportCard?.classList.toggle("is-disabled", !busiestAirportCode);
  elements.recommendedAirportCard?.setAttribute("aria-disabled", busiestAirportCode ? "false" : "true");
}

function getBusiestAirportCode(flights) {
  const airportStats = new Map();
  const now = Date.now();

  const ensureAirportStats = (icao) => {
    const normalized = String(icao || "").toUpperCase().trim();
    if (!/^[A-Z]{4}$/.test(normalized)) {
      return null;
    }

    if (!airportStats.has(normalized)) {
      airportStats.set(normalized, {
        icao: normalized,
        groundDepartures: 0,
        arrivals: 0,
        atcCount: 0,
        staffedMinutes: 0,
      });
    }

    return airportStats.get(normalized);
  };

  flights.forEach((flight) => {
    const departureStats = ensureAirportStats(flight.departure);
    if (
      departureStats &&
      flight.statusGroup === "ground" &&
      flight.status !== "arrived" &&
      flight.status !== "delayed"
    ) {
      departureStats.groundDepartures += 1;
    }

    const arrivalStats = ensureAirportStats(flight.arrival);
    if (arrivalStats) {
      arrivalStats.arrivals += 1;
    }
  });

  state.prefiles.forEach((prefile) => {
    const departureCode = getPrefileDepartureCode(prefile);
    const departureStats = ensureAirportStats(departureCode);
    if (departureStats) {
      departureStats.groundDepartures += 1;
    }

    ensureAirportStats(prefile?.flight_plan?.arrival || prefile?.arrival || "");
  });

  state.controllers.forEach((controller) => {
    const airportCode = getControllerAirportCode(controller?.callsign);
    const airportStats = ensureAirportStats(airportCode);
    if (!airportStats) {
      return;
    }

    airportStats.atcCount += 1;

    const logonTime = Date.parse(controller?.logon_time || "");
    if (Number.isFinite(logonTime)) {
      airportStats.staffedMinutes += Math.max(0, Math.round((now - logonTime) / 60000));
    }
  });

  const rankedAirports = Array.from(airportStats.values())
    .filter((airport) =>
      airport.groundDepartures > 0 ||
      airport.arrivals > 0 ||
      airport.atcCount > 0 ||
      airport.staffedMinutes > 0
    )
    .sort((left, right) =>
      right.groundDepartures - left.groundDepartures ||
      right.arrivals - left.arrivals ||
      right.atcCount - left.atcCount ||
      right.staffedMinutes - left.staffedMinutes ||
      left.icao.localeCompare(right.icao)
    );

  return rankedAirports[0]?.icao || "";
}

function getControllerAirportCode(callsign) {
  const normalized = String(callsign || "").toUpperCase().trim();
  const match = normalized.match(/^([A-Z]{4})_(DEL|GND|TWR|APP|DEP)$/);
  return match ? match[1] : "";
}

function renderFlightList() {
  const hasQuery = Boolean(elements.searchInput.value.trim());
  const showExpanded = hasQuery || Boolean(state.selectedAirport);

  if (!showExpanded) {
    elements.flightList.innerHTML = "";
    return;
  }

  const sections = [];

  if (state.airportSearchResults.length > 0) {
    sections.push(`
      <div class="search-section">
        <p class="search-section-title">Airports</p>
        <div class="airport-results">
          ${state.airportSearchResults
            .map((airport) => {
              const selectedClass = state.selectedAirport?.icao === airport.icao ? " is-selected" : "";
              return `
                <button class="airport-card${selectedClass}" type="button" data-airport-code="${airport.icao}">
                  <div class="airport-topline">
                    <strong>${escapeHtml(airport.icao)}</strong>
                    <span class="airport-chip">${escapeHtml(airport.iata || "Airport")}</span>
                  </div>
                  <div class="airport-name">${escapeHtml(airport.name)}</div>
                  <div class="airport-meta">${escapeHtml([airport.city, airport.country].filter(Boolean).join(", "))}</div>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    `);
  }

  if (state.selectedAirport) {
    sections.push(`
      <div class="selected-airport-banner">
        <span>Tracking ${escapeHtml(state.selectedAirport.icao)} departures and arrivals</span>
        <button type="button" class="clear-airport-button" data-clear-airport="true">Clear</button>
      </div>
    `);
  }

  if (state.filteredFlights.length === 0 && sections.length === 0) {
    renderEmptyState("No flights matched this filter.");
    return;
  }

  if (state.filteredFlights.length > 0) {
    sections.push(`
      <div class="search-section">
        ${state.airportSearchResults.length > 0 ? '<p class="search-section-title">Flights</p>' : ""}
        ${state.filteredFlights
          .map((flight) => {
      const selectedClass = flight.id === state.selectedId ? " is-selected" : "";
      return `
        <button class="flight-card${selectedClass}" type="button" data-flight-id="${flight.id}">
          <div class="flight-topline">
            <strong>${escapeHtml(flight.callsign)}</strong>
            <span class="flight-badge ${flight.status}">${escapeHtml(flight.statusLabel || flight.status)}</span>
          </div>
          <div class="flight-subline">
            <span>${escapeHtml(flight.route)}</span>
            <span class="flight-meta">${escapeHtml(flight.aircraftCode)}</span>
          </div>
          <div class="flight-subline">
            <span class="flight-meta">${escapeHtml(flight.pilotName)}</span>
            <span class="flight-meta">${formatNumber(flight.altitude)} ft</span>
          </div>
          ${flight.scheduledDepartureDisplay ? `
            <div class="flight-subline">
              <span class="flight-meta">${escapeHtml(getFlightScheduleMeta(flight))}</span>
              <span class="flight-meta">${escapeHtml(flight.departure)}</span>
            </div>
          ` : ""}
        </button>
      `;
    })
    .join("")}
      </div>
    `);
  } else if (sections.length > 0) {
    sections.push('<div class="empty-state">No flights matched this airport.</div>');
  }

  elements.flightList.innerHTML = sections.join("");

  Array.from(elements.flightList.querySelectorAll("[data-flight-id]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.flightId;
      renderFlightList();
      renderMarkers();
      renderSelectedFlight(true);
    });
  });

  Array.from(elements.flightList.querySelectorAll("[data-airport-code]")).forEach((button) => {
    button.addEventListener("click", () => {
      const airport = state.airportSearchResults.find((item) => item.icao === button.dataset.airportCode);
      if (!airport) {
        return;
      }

      selectAirport(airport);
    });
  });

  Array.from(elements.flightList.querySelectorAll("[data-clear-airport]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAirport = null;
      state.selectedAirportBoard = null;
      state.airportSearchResults = [];
      elements.searchInput.value = "";
      applyFilter("");
    });
  });
}

function renderEmptyState(message) {
  elements.flightList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

async function getAirportByCode(icao) {
  const normalized = String(icao || "").toUpperCase().trim();
  if (!normalized) {
    return null;
  }

  try {
    const lookup = await getAirportLookup();
    return lookup.get(normalized) || null;
  } catch {
    return null;
  }
}

function selectAirport(airport) {
  if (!airport) {
    return;
  }

  state.selectedAirport = airport;
  state.selectedAirportBoard = null;
  elements.searchInput.value = airport.icao;
  state.selectedId = null;

  applyFilter(airport.icao);

  if (Number.isFinite(airport.latitude) && Number.isFinite(airport.longitude)) {
    state.map.flyTo([airport.latitude, airport.longitude], Math.max(state.map.getZoom(), 6), {
      animate: true,
      duration: 0.9,
    });
  }
}

function updateSearchOverlayVisibility() {
  const hasQuery = Boolean(elements.searchInput.value.trim());
  const showExpanded = hasQuery || Boolean(state.selectedAirport);

  elements.mapFloatingSearch?.classList.toggle("is-compact", !showExpanded);
  elements.mapFloatingSearch?.classList.toggle("is-minimized", state.searchPanelMinimized);

  const hideForMinimized = state.searchPanelMinimized;
  elements.mapSearchMeta?.classList.toggle("is-hidden", !showExpanded || hideForMinimized);
  elements.mapSearchExtras?.classList.toggle("is-hidden", !showExpanded || hideForMinimized);
  elements.searchOverlayField?.classList.toggle("is-hidden", hideForMinimized);

  if (elements.searchPanelHandle) {
    elements.searchPanelHandle.setAttribute("aria-pressed", state.searchPanelMinimized ? "true" : "false");
    elements.searchPanelHandle.setAttribute(
      "aria-label",
      state.searchPanelMinimized ? "Expand search panel" : "Collapse search panel"
    );
  }
}

function renderMarkers() {
  const activeIds = new Set();

  state.filteredFlights.forEach((flight) => {
    activeIds.add(flight.id);
    const marker = state.markers.get(flight.id);
    const visualSignature = getMarkerVisualSignature(flight);

    if (marker) {
      if (state.markerVisualSignatures.get(flight.id) !== visualSignature) {
        marker.setIcon(createPlaneIcon(flight));
        state.markerVisualSignatures.set(flight.id, visualSignature);
      }
      animateMarkerTo(flight.id, marker, [flight.latitude, flight.longitude]);
      return;
    }

    const newMarker = L.marker([flight.latitude, flight.longitude], {
      icon: createPlaneIcon(flight),
      title: `${flight.callsign} ${flight.route}`,
    });

    newMarker.on("click", () => {
      state.selectedId = flight.id;
      renderFlightList();
      renderMarkers();
      renderSelectedFlight(true);
    });

      newMarker.addTo(state.map);
      state.markers.set(flight.id, newMarker);
      state.markerVisualSignatures.set(flight.id, visualSignature);
    });

  Array.from(state.markers.entries()).forEach(([id, marker]) => {
    if (!activeIds.has(id)) {
      if (state.markerAnimations.has(id)) {
        window.cancelAnimationFrame(state.markerAnimations.get(id));
        state.markerAnimations.delete(id);
      }
      state.map.removeLayer(marker);
      state.markers.delete(id);
      state.markerVisualSignatures.delete(id);
    }
  });
}

function clearMarkers() {
  Array.from(state.markerAnimations.values()).forEach((frameId) => {
    window.cancelAnimationFrame(frameId);
  });
  state.markerAnimations.clear();
  Array.from(state.markers.values()).forEach((marker) => {
    state.map.removeLayer(marker);
  });
  state.markers.clear();
  state.markerVisualSignatures.clear();
}

function getMarkerVisualSignature(flight) {
  return [
    flight.mapStatus || "",
    flight.status || "",
    flight.id === state.selectedId ? "selected" : "normal",
    state.selectedAirport?.icao || "",
  ].join("|");
}

function animateMarkerTo(flightId, marker, targetLatLng) {
  const from = marker.getLatLng();
  const start = [from.lat, from.lng];
  const [targetLat, targetLng] = targetLatLng;

  if (
    !Number.isFinite(start[0]) ||
    !Number.isFinite(start[1]) ||
    !Number.isFinite(targetLat) ||
    !Number.isFinite(targetLng)
  ) {
    marker.setLatLng(targetLatLng);
    return;
  }

  if (state.markerAnimations.has(flightId)) {
    window.cancelAnimationFrame(state.markerAnimations.get(flightId));
    state.markerAnimations.delete(flightId);
  }

  const normalizedTarget = normalizeAnimatedLongitude(start[1], targetLng);
  const deltaLat = targetLat - start[0];
  const deltaLng = normalizedTarget - start[1];

  if (Math.abs(deltaLat) < 0.0001 && Math.abs(deltaLng) < 0.0001) {
    marker.setLatLng([targetLat, targetLng]);
    return;
  }

  const startedAt = performance.now();

  const step = (timestamp) => {
    const progress = Math.min(1, (timestamp - startedAt) / MARKER_INTERPOLATION_MS);
    const lat = start[0] + deltaLat * progress;
    const lng = wrapLongitude(start[1] + deltaLng * progress);

    marker.setLatLng([lat, lng]);
    updateSelectedRouteOverlay(flightId, [lat, lng]);
    updateMapFollowPosition(flightId, [lat, lng]);

    if (progress < 1) {
      const frameId = window.requestAnimationFrame(step);
      state.markerAnimations.set(flightId, frameId);
      return;
    }

    marker.setLatLng([targetLat, targetLng]);
    updateSelectedRouteOverlay(flightId, [targetLat, targetLng]);
    updateMapFollowPosition(flightId, [targetLat, targetLng]);
    state.markerAnimations.delete(flightId);
  };

  const frameId = window.requestAnimationFrame(step);
  state.markerAnimations.set(flightId, frameId);
}

function normalizeAnimatedLongitude(fromLng, toLng) {
  let adjusted = toLng;

  while (adjusted - fromLng > 180) {
    adjusted -= 360;
  }

  while (adjusted - fromLng < -180) {
    adjusted += 360;
  }

  return adjusted;
}

function wrapLongitude(lng) {
  let wrapped = lng;

  while (wrapped > 180) {
    wrapped -= 360;
  }

  while (wrapped < -180) {
    wrapped += 360;
  }

  return wrapped;
}

function createPlaneIcon(flight) {
  const classes = ["aircraft-marker", flight.statusGroup || "ground"];
  const airportRole = getAirportMarkerRole(flight);
  if (airportRole) {
    classes.push(`airport-${airportRole}`);
  }
  if (flight.id === state.selectedId) {
    classes.push("selected");
  }

  return L.divIcon({
    className: "",
    html: `<div class="${classes.join(" ")}"><div class="aircraft-dot"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function getAirportMarkerRole(flight) {
  if (!state.selectedAirport?.icao) {
    return "";
  }

  if (flight.departure === state.selectedAirport.icao) {
    return "departing";
  }

  if (flight.arrival === state.selectedAirport.icao) {
    return "arriving";
  }

  return "";
}

function renderSelectedFlight(flyToMarker = false) {
  const selected = state.filteredFlights.find((flight) => flight.id === state.selectedId) ||
    state.flights.find((flight) => flight.id === state.selectedId);

  if (!selected) {
    if (state.selectedAirport) {
      if (state.selectedAirportBoard) {
        renderAirportBoard(state.selectedAirport, state.selectedAirportBoard);
        return;
      }
      renderAirportDetail(state.selectedAirport);
      return;
    }

    elements.detailModeLabel.textContent = "Flight Detail";
    elements.detailCallsign.textContent = "Select a flight";
    elements.detailBackButton.classList.add("is-hidden");
    renderAirlineStatus(null);
    elements.detailPhoto.classList.remove("airport-mode");
    elements.detailPhoto.classList.add("is-hidden");
    elements.aircraftPhoto.classList.add("is-hidden");
    elements.aircraftPhoto.removeAttribute("src");
    hideDetailRouteChip();
    elements.routeSummary.textContent =
      "Select a flight to draw its filed path from departure to destination.";
    updateDetails(["Waiting", "Waiting", "Waiting", "Waiting", "Waiting", "Waiting", "Waiting", "Waiting", "Waiting"]);
    clearRouteLayers();
    return;
  }

  elements.detailCallsign.textContent = selected.callsign;
  elements.detailModeLabel.textContent = "Flight Detail";
  if (state.selectedAirport && state.selectedAirportBoard) {
    elements.detailBackButton.classList.remove("is-hidden");
  } else {
    elements.detailBackButton.classList.add("is-hidden");
  }
  elements.detailPhoto.classList.remove("airport-mode");
  renderAirlineStatus(selected);
  renderDetailRouteChip(selected);

  updateDetails(getFlightDetailValues(selected), getFlightDetailLabels(selected));

  if (flyToMarker) {
    state.map.flyTo([selected.latitude, selected.longitude], Math.max(state.map.getZoom(), 4), {
      animate: true,
      duration: 0.9,
    });
  }

  loadAircraftPhoto(selected);
  drawFlightRoute(selected);
}

function updateDetails(values, labels = detailFields) {
  elements.detailGrid.classList.remove("airport-grid-mode", "airport-board-mode");
  elements.detailGrid.innerHTML = labels
    .map(
      (label, index) => `
            <div class="detail-grid-card">
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(values[index])}</dd>
          </div>
        `
    )
    .join("");
}

async function renderAirportDetail(airport) {
  elements.detailModeLabel.textContent = "Airport Detail";
  elements.detailCallsign.textContent = airport.icao;
  elements.detailBackButton.classList.add("is-hidden");
  elements.detailPhoto.classList.add("airport-mode");
  elements.detailAirlineBadge.className = "airline-badge";
  elements.detailAirlineBadge.innerHTML = `
    <span class="airline-badge-dot" style="background:#4f82ff"></span>
    <span class="airline-badge-label">${escapeHtml(airport.name || airport.icao)}</span>
  `;
  elements.detailFlightState.className = "flight-state-pill";
  elements.detailFlightState.textContent = "airport";
  elements.detailFlightEta.textContent = "";
  elements.detailFlightEta.classList.add("is-hidden");
  hideDetailRouteChip();

  const departures = state.flights.filter((flight) => flight.departure === airport.icao);
  const arrivals = state.flights.filter((flight) => flight.arrival === airport.icao);
  const atisSummary = getAirportAtisSummary(airport.icao);
  const groundDepartures = state.flights.filter((flight) =>
    flight.departure === airport.icao &&
    flight.statusGroup === "ground" &&
    flight.status !== "arrived" &&
    flight.status !== "delayed"
  );
  const prefiledDepartures = state.prefiles.filter(
    (prefile) => getPrefileDepartureCode(prefile) === airport.icao
  );
  const airportDepartureBoardRows = getAirportDepartureBoardRows(airport);
  const airportArrivalBoardRows = getAirportArrivalBoardRows(airport);
  const securityEstimate = getAirportSecurityEstimate(
    airport,
    groundDepartures.length,
    prefiledDepartures.length
  );
  renderAirportOverviewGrid({
    airport,
    securityEstimate,
    departuresCount: airportDepartureBoardRows.length,
    arrivalsCount: airportArrivalBoardRows.length,
    atisSummary,
  });

  elements.routeSummary.textContent = `${airport.icao} airport view with ${formatNumber(
    airportDepartureBoardRows.length
  )} departures and ${formatNumber(airportArrivalBoardRows.length)} arrivals.`;
  clearRouteLayers();
  loadAirportPhoto(airport);
}

function getAirportSecurityEstimate(airport, groundDepartureCount, prefiledDepartureCount) {
  let minutes = groundDepartureCount * 2 + prefiledDepartureCount * 1.5;

  if (groundDepartureCount >= 10) {
    minutes += 3;
  }

  if (groundDepartureCount >= 20) {
    minutes += 4;
  }

  if (prefiledDepartureCount >= 15) {
    minutes += 3;
  }

  if (prefiledDepartureCount >= 30) {
    minutes += 4;
  }

  const rounded = Math.max(0, Math.min(45, Math.round(minutes / 5) * 5));
  return `${rounded} min`;
}

function getPrefileDepartureCode(prefile) {
  return String(prefile?.flight_plan?.departure || prefile?.departure || "")
    .trim()
    .toUpperCase();
}

function renderAirportOverviewGrid({
  airport,
  securityEstimate,
  departuresCount,
  arrivalsCount,
  atisSummary,
}) {
  elements.detailGrid.classList.add("airport-grid-mode");
  elements.detailGrid.classList.remove("airport-board-mode");
  elements.detailGrid.innerHTML = `
      <div class="airport-overview-grid">
        <div class="airport-overview-tile">
        <p class="airport-overview-title">Security Check</p>
        <p class="airport-overview-value">${escapeHtml(securityEstimate)}</p>
      </div>
      <div class="airport-overview-tile">
        <p class="airport-overview-title">Location</p>
        <p class="airport-overview-value">${escapeHtml([airport.city, airport.country].filter(Boolean).join(", ") || "Unknown location")}</p>
      </div>
      <button class="airport-overview-button" type="button" data-airport-board="departures">
        <p class="airport-overview-title">Departures</p>
        <p class="airport-overview-value">${escapeHtml(`${formatNumber(departuresCount)} flights`)}</p>
      </button>
      <button class="airport-overview-button" type="button" data-airport-board="arrivals">
        <p class="airport-overview-title">Arrivals</p>
        <p class="airport-overview-value">${escapeHtml(`${formatNumber(arrivalsCount)} flights`)}</p>
      </button>
      <div class="airport-overview-tile">
        <p class="airport-overview-title">ATIS</p>
        <p class="airport-overview-value">${escapeHtml(atisSummary || "No VATSIM ATIS online")}</p>
      </div>
      <div class="airport-overview-tile">
        <p class="airport-overview-title">Search</p>
        <p class="airport-overview-value">${escapeHtml(airport.iata ? `${airport.icao} / ${airport.iata}` : airport.icao)}</p>
      </div>
    </div>
  `;

  Array.from(elements.detailGrid.querySelectorAll("[data-airport-board]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAirportBoard = button.dataset.airportBoard;
      renderAirportBoard(airport, state.selectedAirportBoard);
    });
  });
}

function renderAirportBoard(airport, boardType) {
  elements.detailModeLabel.textContent = "Airport Board";
  elements.detailCallsign.textContent =
    boardType === "departures" ? `${airport.icao} Departures` : `${airport.icao} Arrivals`;
  hideDetailRouteChip();
  elements.detailBackButton.classList.remove("is-hidden");
  elements.detailPhoto.classList.remove("airport-mode");
  elements.detailPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.removeAttribute("src");
  elements.detailAirlineBadge.className = "airline-badge";
  elements.detailAirlineBadge.innerHTML = `
    <span class="airline-badge-dot" style="background:#4f82ff"></span>
    <span class="airline-badge-label">${escapeHtml(airport.name || airport.icao)}</span>
  `;
  elements.detailFlightState.className = "flight-state-pill";
  elements.detailFlightState.textContent = boardType === "departures" ? "departures" : "arrivals";
  elements.detailFlightEta.textContent = "";
  elements.detailFlightEta.classList.add("is-hidden");

  const rows = boardType === "departures"
    ? getAirportDepartureBoardRows(airport)
    : getAirportArrivalBoardRows(airport);

  renderAirportBoardGrid(rows, boardType);
  elements.routeSummary.textContent =
    boardType === "departures"
      ? `Showing flights at ${airport.icao} that are at check-in or still on the ground.`
      : `Showing inbound flights and recently arrived flights for ${airport.icao}.`;
  clearRouteLayers();
}

function renderDetailRouteChip(flight) {
  if (!elements.detailRouteChip) {
    return;
  }

  const departureCode = getDisplayAirportLabel(flight.departure, flight.arrival);
  const arrivalCode = getDisplayAirportLabel(flight.arrival, flight.departure);

  if (!departureCode && !arrivalCode) {
    hideDetailRouteChip();
    return;
  }

  elements.detailRouteChip.textContent = `${departureCode || "---"} → ${arrivalCode || "---"}`;
  elements.detailRouteChip.classList.remove("is-hidden");
  elements.detailRouteChip.setAttribute("aria-hidden", "false");
}

function hideDetailRouteChip() {
  if (!elements.detailRouteChip) {
    return;
  }

  elements.detailRouteChip.textContent = "";
  elements.detailRouteChip.classList.add("is-hidden");
  elements.detailRouteChip.setAttribute("aria-hidden", "true");
}

function getDisplayAirportLabel(icao, counterpartIcao = "") {
  const normalized = String(icao || "").toUpperCase().trim();
  if (!normalized || normalized === "---") {
    return "";
  }

  const airport = state.airportLookup?.get?.(normalized);
  const counterpart = state.airportLookup?.get?.(String(counterpartIcao || "").toUpperCase().trim());
  const city = String(airport?.city || "").trim();
  const counterpartCity = String(counterpart?.city || "").trim();

  if (
    city &&
    (
      !counterpartCity ||
      normalizeSearchText(city) !== normalizeSearchText(counterpartCity)
    )
  ) {
    return city;
  }

  return airport?.iata || normalized;
}

function renderAirportBoardGrid(rows, boardType) {
  elements.detailGrid.classList.remove("airport-grid-mode");
  elements.detailGrid.classList.add("airport-board-mode");
  if (!rows.length) {
    elements.detailGrid.innerHTML = `
        <div class="airport-board-empty">
          No ${escapeHtml(boardType)} are available right now.
      </div>
    `;
    return;
  }

  elements.detailGrid.innerHTML = `
      <div class="airport-board">
        <div class="airport-board-head">
          <span>Flight</span>
          <span>${boardType === "departures" ? "Destination" : "From"}</span>
          <span>Status</span>
        </div>
        ${rows
          .map((row) => `
            <button
              class="airport-board-row${row.flightId ? " is-clickable" : ""}"
              type="button"
              ${row.flightId ? `data-flight-id="${escapeHtml(row.flightId)}"` : "disabled"}
            >
              <span class="airport-board-flight">${escapeHtml(row.callsign)}</span>
              <span class="airport-board-destination">${escapeHtml(row.airportLabel || "---")}</span>
              <span class="airport-board-status${row.statusTone ? ` is-${escapeHtml(row.statusTone)}` : ""}${row.isArrived ? " is-arrived" : ""}">${escapeHtml(row.status)}</span>
            </button>
          `)
          .join("")}
      </div>
  `;

  Array.from(elements.detailGrid.querySelectorAll("[data-flight-id]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.flightId;
      renderFlightList();
      renderMarkers();
      renderSelectedFlight(true);
    });
  });
}

function getAirportDepartureBoardRows(airport) {
  const activeGroundDepartures = state.flights
    .filter((flight) =>
      flight.departure === airport.icao &&
      flight.statusGroup === "ground" &&
      flight.status !== "arrived" &&
      flight.status !== "delayed"
    )
    .map((flight) => ({
      callsign: flight.callsign,
      status: getAirportDepartureStatus(flight),
      statusTone: getAirportBoardStatusTone(getAirportDepartureStatus(flight)),
      flightId: flight.id,
      airportLabel: getAirportBoardAirportLabel(flight.arrival),
      sortTime: flight.scheduledDepartureTime instanceof Date ? flight.scheduledDepartureTime.getTime() : Number.MAX_SAFE_INTEGER,
    }));

  const activeCallsigns = new Set(activeGroundDepartures.map((flight) => flight.callsign));
  const prefileRows = state.prefiles
    .filter((prefile) => getPrefileDepartureCode(prefile) === airport.icao)
    .map((prefile) => normalizePrefileBoardRow(prefile))
    .filter((prefile) => prefile && !activeCallsigns.has(prefile.callsign))
      .map((prefile) => ({
        ...prefile,
        status: "Check-In",
        statusTone: "check-in",
        flightId: "",
      }));

  return [...activeGroundDepartures, ...prefileRows]
    .sort((left, right) => left.sortTime - right.sortTime || left.callsign.localeCompare(right.callsign));
}

function getAirportArrivalBoardRows(airport) {
  return state.flights
    .filter((flight) =>
      flight.arrival === airport.icao &&
      (flight.status === "arrived" || flight.status === "delayed" || flight.statusGroup === "airborne")
    )
      .map((flight) => {
        const isArrived = flight.status === "arrived" || flight.status === "delayed";
        return {
          callsign: flight.callsign,
          status: isArrived
            ? `Baggage Claim ${getBaggageClaimLabel(airport, flight)}`
            : getArrivalCountdownText(flight) || "En-Route",
          flightId: flight.id,
          isArrived,
          statusTone: isArrived ? "arrived" : "",
          airportLabel: getAirportBoardAirportLabel(flight.departure),
          sortTime: getAirportArrivalSortTime(flight),
      };
    })
    .sort((left, right) => left.sortTime - right.sortTime || left.callsign.localeCompare(right.callsign));
}

function getAirportDepartureStatus(flight) {
  if (flight.status === "boarding") {
    return "Boarding Now";
  }

  if (flight.status === "departing-soon") {
    return "Boarding Now";
  }

  if (flight.status === "pre-departure") {
    return "Gate Closed";
  }

  return flight.statusLabel || flight.status;
}

function getAirportBoardStatusTone(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "check-in") {
    return "check-in";
  }

  if (normalized.startsWith("boarding")) {
    return "boarding";
  }

  if (normalized.startsWith("baggage claim")) {
    return "arrived";
  }

  return "";
}

function getAirportBoardAirportLabel(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) {
    return "---";
  }

  const airport = state.airportLookup?.get?.(normalizedCode);
  return airport?.icao || normalizedCode;
}

function getAirportArrivalSortTime(flight) {
  if (flight.scheduledArrivalTime instanceof Date) {
    return flight.scheduledArrivalTime.getTime();
  }

  if (flight.status === "arrived" || flight.status === "delayed") {
    return Date.now();
  }

  const arrivalAirport = state.airportLookup?.get?.(flight.arrival);
  const distanceNm = getAirportDistanceNm(flight.latitude, flight.longitude, arrivalAirport);
  const groundspeed = Number.isFinite(flight.groundspeed) ? flight.groundspeed : 0;

  if (Number.isFinite(distanceNm) && groundspeed > 0) {
    return Date.now() + Math.round((distanceNm / groundspeed) * 60 * 60000);
  }

  return Number.MAX_SAFE_INTEGER;
}

function normalizePrefileBoardRow(prefile) {
  const callsign = String(prefile?.callsign || "").trim().toUpperCase();
  const departure = getPrefileDepartureCode(prefile);
  const arrival = String(prefile?.flight_plan?.arrival || prefile?.arrival || "").trim().toUpperCase();
  const scheduledDepartureTime = parseFlightPlanDepartureTime(prefile?.flight_plan?.deptime);

  if (!callsign) {
    return null;
  }

  return {
    callsign,
    departure,
    arrival,
    airportLabel: getAirportBoardAirportLabel(arrival),
    sortTime: scheduledDepartureTime instanceof Date ? scheduledDepartureTime.getTime() : Number.MAX_SAFE_INTEGER,
  };
}

function getBaggageClaimLabel(airport, flight) {
  const airlineSeed = String(flight.airlineCode || flight.airlineName || "GEN").toUpperCase().trim();
  const airportSeed = `${airport.icao}|${airlineSeed}`;
  let hash = 0;

  for (let index = 0; index < airportSeed.length; index += 1) {
    hash = (hash * 31 + airportSeed.charCodeAt(index)) % 9973;
  }

  const beltCount = Math.max(6, Math.min(18, Math.round(Math.sqrt(Math.max(1, state.flights.length)) * 1.4)));
  return String((hash % beltCount) + 1);
}

function getFlightMediaCacheKey(flight) {
  return [
    "flight",
    flight.airlineCode || "",
    flight.aircraftCode || "",
    flight.registration || "",
  ].join("|");
}

function getAirportMediaCacheKey(airport) {
  return [
    "airport",
    airport.icao || "",
    airport.iata || "",
  ].join("|");
}

async function loadAircraftPhoto(flight) {
  const requestId = ++state.photoRequestId;
  const cacheKey = getFlightMediaCacheKey(flight);
  const cached = state.mediaCache.get(cacheKey);

  if (typeof cached !== "undefined") {
    renderResolvedMedia(cached);
    return;
  }

  elements.detailPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.removeAttribute("src");

  let pendingPromise = state.mediaPromiseCache.get(cacheKey);
  if (!pendingPromise) {
    pendingPromise = fetchAircraftPhoto(flight)
      .then(async (imageResult) => {
        const resolved = imageResult || null;
        if (resolved?.url) {
          await preloadImage(resolved.url);
        }
        state.mediaCache.set(cacheKey, resolved);
        state.mediaPromiseCache.delete(cacheKey);
        return resolved;
      })
      .catch((error) => {
        console.warn("Unable to resolve aircraft media", error);
        state.mediaCache.set(cacheKey, null);
        state.mediaPromiseCache.delete(cacheKey);
        return null;
      });
    state.mediaPromiseCache.set(cacheKey, pendingPromise);
  }

  let resolved = null;
  try {
    resolved = await pendingPromise;
  } catch (error) {
    console.warn("Unexpected aircraft media error", error);
    state.mediaCache.set(cacheKey, null);
    state.mediaPromiseCache.delete(cacheKey);
  }

  if (state.selectedId === flight.id && requestId === state.photoRequestId) {
    renderResolvedMedia(resolved);
  }
}

async function loadAirportPhoto(airport) {
  const requestId = ++state.photoRequestId;
  const cacheKey = getAirportMediaCacheKey(airport);
  const cached = state.mediaCache.get(cacheKey);

  if (typeof cached !== "undefined") {
    renderResolvedMedia(cached);
    return;
  }

  elements.detailPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.classList.add("is-hidden");
  elements.aircraftPhoto.removeAttribute("src");

  let pendingPromise = state.mediaPromiseCache.get(cacheKey);
  if (!pendingPromise) {
    pendingPromise = fetchAirportPhoto(airport)
      .then(async (result) => {
        const resolved = result || null;
        if (resolved?.url) {
          await preloadImage(resolved.url);
        }
        state.mediaCache.set(cacheKey, resolved);
        state.mediaPromiseCache.delete(cacheKey);
        return resolved;
      })
      .catch((error) => {
        console.warn("Unable to resolve airport media", error);
        state.mediaCache.set(cacheKey, null);
        state.mediaPromiseCache.delete(cacheKey);
        return null;
      });
    state.mediaPromiseCache.set(cacheKey, pendingPromise);
  }

  let resolved = null;
  try {
    resolved = await pendingPromise;
  } catch (error) {
    console.warn("Unexpected airport media error", error);
    state.mediaCache.set(cacheKey, null);
    state.mediaPromiseCache.delete(cacheKey);
  }

  if (state.selectedAirport?.icao === airport.icao && !state.selectedId && requestId === state.photoRequestId) {
    renderResolvedMedia(resolved);
  }
}

function renderResolvedMedia(resolved) {
  if (!resolved?.url) {
    elements.detailPhoto.classList.add("is-hidden");
    elements.aircraftPhoto.classList.add("is-hidden");
    elements.aircraftPhoto.removeAttribute("src");
    return;
  }

  elements.detailPhoto.classList.remove("is-hidden");
  elements.aircraftPhoto.classList.remove("is-hidden");
  if (elements.aircraftPhoto.src !== resolved.url) {
    elements.aircraftPhoto.src = resolved.url;
  }
}

function preloadImage(url) {
  if (!url) {
    return Promise.resolve();
  }

  const cached = state.imageLoadCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "high";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
    if (image.complete) {
      resolve();
    }
  });

  state.imageLoadCache.set(url, promise);
  return promise;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function interpolateGreatCircle(start, end, segments = 48) {
  const [startLat, startLon] = start;
  const [endLat, endLon] = end;

  if (
    !Number.isFinite(startLat) ||
    !Number.isFinite(startLon) ||
    !Number.isFinite(endLat) ||
    !Number.isFinite(endLon)
  ) {
    return [start, end];
  }

  const lat1 = toRadians(startLat);
  const lon1 = toRadians(startLon);
  const lat2 = toRadians(endLat);
  const lon2 = toRadians(endLon);

  const startVector = [
    Math.cos(lat1) * Math.cos(lon1),
    Math.cos(lat1) * Math.sin(lon1),
    Math.sin(lat1),
  ];
  const endVector = [
    Math.cos(lat2) * Math.cos(lon2),
    Math.cos(lat2) * Math.sin(lon2),
    Math.sin(lat2),
  ];

  const dot = Math.min(
    1,
    Math.max(
      -1,
      startVector[0] * endVector[0] + startVector[1] * endVector[1] + startVector[2] * endVector[2]
    )
  );
  const omega = Math.acos(dot);

  if (omega === 0 || !Number.isFinite(omega)) {
    return [start, end];
  }

  const sinOmega = Math.sin(omega);
  const points = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const scaleStart = Math.sin((1 - t) * omega) / sinOmega;
    const scaleEnd = Math.sin(t * omega) / sinOmega;

    const x = scaleStart * startVector[0] + scaleEnd * endVector[0];
    const y = scaleStart * startVector[1] + scaleEnd * endVector[1];
    const z = scaleStart * startVector[2] + scaleEnd * endVector[2];

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    points.push([toDegrees(lat), toDegrees(lon)]);
  }

  return unwrapPolyline(points);
}

function unwrapPolyline(points) {
  if (points.length <= 1) {
    return points;
  }

  const unwrapped = [points[0]];
  let previousLon = points[0][1];

  for (let index = 1; index < points.length; index += 1) {
    const [lat, originalLon] = points[index];
    let lon = originalLon;

    while (lon - previousLon > 180) {
      lon -= 360;
    }

    while (lon - previousLon < -180) {
      lon += 360;
    }

    unwrapped.push([lat, lon]);
    previousLon = lon;
  }

  return unwrapped;
}

async function drawFlightRoute(flight) {
  clearRouteLayers();

  const airportLookup = await getAirportLookup();
  const departure = airportLookup.get(flight.departure);
  const arrival = airportLookup.get(flight.arrival);
  const currentPoint = [flight.latitude, flight.longitude];
  const routePoints = [];

  if (departure) {
    routePoints.push([departure.latitude, departure.longitude]);
  }

  routePoints.push(currentPoint);

  if (arrival) {
    routePoints.push([arrival.latitude, arrival.longitude]);
  }

  if (routePoints.length >= 2) {
    const flownSegmentPoints = interpolateGreatCircle(
      routePoints[0],
      routePoints[Math.min(routePoints.length, 2) - 1]
    );
    const flownSegment = L.polyline(flownSegmentPoints, {
      color: "#6ae3ff",
      weight: 3,
      opacity: 0.85,
    }).addTo(state.map);

    state.routeLayers.push(flownSegment);

    if (routePoints.length === 3) {
      const aheadSegmentPoints = interpolateGreatCircle(routePoints[1], routePoints[2]);
      const aheadSegment = L.polyline(aheadSegmentPoints, {
        color: "#f2c14d",
        weight: 3,
        opacity: 0.95,
        dashArray: "10 8",
      }).addTo(state.map);

      const destinationMarker = L.circleMarker([arrival.latitude, arrival.longitude], {
        radius: 5,
        color: "#f2c14d",
        weight: 2,
        fillColor: "#f2c14d",
        fillOpacity: 1,
      }).addTo(state.map);

      destinationMarker.bindTooltip(
        `${flight.arrival} destination`,
        { direction: "top", offset: [0, -4] }
      );

      state.routeLayers.push(aheadSegment, destinationMarker);
    }
  }

  state.routeOverlay = {
    flightId: flight.id,
    departure: departure ? [departure.latitude, departure.longitude] : null,
    arrival: arrival ? [arrival.latitude, arrival.longitude] : null,
    flownSegment: state.routeLayers[0] || null,
    aheadSegment: routePoints.length === 3 ? state.routeLayers[1] || null : null,
  };

  elements.routeSummary.textContent = buildRouteSummary(flight, departure, arrival);
}

function clearRouteLayers() {
  state.routeLayers.forEach((layer) => {
    state.map.removeLayer(layer);
  });
  state.routeLayers = [];
  state.routeOverlay = null;
}

function updateSelectedRouteOverlay(flightId, currentPoint) {
  const overlay = state.routeOverlay;
  if (!overlay || overlay.flightId !== flightId || !Array.isArray(currentPoint)) {
    return;
  }

  if (overlay.departure && overlay.flownSegment) {
    overlay.flownSegment.setLatLngs(interpolateGreatCircle(overlay.departure, currentPoint));
  }

  if (overlay.arrival && overlay.aheadSegment) {
    overlay.aheadSegment.setLatLngs(interpolateGreatCircle(currentPoint, overlay.arrival));
  }

  updateMapFollowPosition(flightId, currentPoint);
}

function updateMapFollowPosition(flightId, currentPoint) {
  if (
    !state.followSelectedFlight ||
    !state.map ||
    state.selectedId !== flightId ||
    !Array.isArray(currentPoint)
  ) {
    return;
  }

  const [lat, lng] = currentPoint;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return;
  }

  const now = performance.now();
  if (now - state.lastFollowPanAt < FOLLOW_PAN_INTERVAL_MS) {
    return;
  }
  state.lastFollowPanAt = now;

  state.map.panTo([lat, lng], {
    animate: false,
  });
}

function buildRouteSummary(flight, departure, arrival) {
  const scheduleDisplay = getRouteScheduleDisplay(flight);
  const schedulePrefix = scheduleDisplay
    ? `${getRouteSchedulePrefixLabel(flight)} ${scheduleDisplay}. `
    : "";

  if (departure && arrival) {
    return `${schedulePrefix}Filed route ${flight.departure} to ${flight.arrival}: ${flight.filedRoute}`;
  }

  if (arrival) {
    return `${schedulePrefix}Filed destination ${flight.arrival}. Route text: ${flight.filedRoute}`;
  }

  return `${schedulePrefix}Route text: ${flight.filedRoute}`;
}

function getRouteScheduleDisplay(flight) {
  if (shouldUseArrivalSchedule(flight)) {
    return flight.scheduledArrivalDisplay;
  }

  return flight.scheduledDepartureDisplay;
}

function getFlightScheduleMeta(flight) {
  if (!flight.scheduledDepartureDisplay) {
    return "";
  }

  if (flight.status === "pre-departure") {
    return `Gate Closed • sched ${flight.scheduledDepartureDisplay}`;
  }

  return `Sched ${flight.scheduledDepartureDisplay}`;
}

function getRouteSchedulePrefixLabel(flight) {
  if (shouldUseArrivalSchedule(flight)) {
    return "Scheduled arrival";
  }

  if (flight.status === "pre-departure") {
    return "Gate closed sched";
  }

  return "Scheduled departure";
}

function shouldUseArrivalSchedule(flight) {
  return flight.status === "en-route" || flight.status === "arrived" || flight.status === "delayed";
}

async function getAirportLookup() {
  if (state.airportLookup) {
    return state.airportLookup;
  }

  if (!state.airportLookupPromise) {
    state.airportLookupPromise = fetch(AIRPORTS_DATA_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Airport dataset request failed: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        const lookup = new Map();
        const searchIndex = [];
        text.split(/\r?\n/).forEach((line) => {
          if (!line.trim()) {
            return;
          }

          const columns = parseCsvLine(line);
          const iata = (columns[4] || "").replaceAll('"', "").trim().toUpperCase();
          const icao = (columns[5] || "").replaceAll('"', "").trim().toUpperCase();
          const latitude = Number(columns[6]);
          const longitude = Number(columns[7]);
          const elevationFt = Number(columns[8]);
          const name = (columns[1] || "").replaceAll('"', "").trim();
          const city = (columns[2] || "").replaceAll('"', "").trim();
          const country = (columns[3] || "").replaceAll('"', "").trim();

          if (!icao || icao === "\\N" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
          }

          const airport = {
            icao,
            iata: iata && iata !== "\\N" ? iata : "",
            latitude,
            longitude,
            elevationFt: Number.isFinite(elevationFt) ? elevationFt : null,
            name,
            city,
            country,
            timeZone: (columns[11] || "").replaceAll('"', "").trim(),
          };

          lookup.set(icao, airport);
          searchIndex.push(airport);
        });

        state.airportLookup = lookup;
        state.airportSearchIndex = searchIndex;
        return lookup;
      })
      .catch((error) => {
        console.warn("Unable to load airport dataset", error);
        state.airportLookup = new Map();
        return state.airportLookup;
      });
  }

  return state.airportLookupPromise;
}

function buildAirportAtisLookup(atisEntries) {
  const lookup = new Map();

  atisEntries.forEach((entry) => {
    const callsign = String(entry.callsign || "").toUpperCase();
    const match = callsign.match(/^([A-Z]{4})/);
    if (!match) {
      return;
    }

    const icao = match[1];
    const textAtis = Array.isArray(entry.text_atis) ? entry.text_atis.join(" ") : String(entry.text_atis || "");
    lookup.set(icao, {
      callsign,
      text: textAtis.trim(),
      frequency: entry.frequency || "",
    });
  });

  return lookup;
}

async function searchAirports(query) {
  try {
    await getAirportLookup();
  } catch {
    return [];
  }

  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return state.airportSearchIndex
    .filter((airport) => {
      const haystack = normalizeSearchText(
        [airport.icao, airport.iata, airport.name, airport.city, airport.country].filter(Boolean).join(" ")
      );
      return haystack.includes(normalizedQuery);
    })
    .sort((left, right) => scoreAirportMatch(left, normalizedQuery) - scoreAirportMatch(right, normalizedQuery))
    .slice(0, 6);
}

function getAirportAtisSummary(icao) {
  const atis = state.airportAtis.get(icao);
  if (!atis) {
    return "";
  }

  const summary = [atis.frequency, atis.text]
    .filter(Boolean)
    .join(" | ")
    .replace(/\s+/g, " ")
    .trim();

  return summary || "ATIS online";
}

async function fetchAirportWeather(airport) {
  try {
    const url =
      `${OPEN_METEO_URL}?latitude=${encodeURIComponent(airport.latitude)}` +
      `&longitude=${encodeURIComponent(airport.longitude)}` +
      "&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const value = [
      Number.isFinite(current.temperature_2m) ? `${Math.round(current.temperature_2m)}°C` : "",
      describeWeatherCode(current.weather_code),
      Number.isFinite(current.wind_speed_10m)
        ? `wind ${Math.round(current.wind_speed_10m)} km/h`
        : "",
      Number.isFinite(current.wind_direction_10m)
        ? `${Math.round(current.wind_direction_10m)}°`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const summary = value || "Weather unavailable";
    return summary;
  } catch {
    return "Weather unavailable";
  }
}

function describeWeatherCode(code) {
  const lookup = {
    0: "clear",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "freezing fog",
    51: "light drizzle",
    53: "drizzle",
    55: "dense drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    80: "rain showers",
    81: "heavy showers",
    95: "thunderstorm",
  };

  return lookup[code] || "conditions unknown";
}

function formatCoordinate(value, type) {
  if (!Number.isFinite(value)) {
    return "---";
  }

  const suffix = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(3)}° ${suffix}`;
}

function scoreAirportMatch(airport, normalizedQuery) {
  const icao = normalizeSearchText(airport.icao);
  const iata = normalizeSearchText(airport.iata);
  const name = normalizeSearchText(airport.name);

  if (icao === normalizedQuery) {
    return 0;
  }

  if (iata && iata === normalizedQuery) {
    return 1;
  }

  if (icao.startsWith(normalizedQuery)) {
    return 2;
  }

  if (iata && iata.startsWith(normalizedQuery)) {
    return 3;
  }

  if (name.startsWith(normalizedQuery)) {
    return 4;
  }

  return 5;
}

function doesQueryMatchAirport(query, airport) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery || !airport) {
    return false;
  }

  return [airport.icao, airport.iata, airport.name]
    .filter(Boolean)
    .some((value) => normalizeSearchText(value).includes(normalizedQuery));
}

function renderLegend() {
  if (!elements.legend) {
    return;
  }

  if (state.selectedAirport?.icao) {
    elements.legend.innerHTML = `
      <span><i class="dot dot-airborne"></i> Departing</span>
      <span><i class="dot dot-ground"></i> Arriving</span>
      <span><i class="dot dot-filter"></i> Selected</span>
    `;
    return;
  }

  elements.legend.innerHTML = `
    <span><i class="dot dot-airborne"></i> Airborne</span>
    <span><i class="dot dot-ground"></i> Ground</span>
    <span><i class="dot dot-filter"></i> Selected</span>
  `;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

async function fetchAircraftPhoto(flight) {
  const airlineTokens = getAirlineTokens(flight.airlineName);
  const preferredAirlineTokens = getStrictAirlineTokens(flight.airlineName);
  const aircraftTokens = getAircraftTokens(flight.aircraftName, flight.aircraftCode);
  const exactAircraftTokens = getExactAircraftTokens(flight.aircraftName, flight.aircraftCode);
  const localDefaultKey = getLocalDefaultAircraftKey(flight);

  if (flight.registration) {
    const registrationVariants = getRegistrationSearchVariants(flight.registration);
    const comparableRegistration = normalizeRegistrationComparable(flight.registration);
    const registrationSearches = Array.from(new Set(registrationVariants.flatMap((registrationVariant) => [
      `${registrationVariant} ${flight.aircraftName}`,
      `${registrationVariant} ${flight.aircraftCode}`,
      `${registrationVariant}`,
    ])));

    for (const searchQuery of registrationSearches) {
      const registrationMatch = await fetchCommonsImage(searchQuery, (title, imageInfo) => {
        const coreText = extractImageCoreText(title, imageInfo);
        const metadataText = extractImageMetadataText(title, imageInfo);
        const normalizedCoreMetadata = normalizeSearchText(coreText);
        const normalizedMetadata = normalizeSearchText(metadataText);
        const comparableMetadata = normalizeRegistrationComparable(`${title} ${coreText} ${metadataText}`);
        return (
          comparableMetadata.includes(comparableRegistration) &&
          matchesStrictAirline(normalizedCoreMetadata, preferredAirlineTokens) &&
          matchesExactAircraft(normalizedMetadata, exactAircraftTokens)
        );
      }, (title, imageInfo) => {
        const coreText = extractImageCoreText(title, imageInfo);
        const metadataText = extractImageMetadataText(title, imageInfo);
        const normalizedCoreMetadata = normalizeSearchText(coreText);
        const normalizedMetadata = normalizeSearchText(metadataText);
        const comparableMetadata = normalizeRegistrationComparable(`${title} ${coreText} ${metadataText}`);
        const registrationScore = comparableMetadata.includes(comparableRegistration) ? 10000 : 0;
        return registrationScore +
          getAirlineMatchScore(normalizedCoreMetadata, preferredAirlineTokens) * 1000 +
          getAircraftMatchScore(normalizedMetadata, exactAircraftTokens) * 100;
      });

      if (registrationMatch) {
        return {
          url: registrationMatch,
          caption: `${flight.airlineName} ${flight.aircraftName} | registration match`,
        };
      }
    }
  }

  const exactOverrideKey = `${flight.airlineCode}|${flight.aircraftCode}`;
  if (exactAircraftPhotoFiles[exactOverrideKey]) {
    const directFileMatch = await fetchCommonsFileImage(exactAircraftPhotoFiles[exactOverrideKey]);
    if (directFileMatch) {
      return {
        url: directFileMatch,
        caption: `${flight.airlineName} ${flight.aircraftName} | exact match`,
      };
    }
  }

  const exactSearches = [
    `${flight.airlineName} ${flight.aircraftName}`,
    `${flight.airlineName} ${flight.aircraftCode}`,
    `${flight.callsign.slice(0, 3)} ${flight.aircraftName}`,
  ];

  const exactMatches = await Promise.all(exactSearches.map((searchQuery) =>
    fetchCommonsImage(searchQuery, (title, imageInfo) => {
      const normalizedCoreMetadata = normalizeSearchText(extractImageCoreText(title, imageInfo));
      return (
        matchesStrictAirline(normalizedCoreMetadata, preferredAirlineTokens) &&
        matchesExactAircraft(normalizedCoreMetadata, exactAircraftTokens)
      );
    }, (title, imageInfo) => {
      const normalizedCoreMetadata = normalizeSearchText(extractImageCoreText(title, imageInfo));
      const normalizedMetadata = normalizeSearchText(extractImageMetadataText(title, imageInfo));
      return getAirlineMatchScore(normalizedCoreMetadata, preferredAirlineTokens) * 1000 +
        getAircraftMatchScore(normalizedCoreMetadata, exactAircraftTokens) * 100 +
        getAircraftMatchScore(normalizedMetadata, exactAircraftTokens);
    })
  ));

  for (const exactMatch of exactMatches) {
    if (exactMatch) {
      return {
        url: exactMatch,
        caption: `${flight.airlineName} ${flight.aircraftName} | exact match`,
      };
    }
  }

  if (localDefaultKey && localDefaultAircraftPhotos[localDefaultKey]) {
    return {
      url: localDefaultAircraftPhotos[localDefaultKey],
      caption: `${flight.airlineName} ${flight.aircraftName} | local default`,
    };
  }

  if (flight.airlineName && flight.airlineName !== flight.airlineCode) {
    const similarAircraftCodes = getSimilarAircraftCodes(flight.aircraftCode);
    for (const similarCode of similarAircraftCodes) {
      const similarName = aircraftNames[similarCode] || similarCode;
      const similarTokens = getAircraftTokens(similarName, similarCode);
      const similarSearches = [
        `${flight.airlineName} ${similarName}`,
        `${flight.airlineName} ${similarCode}`,
        `${flight.callsign.slice(0, 3)} ${similarName}`,
      ];

      for (const searchQuery of similarSearches) {
        const similarMatch = await fetchCommonsImage(searchQuery, (title, imageInfo) => {
          const normalizedCoreMetadata = normalizeSearchText(extractImageCoreText(title, imageInfo));
          const normalizedMetadata = normalizeSearchText(extractImageMetadataText(title, imageInfo));
          return (
            matchesStrictAirline(normalizedCoreMetadata, preferredAirlineTokens) &&
            similarTokens.some((token) => normalizedMetadata.includes(token))
          );
        }, (title, imageInfo) => {
          const normalizedCoreMetadata = normalizeSearchText(extractImageCoreText(title, imageInfo));
          const normalizedMetadata = normalizeSearchText(extractImageMetadataText(title, imageInfo));
          return getAirlineMatchScore(normalizedCoreMetadata, preferredAirlineTokens) * 100 +
            getAircraftMatchScore(normalizedMetadata, similarTokens);
        });

        if (similarMatch) {
          return {
            url: similarMatch,
            caption: `${flight.airlineName} ${similarName} | similar match for ${flight.aircraftCode}`,
          };
        }
      }
    }

  }

  return null;
}

async function fetchAirportPhoto(airport) {
  const searches = [
    `"${airport.name}" airport`,
    airport.iata ? `"${airport.name}" ${airport.iata} airport` : "",
    `${airport.name} airport`,
  ].filter(Boolean);

  for (const searchQuery of searches) {
    const match = await fetchWikipediaAirportPhoto(searchQuery, airport);

    if (match) {
      return { url: match };
    }
  }

  return null;
}

async function fetchCommonsFileImage(fileTitle) {
  try {
    const normalizedFileTitle = fileTitle.replaceAll(" ", "_");
    const url =
      "https://commons.wikimedia.org/w/api.php" +
      `?action=query&format=json&origin=*&titles=${encodeURIComponent(normalizedFileTitle)}` +
      `&prop=imageinfo&iiprop=url|timestamp|extmetadata&iiurlwidth=${AIRCRAFT_MEDIA_WIDTH}`;

    const data = await fetchCommonsApiJson(url);
    if (!data) {
      return null;
    }
    const pages = Object.values(data.query?.pages ?? {});
    const imageInfo = pages[0]?.imageinfo?.[0];
    if (!isAcceptableAircraftPhoto(pages[0]?.title || "", imageInfo)) {
      return null;
    }

    return imageInfo?.thumburl || imageInfo?.url || null;
  } catch (error) {
    console.warn("Unable to load exact aircraft photo", error);
    return null;
  }
}

async function fetchCommonsImage(searchQuery, validator, scorer = null) {
  try {
    const url =
      "https://commons.wikimedia.org/w/api.php" +
      `?action=query&format=json&origin=*` +
      `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
      `&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|timestamp|extmetadata&iiurlwidth=${AIRCRAFT_MEDIA_WIDTH}`;

    const data = await fetchCommonsApiJson(url);
    if (!data) {
      return null;
    }
    const pages = Object.values(data.query?.pages ?? {});
    const candidates = [];

    for (const page of pages) {
      if (!validator(page.title || "", page.imageinfo?.[0])) {
        continue;
      }

      const imageInfo = page.imageinfo?.[0];
      if (!isAcceptableAircraftPhoto(page.title || "", imageInfo)) {
        continue;
      }

      const imageUrl = imageInfo?.thumburl || imageInfo?.url || null;
      if (!imageUrl) {
        continue;
      }

      candidates.push({
        imageUrl,
        score: typeof scorer === "function" ? scorer(page.title || "", imageInfo) : 0,
      });
    }

    candidates.sort((left, right) => right.score - left.score);

    if (candidates[0]?.imageUrl) {
      return candidates[0].imageUrl;
    }

    return null;
  } catch (error) {
    console.warn("Unable to load aircraft photo", error);
    return null;
  }
}

async function fetchCommonsLogoImage(searchQuery, validator) {
  try {
    const url =
      "https://commons.wikimedia.org/w/api.php" +
      `?action=query&format=json&origin=*` +
      `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
      `&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|timestamp|extmetadata&iiurlwidth=${AIRLINE_LOGO_WIDTH}`;

    const data = await fetchCommonsApiJson(url);
    if (!data) {
      return null;
    }
    const pages = Object.values(data.query?.pages ?? {})
      .filter((page) => validator(page.title || "", page.imageinfo?.[0]))
      .filter((page) => isAcceptableLogoImage(page.title || "", page.imageinfo?.[0]))
      .sort((left, right) => {
        const leftTimestamp = new Date(left.imageinfo?.[0]?.timestamp || 0).getTime();
        const rightTimestamp = new Date(right.imageinfo?.[0]?.timestamp || 0).getTime();
        return rightTimestamp - leftTimestamp;
      });

    for (const page of pages) {
      const imageInfo = page.imageinfo?.[0];
      const imageUrl = imageInfo?.thumburl || imageInfo?.url || null;
      if (imageUrl) {
        return imageUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn("Unable to load airline logo", error);
    return null;
  }
}

async function fetchWikipediaAirlineLogo(airlineName, airlineCode) {
  const searches = [
    `"${airlineName}"`,
    `${airlineName} airline`,
    airlineCode ? `${airlineCode} airline` : "",
  ].filter(Boolean);

  for (const searchQuery of searches) {
    try {
      const url =
        "https://en.wikipedia.org/w/api.php" +
        `?action=query&format=json&origin=*` +
        `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
        `&gsrnamespace=0&gsrlimit=6&prop=pageimages|pageterms&piprop=thumbnail&pithumbsize=${AIRLINE_LOGO_WIDTH}`;

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const pages = Object.values(data.query?.pages ?? {});
      const airlineTokens = getAirlineTokens(airlineName);

      for (const page of pages) {
        if (!isAcceptableAirlineArticle(page, airlineTokens)) {
          continue;
        }

        const imageUrl = page.thumbnail?.source || null;
        if (imageUrl) {
          return imageUrl;
        }
      }
    } catch (error) {
      console.warn("Unable to load airline logo from Wikipedia", error);
    }
  }

  return null;
}

async function fetchCommonsApiJson(url) {
  if (state.commonsApiCache.has(url)) {
    return state.commonsApiCache.get(url);
  }

  if (state.commonsApiPromiseCache.has(url)) {
    return state.commonsApiPromiseCache.get(url);
  }

  const pendingPromise = fetch(url, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        return null;
      }

      return response.json();
    })
    .then((data) => {
      state.commonsApiPromiseCache.delete(url);
      if (data) {
        state.commonsApiCache.set(url, data);
      }
      return data;
    })
    .catch((error) => {
      state.commonsApiPromiseCache.delete(url);
      console.warn("Unable to load Commons API response", error);
      return null;
    });

  state.commonsApiPromiseCache.set(url, pendingPromise);
  return pendingPromise;
}

async function fetchWikipediaAirportPhoto(searchQuery, airport) {
  try {
    const url =
      "https://en.wikipedia.org/w/api.php" +
      `?action=query&format=json&origin=*` +
      `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
      `&gsrnamespace=0&gsrlimit=6&prop=pageimages|pageterms&piprop=thumbnail&pithumbsize=${AIRPORT_MEDIA_WIDTH}`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});

    for (const page of pages) {
      if (!isAcceptableAirportArticle(page, airport)) {
        continue;
      }

      const imageUrl = page.thumbnail?.source || null;
      if (imageUrl) {
        return imageUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn("Unable to load airport photo", error);
    return null;
  }
}

function getAirlineTokens(airlineName) {
  const normalized = normalizeSearchText(airlineName);
  const compact = normalized.replaceAll(" ", "");
  const aliases = airlineAliases[normalized] || [];
  const words = normalized
    .split(" ")
    .filter((word) => word.length >= 3 && !GENERIC_AIRLINE_WORDS.has(word));
  const distinctiveWords = normalized.includes(" ") ? [] : words;

  return Array.from(new Set([normalized, compact, ...distinctiveWords, ...aliases]));
}

function getStrictAirlineTokens(airlineName) {
  const normalized = normalizeSearchText(airlineName);
  const compact = normalized.replaceAll(" ", "");
  const aliases = (airlineAliases[normalized] || []).filter((alias) => {
    if (!alias) {
      return false;
    }

    if (normalized.includes(" ")) {
      return alias.includes(" ") || alias === compact;
    }

    return alias.length >= normalized.length;
  });

  return Array.from(new Set([normalized, compact, ...aliases].filter(Boolean)));
}

function matchesAirline(normalizedTitle, airlineTokens) {
  if (!airlineTokens.length) {
    return false;
  }

  const strongTokens = airlineTokens.filter((token) => token.length >= 5);
  if (strongTokens.some((token) => normalizedTitle.includes(token))) {
    return true;
  }

  return airlineTokens.some((token) => {
    if (token.length < 4) {
      return false;
    }

    const tokenWords = token.split(" ").filter(Boolean);
    return tokenWords.length > 1 && tokenWords.every((word) => normalizedTitle.includes(word));
  });
}

function getAirlineMatchScore(normalizedTitle, airlineTokens) {
  if (!airlineTokens.length) {
    return 0;
  }

  return airlineTokens.reduce((score, token) => {
    if (!token || !normalizedTitle.includes(token)) {
      return score;
    }

    return score + Math.max(1, token.replaceAll(" ", "").length);
  }, 0);
}

function matchesStrictAirline(normalizedTitle, strictAirlineTokens) {
  if (!strictAirlineTokens.length) {
    return false;
  }

  return strictAirlineTokens.some((token) => normalizedTitle.includes(token));
}

function hasLogoTerms(normalizedMetadata) {
  return ["logo", "wordmark", "logotype", "emblem", "symbol", "brandmark"].some((term) =>
    normalizedMetadata.includes(term)
  );
}

function hasAirportTerms(normalizedMetadata) {
  return ["airport", "terminal", "runway", "apron", "gate", "taxiway"].some((term) =>
    normalizedMetadata.includes(term)
  );
}

function getAircraftTokens(aircraftName, aircraftCode) {
  const normalizedName = normalizeSearchText(aircraftName);
  const compactName = normalizedName.replaceAll(" ", "");
  const normalizedCode = normalizeSearchText(aircraftCode);
  const familyMatch = normalizedName.match(/(717|727|737|747|757|767|777|787|318|319|320|321|330|340|350|380|170|175|190|195|72|md11)/);
  const tokens = [
    normalizedName,
    compactName,
    normalizedCode,
  ];

  if (familyMatch) {
    tokens.push(familyMatch[1]);
  }

  return Array.from(new Set(tokens.filter(Boolean)));
}

function getAircraftMatchScore(normalizedTitle, aircraftTokens) {
  if (!aircraftTokens.length) {
    return 0;
  }

  return aircraftTokens.reduce((score, token) => {
    if (!token || !normalizedTitle.includes(token)) {
      return score;
    }

    return score + Math.max(1, token.replaceAll(" ", "").length);
  }, 0);
}

function getExactAircraftTokens(aircraftName, aircraftCode) {
  const normalizedName = normalizeSearchText(aircraftName);
  const normalizedCode = normalizeSearchText(aircraftCode);
  const compactName = normalizedName.replaceAll(" ", "");
  const withoutManufacturer = normalizedName.replace(
    /^(airbus|boeing|embraer|bombardier|mcdonnell douglas|de havilland|cessna|atr)\s+/,
    ""
  );
  const compactWithoutManufacturer = withoutManufacturer.replaceAll(" ", "");

  return Array.from(
    new Set(
      [
        normalizedCode,
        normalizedName,
        compactName,
        withoutManufacturer,
        compactWithoutManufacturer,
      ].filter(Boolean)
    )
  );
}

function getLocalDefaultAircraftKey(flight) {
  const code = String(flight.aircraftCode || "").toUpperCase();
  const name = normalizeSearchText(flight.aircraftName || "");
  const airlineCode = String(flight.airlineCode || "").toUpperCase();

  const exactKey = `${airlineCode}|${code}`;
  if (localDefaultAircraftPhotos[exactKey]) {
    return exactKey;
  }

  if (code === "A320" || name.includes("airbus a320")) {
    const familyKey = `${airlineCode}|A320`;
    if (localDefaultAircraftPhotos[familyKey]) {
      return familyKey;
    }
  }

  if (code.startsWith("A35") || name.includes("a350")) {
    const familyKey = `${airlineCode}|A350`;
    if (localDefaultAircraftPhotos[familyKey]) {
      return familyKey;
    }
  }

  if (code === "A388" || name.includes("a380")) {
    const familyKey = `${airlineCode}|A380`;
    if (localDefaultAircraftPhotos[familyKey]) {
      return familyKey;
    }
  }

  return "";
}

function matchesExactAircraft(normalizedTitle, exactAircraftTokens) {
  if (!Array.isArray(exactAircraftTokens) || !exactAircraftTokens.length) {
    return false;
  }

  const titleWords = normalizedTitle.split(" ").filter(Boolean);

  return exactAircraftTokens.some((token) => {
    if (!token) {
      return false;
    }

    if (token.length <= 5) {
      return titleWords.includes(token);
    }

    return normalizedTitle.includes(token);
  });
}

function getSimilarAircraftCodes(aircraftCode) {
  const direct = relatedAircraftFallbacks[aircraftCode] || [];
  return direct.filter((code, index) => direct.indexOf(code) === index && code !== aircraftCode);
}

function renderAirlineStatus(flight) {
  if (!flight) {
    elements.detailAirlineBadge.className = "airline-badge airline-badge--empty";
    elements.detailAirlineBadge.textContent = "No airline";
    elements.detailFlightState.className = "flight-state-pill";
    elements.detailFlightState.textContent = "idle";
    elements.detailFlightEta.textContent = "";
    elements.detailFlightEta.classList.add("is-hidden");
    return;
  }

  elements.detailAirlineBadge.className = "airline-badge";
  elements.detailAirlineBadge.innerHTML = `
    <span class="airline-badge-dot" style="background:${getAirlineColor(flight.airlineCode, flight.airlineName)}"></span>
    <span class="airline-badge-label">${escapeHtml(flight.airlineName)}</span>
  `;

  elements.detailFlightState.className = `flight-state-pill ${getFlightStateClass(flight)}`;
  elements.detailFlightState.textContent = flight.statusLabel || flight.status;

  const arrivalCountdown = getArrivalCountdownText(flight);
  if (arrivalCountdown) {
    elements.detailFlightEta.textContent = arrivalCountdown;
    elements.detailFlightEta.classList.remove("is-hidden");
  } else {
    elements.detailFlightEta.textContent = "";
    elements.detailFlightEta.classList.add("is-hidden");
  }
}

function getFlightStateClass(flight) {
  const statusClassMap = {
    boarding: "is-boarding",
    "pre-departure": "is-departed",
    "departing-soon": "is-boarding",
    "en-route": "is-en-route",
    delayed: "is-delayed",
    arrived: "is-arrived",
  };

  return statusClassMap[flight.status] || "is-ground";
}

function getArrivalCountdownText(flight) {
  if (!flight || flight.status !== "en-route") {
    return "";
  }

  const scheduledMinutes = getScheduledArrivalDeltaMinutes(flight.scheduledArrivalTime);
  const arrivalAirport = state.airportLookup?.get?.(flight.arrival);
  const distanceNm = getAirportDistanceNm(flight.latitude, flight.longitude, arrivalAirport);
  const speedKt = Number.isFinite(flight.groundspeed) && flight.groundspeed > 0 ? flight.groundspeed : 0;
  const haversineMinutes =
    Number.isFinite(distanceNm) && speedKt > 0
      ? Math.max(1, Math.round((distanceNm / speedKt) * 60))
      : null;

  if (
    Number.isFinite(distanceNm) &&
    distanceNm <= 50 &&
    Number.isFinite(haversineMinutes)
  ) {
    return `Arrives in ${formatDurationMinutes(haversineMinutes)}`;
  }

  if (Number.isFinite(scheduledMinutes) && scheduledMinutes > 0) {
    return `Arrives in ${formatDurationMinutes(scheduledMinutes)}`;
  }

  if (Number.isFinite(haversineMinutes)) {
    return `Arrives in ${formatDurationMinutes(haversineMinutes)}`;
  }

  return "";
}

function getScheduledArrivalDeltaMinutes(scheduledArrivalTime) {
  if (!(scheduledArrivalTime instanceof Date)) {
    return null;
  }

  return Math.round((scheduledArrivalTime.getTime() - Date.now()) / 60000);
}

function formatDurationMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return "under 1 minute";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${hours}h ${minutes}m`;
}

function getAirlineColor(airlineCode, airlineName) {
  if (airlineBrandColors[airlineCode]) {
    return airlineBrandColors[airlineCode];
  }

  const seed = `${airlineCode}${airlineName}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 360;
  }

  return `hsl(${hash} 65% 46%)`;
}

const airlineAliases = {
  "air india": ["airindia"],
  "american airlines": ["american", "americanairlines"],
  "air france": ["airfrance"],
  "british airways": ["britishairways"],
  "delta air lines": ["delta", "deltaairlines"],
  "emirates": ["emiratesairline"],
  "klm": ["royal dutch airlines", "klmroyaldutchairlines"],
  "lufthansa": ["deutsche lufthansa", "lufthansa german airlines"],
  "qantas": ["qantas airways", "qantasairways"],
  "qatar airways": ["qatar", "qatarairways"],
  "singapore airlines": ["singapore", "singaporeairlines"],
  "southwest airlines": ["southwest", "southwestairlines"],
  "swiss": ["swiss international air lines", "swissinternationalairlines"],
  "turkish airlines": ["turkish", "turkishairlines"],
  "united airlines": ["united", "unitedairlines"],
};

const GENERIC_AIRLINE_WORDS = new Set([
  "air",
  "airlines",
  "airways",
  "line",
  "lines",
  "express",
  "international",
  "cargo",
  "aviation",
  "airline",
]);

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("file:", "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replaceAll(".", " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAircraftCode(value) {
  const normalized = String(value || "").toUpperCase().trim();
  if (!normalized) {
    return "UNKNOWN";
  }

  const slashParts = normalized
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  const likelyCode = slashParts.find((part) => /^[A-Z0-9]{3,5}$/.test(part) && !["H", "J", "L", "M", "P", "S"].includes(part));
  if (likelyCode) {
    return likelyCode;
  }

    const compactMatch = normalized.match(/\b(A[0-9]{3}[A-Z]?|B[0-9]{3}[A-Z]?|CRJ[0-9]|E[0-9]{3}|E75L|AT[0-9]{2}|DH8D|MD11|C[0-9]{2}[A-Z])\b/);
  if (compactMatch) {
    return compactMatch[1];
  }

  return normalized.replace(/[^A-Z0-9]/g, "") || "UNKNOWN";
}

function extractRegistration(remarks) {
  const text = String(remarks || "").toUpperCase();
  if (!text) {
    return "";
  }

  const explicitRegMatch = text.match(/\bREG(?:ISTRATION)?\s*[/:\-=\s]\s*([A-Z0-9-]{3,12})\b/);
  if (explicitRegMatch) {
    return explicitRegMatch[1];
  }

  const fallbackPatterns = [
    /\bN\d{1,5}[A-Z]{0,2}\b/,
    /\b(?:HB|LN|OO|OY|PH|PR|SE|SP|SX|TC|TF|VH|VT|XA|XB|XC|YR|ZK|ZS|9K|A4|A6|A7|A9|AP|CC|CS|EI|HA|HK|HZ|JY|LV|LX|OE|OH|OK|OM|PS|PT)-[A-Z0-9]{2,5}\b/,
    /\b(?:HB|LN|OO|OY|PH|PR|SE|SP|SX|TC|TF|VH|VT|XA|XB|XC|YR|ZK|ZS|9K|A4|A6|A7|A9|AP|CC|CS|EI|HA|HK|HZ|JY|LV|LX|OE|OH|OK|OM|PS|PT|D|F|G|B|C)[A-Z0-9]{3,5}\b/,
  ];

  for (const pattern of fallbackPatterns) {
    const fallbackMatch = text.match(pattern);
    if (fallbackMatch) {
      return fallbackMatch[0];
    }
  }

  return "";
}

function normalizeRegistrationComparable(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getRegistrationSearchVariants(registration) {
  const raw = String(registration || "").toUpperCase().trim();
  if (!raw) {
    return [];
  }

  const compact = normalizeRegistrationComparable(raw);
  const variants = new Set([raw, compact]);
  const hyphenatedPrefixes = [
    "HB",
    "LN",
    "OO",
    "OY",
    "PH",
    "PR",
    "SE",
    "SP",
    "SX",
    "TC",
    "TF",
    "VH",
    "VT",
    "XA",
    "XB",
    "XC",
    "YR",
    "ZK",
    "ZS",
    "9K",
    "A4",
    "A6",
    "A7",
    "A9",
    "AP",
    "CC",
    "CS",
    "EI",
    "HA",
    "HK",
    "HZ",
    "JY",
    "LV",
    "LX",
    "OE",
    "OH",
    "OK",
    "OM",
    "PS",
    "PT",
    "D",
    "F",
    "G",
    "B",
    "C",
  ];

  for (const prefix of hyphenatedPrefixes) {
    if (compact.startsWith(prefix) && compact.length > prefix.length + 1) {
      variants.add(`${prefix}-${compact.slice(prefix.length)}`);
    }
  }

  return Array.from(variants);
}

function isAcceptableAircraftPhoto(title, imageInfo) {
  if (!imageInfo) {
    return false;
  }

  const timestamp = imageInfo.timestamp ? new Date(imageInfo.timestamp) : null;
  if (!timestamp || Number.isNaN(timestamp.getTime())) {
    return false;
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MAX_PHOTO_AGE_YEARS);
  if (timestamp < cutoff) {
    return false;
  }

    const normalizedMetadata = normalizeSearchText(extractImageMetadataText(title, imageInfo));
  const blockedTerms = [
      "interior",
      "cabin",
      "cockpit",
      "flight deck",
      "seat",
      "seats",
      "window",
      "galley",
      "lavatory",
      "overhead bin",
      "passenger cabin",
      "flight path",
      "crashes",
      "crash",
      "diagram",
      "map",
      "route map",
      "incident",
      "accident",
      "takes off",
      "stadium",
      "grandstand",
      "race track",
      "athlete",
      "crowd",
      "sport",
      "sports",
      "player",
      "boxing",
      "football",
      "soccer",
      "baseball",
      "horse",
      "horses",
      "rider",
      "cowboy",
      "equestrian",
      "animal",
      "animals",
      "landscape",
      "mountain",
      "field",
      "desert",
    ];

  const requiredAviationTerms = [
    "aircraft",
    "airplane",
    "airliner",
    "boeing",
    "airbus",
    "embraer",
    "bombardier",
    "mcdonnell douglas",
    "cessna",
    "turboprop",
    "landing",
    "takeoff",
    "jet",
    "fuselage",
    "wing",
    "livery",
    "tailfin",
    "nose gear",
    "main gear",
  ];

  if (blockedTerms.some((term) => normalizedMetadata.includes(normalizeSearchText(term)))) {
    return false;
  }

    return requiredAviationTerms.some((term) => normalizedMetadata.includes(normalizeSearchText(term)));
  }

function isAcceptableLogoImage(title, imageInfo) {
  if (!imageInfo) {
    return false;
  }

  const normalizedMetadata = normalizeSearchText(extractImageMetadataText(title, imageInfo));
  const blockedTerms = [
    "aircraft",
    "airplane",
    "airliner",
    "airport",
    "landing",
    "takeoff",
    "jet",
    "fuselage",
    "wing",
    "tailfin",
    "nose gear",
    "main gear",
    "cabin",
    "cockpit",
    "route map",
    "flight path",
    "crash",
    "accident",
  ];

  if (blockedTerms.some((term) => normalizedMetadata.includes(normalizeSearchText(term)))) {
    return false;
  }

  return hasLogoTerms(normalizedMetadata);
}

function isAcceptableAirportArticle(page, airport) {
  if (!page) {
    return false;
  }

  const title = page.title || "";
  const descriptionTerms = Array.isArray(page.terms?.description)
    ? page.terms.description.join(" ")
    : "";
  const normalizedMetadata = normalizeSearchText([title, descriptionTerms].join(" "));
  const airportTokens = [
    normalizeSearchText(airport.name),
    normalizeSearchText(airport.icao),
    normalizeSearchText(airport.iata),
  ].filter(Boolean);
  const blockedTerms = [
    "aircraft",
    "airplane",
    "airliner",
    "boeing",
    "airbus",
    "embraer",
    "bombardier",
    "mcdonnell douglas",
    "jet",
    "livery",
    "tailfin",
    "nose gear",
    "main gear",
    "fuselage",
    "wing",
    "aircraft cabin",
    "cockpit",
    "flight deck",
    "route map",
    "flight path",
    "crash",
    "accident",
    "president",
    "politician",
    "actor",
    "singer",
    "person",
    "horse",
    "cowboy",
  ];

  if (blockedTerms.some((term) => normalizedMetadata.includes(normalizeSearchText(term)))) {
    return false;
  }

  return (
    airportTokens.some((token) => normalizedMetadata.includes(token)) &&
    hasAirportTerms(normalizedMetadata) &&
    Boolean(page.thumbnail?.source)
  );
}

function isAcceptableAirlineArticle(page, airlineTokens) {
  if (!page || !page.thumbnail?.source) {
    return false;
  }

  const title = page.title || "";
  const descriptionTerms = Array.isArray(page.terms?.description)
    ? page.terms.description.join(" ")
    : "";
  const normalizedMetadata = normalizeSearchText([title, descriptionTerms].join(" "));
  return matchesAirline(normalizedMetadata, airlineTokens);
}

function extractImageCoreText(title, imageInfo) {
  const extmetadata = imageInfo?.extmetadata || {};
  return [
    title,
    extmetadata.ObjectName?.value || "",
    extmetadata.ImageDescription?.value || "",
  ]
    .join(" ")
    .replace(/<[^>]*>/g, " ");
}


  function extractImageMetadataText(title, imageInfo) {
    const extmetadata = imageInfo?.extmetadata || {};
    return [
      title,
      extmetadata.ImageDescription?.value || "",
      extmetadata.ObjectName?.value || "",
      extmetadata.Categories?.value || "",
      extmetadata.Artist?.value || "",
      extmetadata.Credit?.value || "",
    ]
      .join(" ")
      .replace(/<[^>]*>/g, " ");
  }

  function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
